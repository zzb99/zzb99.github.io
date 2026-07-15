# 部署与回滚

当前部署为 GitHub Pages：推送 `main` 会触发 `.github/workflows/deploy-pages.yml`，构建 `dist/` 并发布纯静态文件。`public/CNAME` 保留 `www.zzb9.cn`。

上线前执行 `pnpm check`、`pnpm build`、`pnpm test:links`。本次回滚点是 Git 标签 `pre-redesign-20260715-181337`，完整离线备份位于 `backup/pre-redesign-20260715-181337/`。回滚：`git checkout main`、`git reset --hard pre-redesign-20260715-181337`、`git push --force-with-lease origin main`。
