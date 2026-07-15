import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const [kind, slug, ...args] = process.argv.slice(2); const draft = args.includes('--draft'); const title = args.filter(arg => arg !== '--draft').join(' ').trim();
if (!['article', 'project'].includes(kind) || !/^[a-z0-9-]+$/.test(slug ?? '') || !title) throw new Error('Usage: pnpm content:new <article|project> <english-slug> <title> [--draft]');
const isArticle = kind === 'article'; const directory = join('src', 'content', draft ? 'drafts' : (isArticle ? 'articles' : 'projects')); const file = join(directory, `${slug}.md`);
try { await access(file); throw new Error(`${file} already exists.`); } catch (error) { if (!error.code || error.code !== 'ENOENT') throw error; }
await mkdir(directory, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const frontmatter = isArticle ? `---\ntitle: ${title}\nslug: ${slug}\ndescription: 一句话说明这篇文章讨论的问题。\ncategory: 未分类\npubDate: ${date}\nupdatedDate: ${date}\nseoTitle: ${title}\nseoDescription: 一句话说明这篇文章讨论的问题。\n---\n\n## 问题\n\n写下真实的观察与背景。\n\n## 思考\n\n说明判断、过程和边界。\n\n## 后续\n\n补充可持续更新的结论。\n` : `---\ntitle: ${title}\nslug: ${slug}\nsummary: 一句话说明项目解决的问题。\ncategory: 未分类\nyear: '${new Date().getFullYear()}'\nstatus: 持续整理\nrole: 项目参与方向\nhero: /assets/portfolio-dashboard.png\nfeatured: false\nmetrics: []\nseoTitle: ${title}\nseoDescription: 一句话说明项目解决的问题。\n---\n\n## 项目背景\n\n写下真实场景与问题。\n\n## 方案设计\n\n说明方案、过程和边界。\n\n## 项目复盘\n\n补充阶段结果与下一步。\n`;
await writeFile(file, frontmatter, { encoding: 'utf8', flag: 'wx' }); console.log(`Created ${draft ? 'draft' : 'published'} ${file}`);
