import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

const url = process.env.SITE_URL ?? 'http://127.0.0.1:4321/';
const userDataDir = resolve('.codex/lighthouse-profile');
await mkdir(userDataDir, { recursive: true });
const chrome = await launch({ chromePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', userDataDir, chromeFlags: ['--headless=new', '--no-sandbox'] });
const result = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
try { await chrome.kill(); } catch (error) { if (error.code !== 'EPERM') throw error; }
const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key, category]) => [key, Math.round(category.score * 100)]));
const audit = Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(id => [id, result.lhr.audits[id]?.displayValue]));
console.log(JSON.stringify({ url, scores, audit }, null, 2));
if (Object.values(scores).some(score => score < 90)) process.exitCode = 1;
