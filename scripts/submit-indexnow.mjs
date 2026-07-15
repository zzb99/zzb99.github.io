const host = 'www.zzb9.cn';
const key = '6a3bcb3ca6dd448b9d5b0ad39d15e5c8';
const endpoint = 'https://api.indexnow.org/indexnow';
const payload = { host, key, keyLocation: `https://${host}/${key}.txt`, urlList: [`https://${host}/sitemap-index.xml`] };

try {
  const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`IndexNow returned ${response.status}`);
  console.log('IndexNow sitemap notification accepted.');
} catch (error) {
  console.warn(`IndexNow notification skipped: ${error.message}`);
}
