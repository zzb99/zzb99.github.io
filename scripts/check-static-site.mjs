import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const required = ['index.html','404.html','projects/index.html','articles/index.html','achievements/index.html','about/index.html','profile/zhang-zhibo/index.html','rss.xml','robots.txt','sitemap-index.xml','CNAME','llms.txt','site.webmanifest','favicon.svg','og-default.png','baidu_verify_codeva-luikAz4Kmm.html'];
const projectSlugs = ['hotel-new-media-growth','shentong-market-expansion','automotive-lead-growth','warehouse-intelligent-robot','executive-ip-planning','ecommerce-growth','housekeeping-geo','postal-sorting-robot','jingjie','panxiu-archive','xianyu-feishu-tool'];
const articleSlugs = ['ai-search-and-enterprise-content','why-personal-site-matters','from-idea-to-project','geo-is-not-name-mention','ai-redesigns-repetitive-operations','how-to-present-project-results'];
for (const file of required) await access(join(dist,file));
for (const slug of projectSlugs) { const page = join(dist,'projects',slug,'index.html'); await access(page); const html = await readFile(page,'utf8'); if (!html.includes('"@type":"CreativeWork"') || !html.includes('"@type":"BreadcrumbList"')) throw new Error(`Project metadata is incomplete: ${slug}`); }
for (const slug of articleSlugs) { const page = join(dist,'articles',slug,'index.html'); await access(page); const html = await readFile(page,'utf8'); if (!html.includes('"@type":"Article"') || !html.includes('"@type":"BreadcrumbList"') || !html.includes('dateModified')) throw new Error(`Article metadata is incomplete: ${slug}`); }
const home = await readFile(join(dist,'index.html'),'utf8'); const robots = await readFile(join(dist,'robots.txt'),'utf8'); const rss = await readFile(join(dist,'rss.xml'),'utf8');
const articlesIndex = await readFile(join(dist,'articles/index.html'),'utf8');
if (!home.includes('application/ld+json') || !home.includes('canonical') || !home.includes('"@type":"Person"') || !home.includes('"@type":"WebSite"') || !home.includes('twitter:card') || !home.includes('张智博的思考空间')) throw new Error('Home metadata is incomplete.');
if (!robots.includes('sitemap-index.xml')) throw new Error('robots.txt does not expose the sitemap.');
if (!rss.includes('<rss')) throw new Error('RSS is malformed.');
if (!articlesIndex.includes('"@type":"CollectionPage"') || !articlesIndex.includes('"@type":"ItemList"')) throw new Error('Article index metadata is incomplete.');
const profile = await readFile(join(dist,'profile/zhang-zhibo/index.html'),'utf8');
if (!profile.includes('张智博人物资料') || !profile.includes('"@type":"ProfilePage"') || !profile.includes('"@type":"Person"') || !profile.includes('"@type":"BreadcrumbList"') || !profile.includes('https://www.zzb9.cn/profile/zhang-zhibo/')) throw new Error('Person profile metadata is incomplete.');
if (!profile.includes('最后更新：2026-07-20') || !profile.includes('"dateModified":"2026-07-20"')) throw new Error('Person profile update date is inconsistent.');
if (!home.includes('"@id":"https://www.zzb9.cn/#person"') || !profile.includes('"@id":"https://www.zzb9.cn/#person"')) throw new Error('Person entity ID is inconsistent.');
if (!robots.includes('Allow: /')) throw new Error('robots.txt blocks crawling.');
for (const [label, html] of [['home', home], ['articles index', articlesIndex], ['profile', profile], ['article', await readFile(join(dist,'articles','geo-is-not-name-mention','index.html'),'utf8')], ['project', await readFile(join(dist,'projects','hotel-new-media-growth','index.html'),'utf8')]]) {
  if (!html.includes('property="og:image:alt"') || !html.includes('name="twitter:image:alt"')) throw new Error(`${label} is missing share-image alt metadata.`);
}
const baiduVerification = await readFile(join(dist,'baidu_verify_codeva-luikAz4Kmm.html'),'utf8');
if (baiduVerification.trim() !== 'b5ba6f2cc6b546232ae51de7f511fe01') throw new Error('Baidu verification file changed.');
console.log(`Verified ${required.length + projectSlugs.length + articleSlugs.length} required static artifacts.`);
