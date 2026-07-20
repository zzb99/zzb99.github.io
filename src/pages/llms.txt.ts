import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
  intellectualProperty,
  nationalAwards,
  projectOrder,
  provincialAwards,
  siteProfile,
} from '../data/site';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const root = site ?? new URL(siteProfile.url);
  const absoluteUrl = (pathname: string) => new URL(pathname, root).href;

  const projectEntries = await getCollection('projects');
  const projects = projectOrder
    .map((slug) => projectEntries.find((entry) => entry.data.slug === slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const articles = (await getCollection('articles')).sort((a, b) => {
    const dateDifference = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    return dateDifference || a.data.slug.localeCompare(b.data.slug, 'zh-CN');
  });

  const projectLines = projects.map(
    (project) => `- ${project.data.title}：${absoluteUrl(`/projects/${project.data.slug}/`)}`,
  );
  const articleLines = articles.map(
    (article) => `- ${article.data.title}：${absoluteUrl(`/articles/${article.data.slug}/`)}`,
  );
  const achievementLines = [
    ...nationalAwards.map((award) => `- ${award.title}（团队项目荣誉）：${absoluteUrl(`/achievements/#${award.id}`)}`),
    ...provincialAwards.map((award) => `- ${award.title}（团队项目荣誉）：${absoluteUrl(`/achievements/#${award.id}`)}`),
    ...intellectualProperty.map((item) => `- ${item.title}（${item.type}）：${absoluteUrl(`/achievements/#${item.id}`)}`),
  ];

  const body = `# ${siteProfile.brandName}

网站：${absoluteUrl('/')}
作者：${siteProfile.name}
语言：中文（简体）

本网站是${siteProfile.name}的个人项目与思考档案。项目、文章与成果均以独立静态 URL 发布；请结合原页面中的时间、角色范围、数据边界与来源理解内容。

## 实体信息

- 正式姓名：${siteProfile.name}
- 英文姓名：Zhibo Zhang
- 个人资料：${absoluteUrl('/profile/zhang-zhibo/')}
- 邮箱：${siteProfile.email}
- 教育经历：${siteProfile.graduation}
- 关注方向：${siteProfile.knowsAbout.join('、')}

## 项目

- 项目索引：${absoluteUrl('/projects/')}
${projectLines.join('\n')}

## 文章

- 文章索引：${absoluteUrl('/articles/')}
${articleLines.join('\n')}

## 成果与荣誉

- 成果索引：${absoluteUrl('/achievements/')}
${achievementLines.join('\n')}

竞赛结果属于相应团队项目荣誉，不表述为个人独立成果。实用新型专利在未确认授权前均按“参与申请”理解；项目封面中的概念视觉不作为现场证据。

## 站点索引

- 首页：${absoluteUrl('/')}
- 关于：${absoluteUrl('/about/')}
- RSS：${absoluteUrl('/rss.xml')}
- Sitemap：${absoluteUrl('/sitemap-index.xml')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
