# Set New Anthropic API Key in Railway
# Run this after: railway login

# IMPORTANT: Replace this with your actual API key from Anthropic Console
# Get it from: https://console.anthropic.com/ → API Keys → Create Key
$NEW_API_KEY = "sk-ant-your-actual-key-here"

Write-Host "🔑 Setting New Anthropic API Key in Railway..." -ForegroundColor Green
Write-Host ""

# Check if Railway CLI is available
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or set it manually in Railway Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://railway.app" -ForegroundColor Gray
    Write-Host "   2. Your project → Web service → Variables" -ForegroundColor Gray
    Write-Host "   3. Edit ANTHROPIC_API_KEY" -ForegroundColor Gray
    Write-Host "   4. Paste: $NEW_API_KEY" -ForegroundColor Gray
    exit 1
}

Write-Host "Step 1: Make sure you're logged in to Railway" -ForegroundColor Yellow
Write-Host "   If not logged in, run: railway login" -ForegroundColor Gray
Write-Host ""

# Link to project
Write-Host "Step 2: Linking to project..." -ForegroundColor Cyan
railway link
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link project. Please try manually." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Selecting web service..." -ForegroundColor Cyan
Write-Host "   (Select your WEB SERVICE, NOT Postgres)" -ForegroundColor Yellow
railway service
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to select service." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Setting new API key..." -ForegroundColor Cyan
railway variables --set ANTHROPIC_API_KEY="$NEW_API_KEY"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ API key set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 5: Verifying..." -ForegroundColor Cyan
    railway variables | Select-String "ANTHROPIC_API_KEY"
    
    Write-Host ""
    Write-Host "✅ Done! Railway will auto-redeploy in 2-3 minutes" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Wait 2-3 minutes for redeployment" -ForegroundColor Gray
    Write-Host "   2. Check Railway logs for: '🔑 Anthropic API Key detected'" -ForegroundColor Gray
    Write-Host "   3. Test processing a transcript" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Failed to set API key." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set it manually in Railway Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://railway.app" -ForegroundColor Gray
    Write-Host "   2. Your project → Web service → Variables" -ForegroundColor Gray
    Write-Host "   3. Edit ANTHROPIC_API_KEY" -ForegroundColor Gray
    Write-Host "   4. Paste: $NEW_API_KEY" -ForegroundColor Gray
}
