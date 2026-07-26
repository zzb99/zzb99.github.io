import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_ORIGIN = 'https://www.zzb9.cn';
const SITE_HOST = 'www.zzb9.cn';
const LIVE_SITEMAP = `${SITE_ORIGIN}/sitemap.xml`;
const MAX_URLS = 2_000;
const NETWORK_ATTEMPTS = 3;
const SITEMAP_ATTEMPTS = Number.parseInt(process.env.BAIDU_SITEMAP_RETRIES ?? '5', 10);
const scriptDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)));
const fallbackSitemap = resolve(scriptDirectory, '../dist/sitemap.xml');

const sleep = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
const redact = (value) => value.replace(/token=[^&\s]+/gi, 'token=[已隐藏]');
const decodeXml = (value) => value
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
  .replace(/&(amp|lt|gt|quot|apos);/gi, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[name.toLowerCase()]));

function extractLocations(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].replace(/<[^>]+>/g, '').trim()))
    .filter(Boolean);
}

function isSitemapIndex(xml) {
  return /<sitemapindex\b/i.test(xml);
}

async function fetchWithRetry(url, options = {}, attempts = NETWORK_ATTEMPTS) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20_000) });
      if (response.status >= 500 && attempt < attempts) {
        await sleep(attempt * 1_500);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 1_500);
    }
  }
  throw lastError ?? new Error(`请求失败：${redact(String(url))}`);
}

