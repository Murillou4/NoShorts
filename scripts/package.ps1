param(
  [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ManifestPath = Join-Path $Root "manifest.json"
$Manifest = Get-Content -Path $ManifestPath -Raw | ConvertFrom-Json
$Version = $Manifest.version
$PackageName = "NoShorts-$Version.zip"
$OutDir = Join-Path $Root $OutputDir
$Stage = Join-Path $OutDir "_package"
$ZipPath = Join-Path $OutDir $PackageName

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Remove-Item -Path $Stage -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path $ZipPath -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $Stage | Out-Null

$Items = @(
  "manifest.json",
  "src",
  "ui",
  "icons",
  "_locales"
)

foreach ($Item in $Items) {
  $Source = Join-Path $Root $Item
  $Destination = Join-Path $Stage $Item
  Copy-Item -Path $Source -Destination $Destination -Recurse -Force
}

Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $ZipPath -CompressionLevel Optimal
Remove-Item -Path $Stage -Recurse -Force

Write-Host "Pacote criado: $ZipPath"
