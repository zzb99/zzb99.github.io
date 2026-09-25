import { readFile, writeFile } from 'node:fs/promises';

// Rebuild the small, locally hosted Noto Sans SC subset after homepage copy changes.
// The full Unicode-range slices remain available for text on every other page.
const html = await readFile('dist/index.html', 'utf8');
const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
if (!body) throw new Error('Build the site before updating the homepage font.');
const visibleText = body
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;/g, ' ');
const characters = [...new Set([...visibleText].filter((character) => !/\s/u.test(character)))].sort();
if (characters.length < 150 || characters.length > 1400) throw new Error(`Unexpected homepage character count: ${characters.length}`);

const fontCssUrl = new URL('https://fonts.googleapis.com/css2');
fontCssUrl.searchParams.set('family', 'Noto Sans SC:wght@300..600');
fontCssUrl.searchParams.set('display', 'swap');
fontCssUrl.searchParams.set('text', characters.join(''));
const cssResponse = await fetch(fontCssUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' } });
if (!cssResponse.ok) throw new Error(`Google Fonts CSS returned ${cssResponse.status}`);
const fontUrl = (await cssResponse.text()).match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
if (!fontUrl) throw new Error('Google Fonts did not return a WOFF2 URL.');
const fontResponse = await fetch(fontUrl);
if (!fontResponse.ok) throw new Error(`Google Fonts file returned ${fontResponse.status}`);
const font = Buffer.from(await fontResponse.arrayBuffer());
if (font.toString('ascii', 0, 4) !== 'wOF2') throw new Error('Expected a WOFF2 font file.');

const cssPath = 'src/styles/fonts.css';
const css = await readFile(cssPath, 'utf8');
const subsetBlock = /\/\* Shared homepage characters take priority over the full-language fallback subsets\. \*\/[\s\S]*?\}\s*$/;
if (!subsetBlock.test(css)) throw new Error('Homepage font face block was not found.');
const range = characters.map((character) => `U+${character.codePointAt(0).toString(16)}`).join(',');
const updated = css.replace(subsetBlock, `/* Shared homepage characters take priority over the full-language fallback subsets. */\n@font-face {\n  font-family: 'Site Noto Sans SC';\n  font-style: normal;\n  font-weight: 300 600;\n  font-display: swap;\n  src: url(/fonts/noto-sans-sc/home.woff2) format('woff2');\n  unicode-range: ${range};\n}\n`);
await writeFile('public/fonts/noto-sans-sc/home.woff2', font);
await writeFile(cssPath, updated);
console.log(`Homepage subset: ${characters.length} characters, ${font.length} bytes`);
