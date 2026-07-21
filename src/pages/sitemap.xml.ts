import { getCollection } from 'astro:content';

const site = 'https://www.zzb9.cn';
const staticPaths = ['/', '/projects/', '/articles/', '/about/', '/achievements/', '/profile/zhang-zhibo/'];

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
}[character] ?? character));

export async function GET() {
  const [articles, projects] = await Promise.all([
    getCollection('articles'),
    getCollection('projects'),
  ]);

  const urls = [
    ...staticPaths.map((path) => new URL(path, site).href),
    ...articles.map((article) => new URL(`/articles/${article.data.slug}/`, site).href),
    ...projects.map((project) => new URL(`/projects/${project.data.slug}/`, site).href),
  ];

  const body = urls
    .sort()
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
