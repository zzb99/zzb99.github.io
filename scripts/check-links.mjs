import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
async function walk(dir) { const entries = await readdir(dir,{withFileTypes:true}); const files = await Promise.all(entries.map(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)])); return files.flat(); }
const files = (await walk(root)).filter(f=>f.endsWith('.html')); const broken=[];
for (const file of files) { const html=await readFile(file,'utf8'); for (const href of html.matchAll(/(?:href|src)="([^"]+)"/g)) { const value=href[1]; if (value.startsWith('http')||value.startsWith('#')||value.startsWith('mailto:')||value.startsWith('data:')) continue; const url=new URL(value,'https://www.zzb9.cn'); if (url.pathname.endsWith('/')||url.pathname==='/') continue; if (!url.pathname.includes('.')) continue; try { await readFile(join(root,url.pathname)); } catch { broken.push(`${file}: ${value}`); } } }
if(broken.length){console.error(broken.join('\n'));process.exit(1)} console.log(`Checked ${files.length} HTML files; no broken local asset links.`);
