param([int]$Port = 4321)
$ErrorActionPreference = 'Stop'
pnpm.cmd dev -- --port $Port
