$ErrorActionPreference = 'Stop'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$target = Join-Path $PSScriptRoot "..\backup\manual-$stamp"
New-Item -ItemType Directory -Force -Path $target | Out-Null
git bundle create (Join-Path $target 'repository.bundle') --all
git archive -o (Join-Path $target 'source.zip') HEAD
@("Created: $(Get-Date -Format o)", "Commit: $(git rev-parse HEAD)") | Set-Content -Encoding utf8 (Join-Path $target 'README.txt')
Write-Host "Backup created: $target"
