# 张智博个人网站

一个以 Astro 构建的纯静态个人网站。项目、文章和成果会在构建时输出为独立 HTML，适合 GitHub Pages 与自定义域名部署。

## 技术栈

- Astro 7 与 TypeScript
- Markdown 内容集合
- GitHub Pages 静态部署

## 安装与启动

```powershell
pnpm install
./scripts/start-local.ps1
```

默认访问 `http://127.0.0.1:4321/`。也可用 `pnpm dev` 启动。

## 构建与验证

```powershell
./scripts/build.ps1
```

该脚本会执行类型检查、静态构建、链接检查和静态产物检查。构建结果在 `dist/`。

## 内容与部署

- 项目：`src/content/projects/`
- 文章：`src/content/articles/`
- 内容维护：[CONTENT_GUIDE.md](CONTENT_GUIDE.md)
- SEO/GEO：[SEO_GEO_GUIDE.md](SEO_GEO_GUIDE.md)
- 部署与回滚：[DEPLOYMENT.md](DEPLOYMENT.md)
- 内容核验：[CONTENT_REVIEW.md](CONTENT_REVIEW.md)

## 备份与发布

`./scripts/backup.ps1` 创建 Git bundle 和源码归档；`./scripts/deploy.ps1` 在本地质量检查通过且工作区干净时推送 `main`，触发 GitHub Pages 发布。
