import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { once } from 'node:events';

const url = process.env.SITE_URL ?? 'http://127.0.0.1:4321/';
const chromePath = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : undefined);
// chrome-launcher creates an isolated temporary profile and removes it on kill.
const chrome = await launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] });
let result;
try {
  result = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
} finally {
  // Close our own child directly on Windows before launcher cleanup. Its
  // shell-based taskkill can be unavailable in a restricted environment.
  if (process.platform === 'win32' && chrome.process.exitCode === null && chrome.process.signalCode === null) {
    const closed = once(chrome.process, 'close');
    if (!chrome.process.kill()) throw new Error('Could not close the Lighthouse browser.');
    await closed;
  }
  try { await chrome.kill(); } catch (error) { if (error.code !== 'EPERM') throw error; }
}
const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key, category]) => [key, Math.round(category.score * 100)]));
const audit = Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(id => [id, result.lhr.audits[id]?.displayValue]));
console.log(JSON.stringify({ url, scores, audit }, null, 2));
const minimumScores = { performance: 85, accessibility: 90, 'best-practices': 90, seo: 90 };
if (Object.entries(minimumScores).some(([category, minimum]) => scores[category] < minimum)) process.exitCode = 1;
