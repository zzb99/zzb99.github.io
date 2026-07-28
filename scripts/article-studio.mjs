import { createServer } from 'node:http';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = fileURLToPath(new URL('.', import.meta.url));
const rootDirectory = resolve(scriptDirectory, '..');
const articlesDirectory = join(rootDirectory, 'src', 'content', 'articles');
const appFile = join(scriptDirectory, 'article-studio.html');
const host = '127.0.0.1';
const port = Number(process.env.ARTICLE_STUDIO_PORT ?? 4311);
let isPublishing = false;

const json = (response, status, body) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
};

const text = (response, status, body, type = 'text/plain; charset=utf-8') => {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  response.end(body);
};

const readJson = async (request) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 800_000) throw new Error('文章内容不能超过 800KB。');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new Error('请求内容无法识别，请刷新页面后重试。'); }
};

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
};

const yamlString = (value) => JSON.stringify(value);

const nextDateSlug = (pubDate, occupied) => {
  let sequence = 1;
  while (occupied.has(`${pubDate}-${String(sequence).padStart(2, '0')}`)) sequence += 1;
  return `${pubDate}-${String(sequence).padStart(2, '0')}`;
};

const localArticleSlugs = async () => new Set(
  (await readdir(articlesDirectory))
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.slice(0, -3)),
);

const descriptionFrom = (body, title) => {
  const paragraph = body.split(/\r?\n\s*\r?\n/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith('#') && !part.startsWith('```') && !part.startsWith('- ') && !part.startsWith('>'));
  const plain = (paragraph ?? title)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 110 ? `${plain.slice(0, 109).replace(/[，。；、\s]+$/g, '')}…` : plain;
};

