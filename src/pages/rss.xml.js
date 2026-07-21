import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

const author = '张智博';

export async function GET(context) {
  const articles = (await getCollection('articles')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: '张智博 · 文章',
    description: '关于人工智能、产品创新与项目实践的记录。',
    site: context.site,
    xmlns: { media: 'http://search.yahoo.com/mrss/' },
    customData: `<managingEditor>${author}</managingEditor>`,
    items: articles.map((article) => {
      const link = `/articles/${article.data.slug}/`;
      const cover = new URL(article.data.hero ?? '/og-default.png', context.site).href;

      return {
        title: article.data.title,
        description: article.data.description,
        pubDate: article.data.pubDate,
        author,
        link,
        categories: [article.data.category],
        customData: [
          `<atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${new URL(link, context.site).href}" rel="alternate" type="text/html" />`,
          `<media:thumbnail url="${cover}" />`,
        ].filter(Boolean).join(''),
      };
    }),
  });
}
