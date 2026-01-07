# Deploy to Railway Script
# This will login and deploy your updated files

Write-Host "🚀 Deploying to Railway..." -ForegroundColor Green
Write-Host ""

# Check if Railway CLI is installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

Write-Host "🔐 Step 1: Login to Railway" -ForegroundColor Cyan
Write-Host "   (This will open your browser)" -ForegroundColor Gray
railway login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed. Please try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Logged in successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "🔗 Step 2: Linking to project..." -ForegroundColor Cyan
railway link

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link project." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Step 3: Selecting web service..." -ForegroundColor Cyan
railway service
# User will need to select: independent-hope

Write-Host ""
Write-Host "🚀 Step 4: Deploying..." -ForegroundColor Cyan
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment started!" -ForegroundColor Green
    Write-Host "⏱️  Wait 2-3 minutes for deployment to complete" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check status at: https://railway.app/project/be7c39ba-c311-42d0-9523-852b1857ee86" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error above." -ForegroundColor Red
}
