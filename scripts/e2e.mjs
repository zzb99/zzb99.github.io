import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseURL = process.env.SITE_URL ?? 'http://127.0.0.1:4321';
const chrome = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/google-chrome');
const projectSlugs = [
  'hotel-new-media-growth',
  'shentong-market-expansion',
  'automotive-lead-growth',
  'warehouse-intelligent-robot',
  'executive-ip-planning',
  'ecommerce-growth',
  'housekeeping-geo',
  'postal-sorting-robot',
  'jingjie',
  'panxiu-archive',
  'xianyu-feishu-tool',
];
const articleSlugs = ['ai-search-and-enterprise-content', 'why-personal-site-matters', 'from-idea-to-project', 'geo-is-not-name-mention', 'ai-redesigns-repetitive-operations', 'how-to-present-project-results'];
const textRoutes = ['/rss.xml', '/robots.txt', '/sitemap-index.xml', '/llms.txt', '/baidu_verify_codeva-luikAz4Kmm.html'];
const routes = ['/', '/projects/', ...projectSlugs.map(slug => `/projects/${slug}/`), '/articles/', ...articleSlugs.map(slug => `/articles/${slug}/`), '/achievements/', '/about/', '/profile/zhang-zhibo/', ...textRoutes, '/not-found/'];

const browser = await chromium.launch({ headless: true, executablePath: chrome });
const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktopContext.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

for (const route of routes) {
  const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
  const expectedStatus = route === '/not-found/' ? 404 : 200;
  if (!response || response.status() !== expectedStatus) throw new Error(`${route} returned ${response?.status()}`);
  if (!textRoutes.includes(route) && await page.locator('main h1').count() !== 1) throw new Error(`${route} must have exactly one main H1.`);
}