const parseArticle = async ({ content = '', category = '', pubDate = '', summary = '' }) => {
  const errors = [];
  const source = String(content).replace(/^\uFEFF/, '').trim();
  const normalizedCategory = String(category).trim();
  const normalizedDate = String(pubDate).trim();
  const normalizedSummary = String(summary).trim();
  const match = source.match(/^#\s+(.+?)\s*(?:\r?\n|$)/);
  const title = match?.[1]?.trim() ?? '';
  const body = match ? source.slice(match[0].length).trim() : '';

  if (!title) errors.push('第一行必须是“# 文章标题”。');
  if (title.length > 100) errors.push('标题请控制在 100 个字符以内。');
  if (!body) errors.push('正文不能为空。');
  if (!normalizedCategory) errors.push('请填写分类；分类可以自由命名。');
  if (normalizedCategory.length > 40) errors.push('分类请控制在 40 个字符以内。');
  if (!validDate(normalizedDate)) errors.push('发布日期应为合法的 YYYY-MM-DD。');
  if (normalizedSummary.length > 160) errors.push('文章摘要请控制在 160 个字符以内。');

  const slug = validDate(normalizedDate)
    ? nextDateSlug(normalizedDate, await localArticleSlugs())
    : '';
  return { errors, title, body, category: normalizedCategory, pubDate: normalizedDate, slug, description: normalizedSummary || descriptionFrom(body, title) };
};

const categories = async () => {
  const files = await readdir(articlesDirectory);
  const found = new Set();
  await Promise.all(files.filter((file) => file.endsWith('.md')).map(async (file) => {
    const source = await readFile(join(articlesDirectory, file), 'utf8');
    const match = source.match(/^category:\s*(.+)$/m);
    if (!match) return;
    const raw = match[1].trim();
    try { found.add(JSON.parse(raw)); } catch { found.add(raw.replace(/^['"]|['"]$/g, '')); }
  }));
  return [...found].filter(Boolean).sort((a, b) => a.localeCompare(b, 'zh-CN'));
};

const run = (command, args, { input = '' } = {}) => new Promise((resolveRun) => {
  const commandLine = [command, ...args]
    .map((value) => `"${String(value).replace(/"/g, '\\"')}"`)
    .join(' ');
  const isWindowsBatch = process.platform === 'win32' && command.toLowerCase().endsWith('.cmd');
  const child = isWindowsBatch
    ? spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', commandLine], { cwd: rootDirectory, windowsHide: true })
    : spawn(command, args, { cwd: rootDirectory, windowsHide: true });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  if (input) child.stdin.end(input);
  child.once('error', (error) => resolveRun({ ok: false, output: error.message }));
  child.once('close', (code) => resolveRun({ ok: code === 0, output: output.slice(-10_000) }));
});

const actionUrl = async () => {
  const remote = await run('git', ['remote', 'get-url', 'origin']);
  const match = remote.output.match(/github\.com[/:]([^/]+\/[^/\s]+?)(?:\.git)?\s*$/);
  return match ? `https://github.com/${match[1]}/actions` : '';
};

const githubApi = async (args, body) => {
  const result = await run('gh', ['api', ...args, ...(body ? ['--input', '-'] : [])], { input: body ? JSON.stringify(body) : '' });
  if (!result.ok) throw new Error(result.output || 'GitHub API 请求失败。');
  return JSON.parse(result.output);
};

const nextPublishSlug = async (pubDate) => {
  const remote = await run('git', ['remote', 'get-url', 'origin']);
  const repository = remote.output.match(/github\.com[/:]([^/]+\/[^/\s]+?)(?:\.git)?\s*$/)?.[1];
  if (!repository) throw new Error('Unable to identify the GitHub repository.');
  const ref = await githubApi([`repos/${repository}/git/ref/heads/main`]);
  const tree = await githubApi([`repos/${repository}/git/trees/${ref.object.sha}?recursive=1`]);
  const remoteSlugs = (tree.tree ?? [])
    .map((item) => item.path)
    .filter((path) => /^src\/content\/articles\/[^/]+\.md$/.test(path))
    .map((path) => path.slice('src/content/articles/'.length, -3));
  return nextDateSlug(pubDate, new Set([...(await localArticleSlugs()), ...remoteSlugs]));
};

const publishThroughGithubApi = async (articleFile, title) => {
  const remote = await run('git', ['remote', 'get-url', 'origin']);
  const repository = remote.output.match(/github\.com[/:]([^/]+\/[^/\s]+?)(?:\.git)?\s*$/)?.[1];
  if (!repository) throw new Error('无法识别 GitHub 仓库地址。');
  const ref = await githubApi([`repos/${repository}/git/ref/heads/main`]);
  const baseCommit = await githubApi([`repos/${repository}/git/commits/${ref.object.sha}`]);
  const blob = await githubApi([`repos/${repository}/git/blobs`, '--method', 'POST'], { content: (await readFile(articleFile)).toString('base64'), encoding: 'base64' });
  const relativePath = articleFile.slice(rootDirectory.length + 1).replace(/\\/g, '/');
  const tree = await githubApi([`repos/${repository}/git/trees`, '--method', 'POST'], { base_tree: baseCommit.tree.sha, tree: [{ path: relativePath, mode: '100644', type: 'blob', sha: blob.sha }] });
  const commit = await githubApi([`repos/${repository}/git/commits`, '--method', 'POST'], { message: `content: publish ${title}`, tree: tree.sha, parents: [ref.object.sha] });
  await githubApi([`repos/${repository}/git/refs/heads/main`, '--method', 'PATCH'], { sha: commit.sha, force: false });
  return commit.sha;
};

const publish = async (payload) => {
  if (isPublishing) throw new Error('正在发布另一篇文章，请等待完成。');
  isPublishing = true;
  let articleFile = '';
  try {
    const article = await parseArticle(payload);
    if (article.errors.length) throw new Error(article.errors.join('\n'));
    article.slug = await nextPublishSlug(article.pubDate);
    articleFile = join(articlesDirectory, `${article.slug}.md`);
    const markdown = `---\ntitle: ${yamlString(article.title)}\nslug: ${article.slug}\ndescription: ${yamlString(article.description)}\ncategory: ${yamlString(article.category)}\npubDate: ${article.pubDate}\nupdatedDate: ${article.pubDate}\n---\n\n${article.body}\n`;
    await writeFile(articleFile, markdown, { encoding: 'utf8', flag: 'wx' });

    for (const [command, args, label] of [
      ['pnpm.cmd', ['run', 'check'], '类型检查'],
      ['pnpm.cmd', ['run', 'build'], '构建'],
      ['pnpm.cmd', ['run', 'test:links'], '链接检查'],
      ['pnpm.cmd', ['run', 'test:static'], '静态站点检查'],
    ]) {
      const result = await run(command, args);
      if (!result.ok) {
        await writeFile(articleFile, markdown, { encoding: 'utf8' });
        throw new Error(`${label}失败。文章文件已保留，未提交或推送。\n\n${result.output}`);
      }
    }

    const commitId = await publishThroughGithubApi(articleFile, article.title);
    return { title: article.title, slug: article.slug, url: `https://www.zzb9.cn/articles/${article.slug}/`, actionUrl: await actionUrl(), commitId };
  } finally {
    isPublishing = false;
  }
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${host}:${port}`);
    if (request.method === 'GET' && url.pathname === '/') {
      return text(response, 200, await readFile(appFile, 'utf8'), 'text/html; charset=utf-8');
    }
    if (request.method === 'GET' && url.pathname === '/api/bootstrap') {
      return json(response, 200, { date: localDate(), categories: await categories() });
    }
    if (request.method === 'POST' && url.pathname === '/api/validate') {
      const article = await parseArticle(await readJson(request));
      return json(response, 200, article);
    }
    if (request.method === 'POST' && url.pathname === '/api/publish') {
      const result = await publish(await readJson(request));
      return json(response, 201, result);
    }
    return json(response, 404, { error: '未找到该地址。' });
  } catch (error) {
    return json(response, 400, { error: error.message || '发生未知错误。' });
  }
});

const openBrowser = () => {
  if (process.env.ARTICLE_STUDIO_NO_BROWSER === '1') return;
  const address = `http://${host}:${port}`;
  spawn('cmd.exe', ['/d', '/c', 'start', '', address], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
};

server.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    openBrowser();
    process.exit(0);
  }
  console.error(error);
  process.exit(1);
});

await mkdir(articlesDirectory, { recursive: true });
server.listen(port, host, () => {
  console.log(`Article Studio: http://${host}:${port}`);
  openBrowser();
});
