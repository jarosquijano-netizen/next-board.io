# Railway Redeploy Script
# Run this in PowerShell

Write-Host "🚀 Redeploying NextBoard to Railway..." -ForegroundColor Green
Write-Host ""

# Check if Railway CLI is installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

Write-Host "📋 Steps to redeploy:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Login to Railway:" -ForegroundColor Yellow
Write-Host "   railway login" -ForegroundColor White
Write-Host ""
Write-Host "2. Link to project:" -ForegroundColor Yellow
Write-Host "   railway link" -ForegroundColor White
Write-Host "   (Select: magnificent-kindness)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Select web service:" -ForegroundColor Yellow
Write-Host "   railway service" -ForegroundColor White
Write-Host "   (Select: independent-hope)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy:" -ForegroundColor Yellow
Write-Host "   railway up" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Wait 2-3 minutes for deployment to complete" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or use Railway Dashboard:" -ForegroundColor Cyan
Write-Host "1. Go to: https://railway.app/project/be7c39ba-c311-42d0-9523-852b1857ee86" -ForegroundColor White
Write-Host "2. Click 'independent-hope' service" -ForegroundColor White
Write-Host "3. Click 'Deployments' tab" -ForegroundColor White
Write-Host "4. Click 'Redeploy' or trigger a new deployment" -ForegroundColor White
