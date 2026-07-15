import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseURL = process.env.SITE_URL ?? 'http://127.0.0.1:4321';
const chrome = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const projectSlugs = ['postal-sorting-robot', 'jingjie', 'ecommerce-growth', 'housekeeping-geo', 'panxiu-archive', 'xianyu-feishu-tool'];
const articleSlugs = ['ai-search-and-enterprise-content', 'why-personal-site-matters', 'from-idea-to-project', 'geo-is-not-name-mention', 'ai-redesigns-repetitive-operations', 'how-to-present-project-results'];
const routes = ['/', '/projects/', ...projectSlugs.map(slug => `/projects/${slug}/`), '/articles/', ...articleSlugs.map(slug => `/articles/${slug}/`), '/achievements/', '/about/', '/rss.xml', '/robots.txt', '/sitemap-index.xml', '/llms.txt', '/not-found/'];
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktopContext.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
for (const route of routes) {
  const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
  const expectedStatus = route === '/not-found/' ? 404 : 200;
  if (!response || response.status() !== expectedStatus) throw new Error(`${route} returned ${response?.status()}`);
  if (!['/rss.xml', '/robots.txt', '/sitemap-index.xml', '/llms.txt'].includes(route) && await page.locator('main h1').count() !== 1) throw new Error(`${route} must have exactly one main H1.`);
}
await page.goto(baseURL, { waitUntil: 'networkidle' });
const desktopAxe = await new AxeBuilder({ page }).analyze();
if (desktopAxe.violations.length) throw new Error(`Desktop axe violations: ${desktopAxe.violations.map(v => v.id).join(', ')}`);
const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const mobile = await mobileContext.newPage();
await mobile.goto(baseURL, { waitUntil: 'networkidle' });
const menu = mobile.getByRole('button', { name: '打开导航菜单' });
await menu.click();
if (await mobile.getByRole('navigation', { name: '主导航' }).count() !== 1) throw new Error('Mobile navigation did not open.');
await mobile.keyboard.press('Escape');
const mobileAxe = await new AxeBuilder({ page: mobile }).analyze();
if (mobileAxe.violations.length) throw new Error(`Mobile axe violations: ${mobileAxe.violations.map(v => v.id).join(', ')}`);
await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
console.log(`E2E and axe passed for ${routes.length} routes, desktop, and mobile.`);