async function fetchLiveSitemap() {
  let lastError;
  for (let attempt = 1; attempt <= Math.max(1, SITEMAP_ATTEMPTS); attempt += 1) {
    try {
      const response = await fetchWithRetry(LIVE_SITEMAP, { headers: { Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' } });
      if (!response.ok) throw new Error(`线上 sitemap 返回 HTTP ${response.status}`);
      return { source: LIVE_SITEMAP, xml: await response.text() };
    } catch (error) {
      lastError = error;
      if (attempt < Math.max(1, SITEMAP_ATTEMPTS)) await sleep(attempt * 2_000);
    }
  }
  throw lastError;
}

async function loadSitemap() {
  try {
    return await fetchLiveSitemap();
  } catch (error) {
    try {
      return { source: `构建产物 ${fallbackSitemap}`, xml: await readFile(fallbackSitemap, 'utf8') };
    } catch {
      throw new Error(`无法读取线上 sitemap，且构建产物不存在：${error.message}`);
    }
  }
}

async function collectSitemapUrls(xml, source, depth = 0) {
  if (depth > 8) throw new Error('sitemap 嵌套层级超过安全上限。');
  const locations = extractLocations(xml);
  if (!isSitemapIndex(xml)) return locations;

  const children = await Promise.all(locations.map(async (location) => {
    let child;
    try {
      child = new URL(location, source.startsWith('http') ? source : SITE_ORIGIN);
    } catch {
      return [];
    }
    if (child.protocol !== 'https:' || child.hostname !== SITE_HOST) return [];
    const response = await fetchWithRetry(child, { headers: { Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' } });
    if (!response.ok) return [];
    return collectSitemapUrls(await response.text(), child.href, depth + 1);
  }));
  return children.flat();
}

function normalizeCandidate(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname !== SITE_HOST) return null;
    url.protocol = 'https:';
    url.hash = '';
    url.search = '';
    if (/\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mjs|pdf|png|svg|txt|webp|woff2?|xml)$/i.test(url.pathname)) return null;
    if (url.pathname === '/sitemap.xml' || url.pathname === '/sitemap-index.xml') return null;
    return url.href;
  } catch {
    return null;
  }
}

function hasNoindex(html, headers) {
  const header = headers.get('x-robots-tag') ?? '';
  return /\bnoindex\b/i.test(header) || /<meta\b[^>]*\bnoindex\b[^>]*>/i.test(html);
}

async function validatePage(url) {
  try {
    const response = await fetchWithRetry(url, {
      redirect: 'manual',
      headers: { 'User-Agent': 'zzb9-baidu-submit/1.0', Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1' },
    });
    if (response.status !== 200) return { url, reason: `HTTP ${response.status}` };
    const type = response.headers.get('content-type') ?? '';
    if (type && !/text\/html|application\/xhtml\+xml/i.test(type)) return { url, reason: `非 HTML 内容：${type}` };
    if (hasNoindex(await response.text(), response.headers)) return { url, reason: 'noindex' };
    return { url, valid: true };
  } catch (error) {
    return { url, reason: `网络错误：${error.message}` };
  }
}

function diagnose(result, status) {
  const message = String(result.message ?? result.error ?? '').toLowerCase();
  if (message.includes('site error')) return 'site error：site 参数与百度验证站点不一致。';
  if (message.includes('site init fail')) return 'site init fail：百度未能初始化此站点的普通收录 API。请在百度后台确认 https://www.zzb9.cn 的 API 准入密钥已保存且该站点仍为已验证状态。';
  if (message.includes('empty content')) return 'empty content：请求体为空或格式错误。';
  if (message.includes('only 2000 urls are allowed once')) return 'only 2000 urls are allowed once：单次 URL 数量超限。';
  if (message.includes('over quota')) return 'over quota：当天可提交配额已用完。';
  if (message.includes('token is not valid')) return 'token is not valid：GitHub Secret 中的准入密钥无效。';
  if (status === 500) return '百度临时异常（HTTP 500），已完成有限重试。';
  return `百度提交失败：HTTP ${status}${result.message ? `，${result.message}` : ''}`;
}

async function submitToBaidu(siteParameter, urls) {
  const endpoint = new URL('http://data.zz.baidu.com/urls');
  endpoint.searchParams.set('site', siteParameter);
  endpoint.searchParams.set('token', token);
  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'User-Agent': 'zzb9-baidu-submit/1.0' },
    body: urls.join('\n'),
  });
  const raw = await response.text();
  try {
    return { status: response.status, result: JSON.parse(raw) };
  } catch {
    throw new Error(`百度返回非 JSON：HTTP ${response.status}`);
  }
}

const token = process.env.BAIDU_PUSH_TOKEN;
if (!token) throw new Error('缺少 BAIDU_PUSH_TOKEN；请在本地环境变量或 GitHub Actions Secret 中设置。');

const sitemap = await loadSitemap();
console.log(`sitemap 来源：${sitemap.source}`);
const extracted = await collectSitemapUrls(sitemap.xml, sitemap.source);
const candidates = [...new Set(extracted.map(normalizeCandidate).filter(Boolean))];
console.log(`提取 URL 数量：${extracted.length}`);
console.log(`过滤后 URL 数量：${candidates.length}`);
if (candidates.length === 0) throw new Error('过滤后没有可提交的 URL。');

const checks = await Promise.all(candidates.map(validatePage));
const validUrls = checks.filter((item) => item.valid).map((item) => item.url).slice(0, MAX_URLS);
const skipped = checks.filter((item) => !item.valid).map(({ url, reason }) => ({ url, reason }));
console.log(`实际提交数量：${validUrls.length}`);
if (skipped.length) console.log(`过滤页面：${JSON.stringify(skipped)}`);
if (validUrls.length === 0) throw new Error('没有返回 HTTP 200、可索引的 HTML URL。');

let submission = await submitToBaidu(SITE_ORIGIN, validUrls);
if (submission.status === 400 && String(submission.result.message ?? '').toLowerCase().includes('site init fail')) {
  // 百度官方工具手册的 API 示例使用 host-only site 参数。仅在后台展示的
  // 带协议参数触发 site init fail 时兼容回退一次；提交 URL 始终保持 HTTPS + www。
  console.log('带协议 site 参数返回 site init fail，按百度官方兼容格式回退一次。');
  submission = await submitToBaidu(SITE_HOST, validUrls);
}
const { status, result } = submission;

console.log(`HTTP 状态码：${status}`);
console.log(`success：${result.success ?? '无'}`);
console.log(`remain：${result.remain ?? '无'}`);
console.log(`not_same_site：${JSON.stringify(result.not_same_site ?? [])}`);
console.log(`not_valid：${JSON.stringify(result.not_valid ?? [])}`);

const success = status === 200
  && Number.isInteger(result.success)
  && result.success > 0
  && Array.isArray(result.not_same_site)
  && result.not_same_site.length === 0
  && Array.isArray(result.not_valid)
  && result.not_valid.length === 0;
if (!success) throw new Error(diagnose(result, status));
