$ErrorActionPreference = 'Stop'
pnpm.cmd check
pnpm.cmd build
pnpm.cmd test:links
pnpm.cmd test:static
pnpm.cmd test:preview
if (git status --porcelain) { throw 'Working tree is not clean. Commit the verified change before deployment.' }
git push origin main
Write-Host 'GitHub Pages deployment was triggered. Verify https://www.zzb9.cn/ after the workflow completes.'
