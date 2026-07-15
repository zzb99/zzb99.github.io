# 内容维护

项目写在 `src/content/projects/`，文章写在 `src/content/articles/`。每个 Markdown 文件的 frontmatter 控制标题、slug、摘要、分类、日期和主视觉，正文会自动生成独立静态页面。

新增项目或文章后执行 `pnpm build`；图片放入 `public/assets/`，并在 frontmatter 中以 `/assets/文件名` 引用。首页精选项目由 `featured: true` 控制。