await page.goto(baseURL, { waitUntil: 'networkidle' });
const desktopAxe = await new AxeBuilder({ page }).analyze();
if (desktopAxe.violations.length) {
  const detail = desktopAxe.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`).join('; ');
  throw new Error(`Desktop axe violations: ${detail}`);
}

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const mobile = await mobileContext.newPage();
await mobile.goto(baseURL, { waitUntil: 'networkidle' });
const menu = mobile.getByRole('button', { name: '打开导航菜单' });
await menu.click();
if (await mobile.getByRole('navigation', { name: '主导航' }).count() !== 1) throw new Error('Mobile navigation did not open.');
await mobile.keyboard.press('Escape');
if (await menu.getAttribute('aria-expanded') !== 'false') throw new Error('Escape did not close mobile navigation.');
await menu.click();
if (await mobile.locator('.menu-button').getAttribute('aria-expanded') !== 'true') throw new Error('Mobile menu did not expand.');
await mobile.setViewportSize({ width: 1280, height: 900 });
await mobile.waitForFunction(() => !document.querySelector('main').inert && !document.body.classList.contains('menu-open'));
if (await mobile.locator('.menu-button').getAttribute('aria-expanded') !== 'false') throw new Error('Menu remained expanded after switching to desktop.');
await mobile.setViewportSize({ width: 390, height: 844 });
const mobileAxe = await new AxeBuilder({ page: mobile }).analyze();
if (mobileAxe.violations.length) {
  const detail = mobileAxe.violations.map(violation => `${violation.id}: ${violation.nodes.map(node => node.target.join(' ')).join(', ')}`).join('; ');
  throw new Error(`Mobile axe violations: ${detail}`);
}

await page.goto(`${baseURL}/articles/`, { waitUntil: 'networkidle' });
const search = page.getByRole('searchbox', { name: '搜索文章' });
const articleItems = page.locator('.searchable-article');
const totalArticles = await articleItems.count();
await search.fill('这是一条不会匹配任何文章的搜索');
await page.getByRole('button', { name: '查看全部文章', exact: true }).waitFor({ state: 'visible' });
if (await page.locator('.searchable-article:visible').count()) throw new Error('Unmatched search must hide all articles.');
await page.getByRole('button', { name: '查看全部文章', exact: true }).click();
if (await page.locator('.searchable-article:visible').count() !== totalArticles || await search.inputValue()) throw new Error('Reset did not restore all articles.');
await page.getByRole('button', { name: 'GEO 与内容', exact: true }).click();
await search.fill('ＡＩ 搜索');
await page.waitForFunction(() => document.querySelector('.article-result-count').textContent.includes('找到 1 篇'));
const filteredURL = page.url();
await page.locator('.searchable-article:visible a').click();
await page.waitForURL('**/articles/ai-search-and-enterprise-content/');
await page.goBack({ waitUntil: 'networkidle' });
if (page.url() !== filteredURL || await search.inputValue() !== 'ＡＩ 搜索' || await page.locator('.searchable-article:visible').count() !== 1) throw new Error('Returning from an article lost search state.');
await page.reload({ waitUntil: 'networkidle' });
if (await page.locator('.searchable-article:visible').count() !== 1) throw new Error('Reload lost search state.');
if (await page.locator('.searchable-article[aria-pressed]').count()) throw new Error('Article cards must not receive filter button state.');
await page.getByRole('button', { name: '清除搜索与筛选', exact: true }).click();
if (new URL(page.url()).search || await page.locator('.searchable-article:visible').count() !== totalArticles) throw new Error('Clear filters did not restore default URL and results.');

// Detail pages share a reading layout, including articles without their own cover.
const readingRoutes = [
  '/projects/hotel-new-media-growth/',
  '/projects/postal-sorting-robot/',
  '/articles/2026-07-28-01/',
  '/articles/ai-search-and-enterprise-content/',
];
for (const route of readingRoutes) {
  await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
  const layout = await page.evaluate(() => {
    const text = document.querySelector('.reading-main').getBoundingClientRect();
    const rail = document.querySelector('.reading-visual').getBoundingClientRect();
    const prose = document.querySelector('.prose').getBoundingClientRect();
    const image = document.querySelector('.reading-visual img');
    return { leftOfImage: text.right < rail.left, readableWidth: text.width >= 540 && text.width <= 680 && Math.abs(prose.width - text.width) < 2, loaded: image ? image.complete && image.naturalWidth > 0 : Boolean(document.querySelector('.reading-map a')) };
  });
  if (!layout.leftOfImage || !layout.readableWidth || !layout.loaded) throw new Error(`Invalid desktop reading layout: ${route}`);
  await page.mouse.wheel(0, 450);
  await page.waitForFunction(() => Math.abs(document.querySelector('.reading-visual').getBoundingClientRect().top - 108) < 2);
  const detailAxe = await new AxeBuilder({ page }).analyze();
  if (detailAxe.violations.length) throw new Error(`Detail accessibility: ${route}: ${detailAxe.violations.map(item => item.id).join(', ')}`);
  if (route.startsWith('/projects/')) {
    await page.getByText('项目资料与推进记录', { exact: true }).click();
    if (!await page.getByRole('heading', { name: '项目事实', exact: true }).isVisible()) throw new Error(`Project archive did not open: ${route}`);
  } else {
    await page.locator('.article-toc-mobile summary').click();
    const destination = await page.locator('.article-toc-mobile nav a').first().getAttribute('href');
    await page.locator('.article-toc-mobile nav a').first().click();
    await page.waitForFunction(hash => decodeURIComponent(location.hash) === hash && !document.querySelector('.article-toc-mobile').open, destination);
  }
  await mobile.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
  const narrow = await mobile.evaluate(() => {
    const image = document.querySelector('.reading-visual').getBoundingClientRect();
    const header = document.querySelector('.reading-header').getBoundingClientRect();
    const prose = document.querySelector('.prose').getBoundingClientRect();
    const hasImage = Boolean(document.querySelector('.reading-visual img'));
    return { stacked: hasImage ? header.bottom <= image.top && image.bottom <= prose.top : header.bottom <= prose.top, overflow: document.documentElement.scrollWidth > innerWidth, imageHeight: image.height };
  });
  if (!narrow.stacked || narrow.overflow || narrow.imageHeight > 281) throw new Error(`Invalid mobile reading layout: ${route}`);
  const narrowAxe = await new AxeBuilder({ page: mobile }).analyze();
  if (narrowAxe.violations.length) throw new Error(`Mobile detail accessibility: ${route}: ${narrowAxe.violations.map(item => item.id).join(', ')}`);
}


await page.goto(baseURL, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
if (!await page.evaluate(() => [...document.fonts].some(font => font.family.includes('Site Noto Sans SC') && font.status === 'loaded'))) throw new Error('Bundled font failed to load.');
await page.goto(baseURL + '/projects/', { waitUntil: 'networkidle' });
const coverLayout = await page.locator('.selected-projects .project-card img').evaluateAll(images => images.every(image => { const r = image.getBoundingClientRect(); return image.complete && image.naturalWidth > 0 && r.height < 300 && r.width > 250; }));
if (!coverLayout) throw new Error('Featured project covers are stretched or missing.');
await page.locator('a[href="#project-showcase"]').click();
await page.waitForFunction(() => { const y = document.querySelector('#project-showcase').getBoundingClientRect().top; return y >= 70 && y < 140; });
if (await page.locator('.project-directory__item').count() !== projectSlugs.length) throw new Error('Project directory does not expose all projects.');
const projectIndexAxe = await new AxeBuilder({ page }).analyze();
if (projectIndexAxe.violations.length) throw new Error('Project index accessibility: ' + projectIndexAxe.violations.map(v => v.id).join(', '));
await mobile.goto(baseURL + '/about/', { waitUntil: 'networkidle' });
await mobile.locator('.profile-archive > summary').filter({ hasText: '资料与出处' }).click();
if (!await mobile.locator('#materials-title').isVisible()) throw new Error('Profile sources cannot be expanded.');
await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
console.log(`E2E and axe passed for ${routes.length} routes, desktop, mobile, menu resize, article search recovery, and ${readingRoutes.length} split reading pages.`);
