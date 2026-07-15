$ErrorActionPreference = 'Stop'
pnpm.cmd check
pnpm.cmd build
pnpm.cmd test:links
pnpm.cmd test:static
pnpm.cmd test:e2e
pnpm.cmd audit:lighthouse
