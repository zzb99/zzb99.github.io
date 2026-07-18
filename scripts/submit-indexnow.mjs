const host = 'www.zzb9.cn';
const key = '6a3bcb3ca6dd448b9d5b0ad39d15e5c8';
const endpoint = 'https://api.indexnow.org/indexnow';
const paths = [
  '/',
  '/projects/',
  '/projects/hotel-new-media-growth/',
  '/projects/shentong-market-expansion/',
  '/projects/automotive-lead-growth/',
  '/projects/warehouse-intelligent-robot/',
  '/projects/executive-ip-planning/',
  '/projects/ecommerce-growth/',
  '/projects/housekeeping-geo/',
  '/projects/postal-sorting-robot/',
  '/projects/jingjie/',
  '/projects/panxiu-archive/',
  '/projects/xianyu-feishu-tool/',
  '/achievements/',
  '/articles/',
  '/articles/ai-redesigns-repetitive-operations/',
  '/articles/ai-search-and-enterprise-content/',
  '/articles/from-idea-to-project/',
  '/articles/geo-is-not-name-mention/',
  '/articles/how-to-present-project-results/',
  '/articles/why-personal-site-matters/',
  '/about/',
  '/sitemap-index.xml',
];
const payload = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: paths.map(path => `https://${host}${path}`) };

try {
  const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`IndexNow returned ${response.status}`);
  console.log(`IndexNow accepted ${payload.urlList.length} updated URLs.`);
} catch (error) {
  console.warn(`IndexNow notification skipped: ${error.message}`);
}
