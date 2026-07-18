const host = 'www.zzb9.cn';
const key = '0e8f87b4f1ac4eceb9f6b5e802679692';
const endpoint = 'https://api.indexnow.org/indexnow';
const sitemapIndex = `https://${host}/sitemap-index.xml`;

const extractLocations = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());

const sitemapResponse = await fetch(sitemapIndex, { signal: AbortSignal.timeout(10_000) });
if (!sitemapResponse.ok) throw new Error(`Sitemap index returned ${sitemapResponse.status}`);

const sitemapUrls = extractLocations(await sitemapResponse.text());
const urlCandidates = (await Promise.all(sitemapUrls.map(async (sitemapUrl) => {
  const url = new URL(sitemapUrl);
  if (url.protocol !== 'https:' || url.host !== host) return [];
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  return response.ok ? extractLocations(await response.text()) : [];
}))).flat();

const canonicalUrls = [...new Set(urlCandidates)].filter((value) => {
  const url = new URL(value);
  return url.protocol === 'https:' && url.host === host;
});

const validUrls = (await Promise.all(canonicalUrls.map(async (url) => {
  try {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
    return response.status === 200 ? url : null;
  } catch {
    return null;
  }
}))).filter(Boolean);

const payload = {
  host,
  key,
  keyLocation: `https://${host}/${key}.txt`,
  urlList: validUrls,
};

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(10_000),
});

console.log(JSON.stringify({ submittedUrls: validUrls.length, status: response.status, success: response.status === 200 || response.status === 202 }));
if (response.status !== 200 && response.status !== 202) process.exitCode = 1;
