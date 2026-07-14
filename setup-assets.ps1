# setup-assets.ps1
# Jalankan sekali untuk menyalin gambar logo & background ke folder public/
# Usage: powershell -ExecutionPolicy Bypass -File setup-assets.ps1

$sourceDir = "C:\Users\user\.gemini\antigravity-ide\brain\59e448ba-6efd-4375-8cd6-d3b37b26f36e"
$publicDir  = Join-Path $PSScriptRoot "public"

if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
    Write-Host "📁 Folder public/ dibuat"
}

# Logo
$logoSrc = Join-Path $sourceDir "logo_1784003729635.png"
$logoDst = Join-Path $publicDir "logo.png"
if (Test-Path $logoSrc) {
    Copy-Item $logoSrc -Destination $logoDst -Force
    Write-Host "✅ logo.png  → public/logo.png"
} else {
    Write-Host "⚠️  Tidak ditemukan: $logoSrc"
}

# Background
$bgSrc = Join-Path $sourceDir "bg_1784003744945.png"
$bgDst = Join-Path $publicDir "bg.png"
if (Test-Path $bgSrc) {
    Copy-Item $bgSrc -Destination $bgDst -Force
    Write-Host "✅ bg.png    → public/bg.png"
} else {
    Write-Host "⚠️  Tidak ditemukan: $bgSrc"
}

Write-Host ""
Write-Host "✨ Selesai! Jalankan: npm run dev"
