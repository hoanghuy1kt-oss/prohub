# Connect Prohub to GitHub repository

Write-Host "Lien ket voi GitHub Repository" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check if Git is installed
try {
    git --version | Out-Null
    Write-Host "`n[OK] Git da duoc cai dat" -ForegroundColor Green
} catch {
    Write-Host "`n[ERROR] Git chua duoc cai dat!" -ForegroundColor Red
    Write-Host "Cai Git tu: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Hoac GitHub Desktop: https://desktop.github.com/" -ForegroundColor Yellow
    exit 1
}

$repoPath = "C:\Users\Hp\Desktop\Prohub"
$githubUrl = "https://github.com/hoanghuy1kt-oss/prohub.git"

Set-Location $repoPath

# Initialize git if needed
if (-not (Test-Path .git)) {
    Write-Host "`nDang khoi tao Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "[OK] Da khoi tao Git repository" -ForegroundColor Green
}

# Check and add remote
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "`n[OK] Remote da ton tai: $remote" -ForegroundColor Green
} else {
    Write-Host "`nDang them remote GitHub..." -ForegroundColor Yellow
    git remote add origin $githubUrl
    Write-Host "[OK] Da them remote" -ForegroundColor Green
}

# Add files
Write-Host "`nDang them file..." -ForegroundColor Yellow
git add .
Write-Host "[OK] Da them file" -ForegroundColor Green

# Commit
Write-Host "`nDang commit..." -ForegroundColor Yellow
git commit -m "Initial commit - Prohub project" 2>&1 | Out-Null
Write-Host "[OK] Da commit" -ForegroundColor Green

# Rename branch to main
Write-Host "`nDang doi ten branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "[OK] Da doi ten branch" -ForegroundColor Green

Write-Host "`n==============================" -ForegroundColor Cyan
Write-Host "San sang push len GitHub!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "`nChay lenh sau de push:" -ForegroundColor Yellow
Write-Host "  git push -u origin main" -ForegroundColor White
Write-Host "`nNeu gap loi authentication:" -ForegroundColor Yellow
Write-Host "  1. Tao Personal Access Token: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "  2. Chon quyen 'repo'" -ForegroundColor White
Write-Host "  3. Dung token lam password khi push" -ForegroundColor White
