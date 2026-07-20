import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const required = ['index.html', '404.html', 'projects/index.html', 'articles/index.html', 'achievements/index.html', 'about/index.html', 'profile/zhang-zhibo/index.html', 'rss.xml', 'robots.txt', 'sitemap-index.xml', 'CNAME', 'llms.txt', 'site.webmanifest', 'favicon.svg', 'og-default.png', 'baidu_verify_codeva-luikAz4Kmm.html'];
const projectSlugs = ['hotel-new-media-growth', 'shentong-market-expansion', 'automotive-lead-growth', 'warehouse-intelligent-robot', 'executive-ip-planning', 'ecommerce-growth', 'housekeeping-geo', 'postal-sorting-robot', 'jingjie', 'panxiu-archive', 'xianyu-feishu-tool'];
const articleSlugs = ['ai-search-and-enterprise-content', 'why-personal-site-matters', 'from-idea-to-project', 'geo-is-not-name-mention', 'ai-redesigns-repetitive-operations', 'how-to-present-project-results'];

function readStructuredData(html, label) {
  const match = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`${label} is missing JSON-LD.`);
  const value = JSON.parse(match[1]);
  return Array.isArray(value) ? value : [value];
}

function findStructuredType(entries, type, label) {
  const entry = entries.find((item) => item?.['@type'] === type);
  if (!entry) throw new Error(`${label} is missing ${type} structured data.`);
  return entry;
}

for (const file of required) await access(join(dist, file));

const projectPages = new Map();
for (const slug of projectSlugs) {
  const page = join(dist, 'projects', slug, 'index.html');
  await access(page);
  const html = await readFile(page, 'utf8');
  const entries = readStructuredData(html, `Project ${slug}`);
  const creativeWork = findStructuredType(entries, 'CreativeWork', `Project ${slug}`);
  findStructuredType(entries, 'BreadcrumbList', `Project ${slug}`);
  if (!creativeWork.headline || !creativeWork.description) throw new Error(`Project SEO fields are incomplete: ${slug}`);
  if (creativeWork.dateCreated && !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(creativeWork.dateCreated)) throw new Error(`Project has a fuzzy dateCreated value: ${slug}`);
  projectPages.set(slug, { html, creativeWork });
}

for (const slug of articleSlugs) {
  const page = join(dist, 'articles', slug, 'index.html');
  await access(page);
  const html = await readFile(page, 'utf8');
  if (!html.includes('"@type":"Article"') || !html.includes('"@type":"BreadcrumbList"') || !html.includes('dateModified')) throw new Error(`Article metadata is incomplete: ${slug}`);
}

const home = await readFile(join(dist, 'index.html'), 'utf8');
const about = await readFile(join(dist, 'about/index.html'), 'utf8');
const profile = await readFile(join(dist, 'profile/zhang-zhibo/index.html'), 'utf8');
const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
const rss = await readFile(join(dist, 'rss.xml'), 'utf8');
const llms = await readFile(join(dist, 'llms.txt'), 'utf8');
const articlesIndex = await readFile(join(dist, 'articles/index.html'), 'utf8');

if (!home.includes('application/ld+json') || !home.includes('canonical') || !home.includes('"@type":"WebSite"') || !home.includes('twitter:card') || !home.includes('张智博的思考空间')) throw new Error('Home metadata is incomplete.');
if (!robots.includes('sitemap-index.xml') || !robots.includes('Allow: /')) throw new Error('robots.txt is incomplete or blocks crawling.');
if (!rss.includes('<rss')) throw new Error('RSS is malformed.');
if (!articlesIndex.includes('"@type":"CollectionPage"') || !articlesIndex.includes('"@type":"ItemList"')) throw new Error('Article index metadata is incomplete.');

const homeData = readStructuredData(home, 'Home');
const aboutData = readStructuredData(about, 'About page');
const profileData = readStructuredData(profile, 'Profile page');
const homePerson = findStructuredType(homeData, 'Person', 'Home');
const profilePerson = findStructuredType(profileData, 'Person', 'Profile page');

for (const [label, person] of [['home', homePerson], ['profile', profilePerson]]) {
  if (person['@id'] !== 'https://www.zzb9.cn/#person') throw new Error(`${label} Person entity ID is inconsistent.`);
  if (person.alternateName !== 'Zhibo Zhang') throw new Error(`${label} Person alternateName is not factual.`);
  if ('award' in person) throw new Error(`${label} Person incorrectly claims team awards.`);
}

findStructuredType(aboutData, 'AboutPage', 'About page');
if (aboutData.some((item) => item?.['@type'] === 'ProfilePage')) throw new Error('About page must not be a ProfilePage.');
if (profileData.filter((item) => item?.['@type'] === 'ProfilePage').length !== 1) throw new Error('Person profile must expose exactly one ProfilePage.');
findStructuredType(profileData, 'BreadcrumbList', 'Profile page');
if (!profile.includes('张智博人物资料') || !profile.includes('https://www.zzb9.cn/profile/zhang-zhibo/')) throw new Error('Person profile metadata is incomplete.');
if (!profile.includes('最后更新：2026-07-20') || !profile.includes('"dateModified":"2026-07-20"')) throw new Error('Person profile update date is inconsistent.');

const warehouseProject = projectPages.get('warehouse-intelligent-robot');
if (warehouseProject.creativeWork.headline !== '仓储智存智能机器人项目' || !warehouseProject.html.includes('<title>仓储智存智能机器人项目</title>')) throw new Error('Project seoTitle is not used by the detail page.');
if (!warehouseProject.html.includes(`name="description" content="${warehouseProject.creativeWork.description}"`)) throw new Error('Project seoDescription is not used by the detail page.');
if ('dateCreated' in projectPages.get('hotel-new-media-growth').creativeWork || 'dateCreated' in projectPages.get('panxiu-archive').creativeWork) throw new Error('Fuzzy project periods must not be emitted as dateCreated.');
if (projectPages.get('housekeeping-geo').creativeWork.dateCreated !== '2025') throw new Error('A valid project year should remain available as dateCreated.');

if (!llms.includes('2026 年 7 月毕业') || llms.includes('2026 年 6 月毕业')) throw new Error('llms.txt does not use the current profile facts.');
for (const slug of [...projectSlugs, ...articleSlugs]) {
  const collection = projectSlugs.includes(slug) ? 'projects' : 'articles';
  if (!llms.includes(`https://www.zzb9.cn/${collection}/${slug}/`)) throw new Error(`llms.txt is missing ${collection}/${slug}.`);
}
if (!llms.includes('竞赛结果属于相应团队项目荣誉') || !llms.includes('实用新型专利在未确认授权前')) throw new Error('llms.txt is missing factual scope notes.');

for (const [label, html] of [['home', home], ['articles index', articlesIndex], ['profile', profile], ['article', await readFile(join(dist, 'articles', 'geo-is-not-name-mention', 'index.html'), 'utf8')], ['project', projectPages.get('hotel-new-media-growth').html]]) {
  if (!html.includes('property="og:image:alt"') || !html.includes('name="twitter:image:alt"')) throw new Error(`${label} is missing share-image alt metadata.`);
}

const baiduVerification = await readFile(join(dist, 'baidu_verify_codeva-luikAz4Kmm.html'), 'utf8');
if (baiduVerification.trim() !== 'b5ba6f2cc6b546232ae51de7f511fe01') throw new Error('Baidu verification file changed.');

console.log(`Verified ${required.length + projectSlugs.length + articleSlugs.length} required static artifacts.`);
