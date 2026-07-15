# SEO 与 GEO

## IndexNow

根目录已保留 IndexNow 验证文件。需要主动通知时运行 `pnpm indexnow`；该命令仅提交 sitemap，网络失败会记录提示但不会影响构建或部署。

站点提供 IndexNow key：`https://www.zzb9.cn/6a3bcb3ca6dd448b9d5b0ad39d15e5c8.txt`。发布重要内容后，可将更新 URL 与这个 key 通过 IndexNow API 提交；不要提交测试或未公开页面。

Astro 在构建时为项目与文章生成独立 HTML、canonical、Open Graph 元数据、JSON-LD、sitemap 和 RSS。`public/robots.txt` 指向站点地图。

内容应说明具体主体、场景、时间与可核验边界；不要重复关键词或公开未经确认的数据。每次发布后运行 `pnpm build` 和 `pnpm test:links`。
