# Set Anthropic API Key in Railway
# Run this after: railway login

Write-Host "🔑 Setting Anthropic API Key in Railway..." -ForegroundColor Green
Write-Host ""

# Make sure you're logged in first
Write-Host "Step 1: Make sure you're logged in to Railway" -ForegroundColor Yellow
Write-Host "   Run: railway login" -ForegroundColor Gray
Write-Host ""

# Link to project
Write-Host "Step 2: Link to your project" -ForegroundColor Yellow
Write-Host "   Run: railway link" -ForegroundColor Gray
Write-Host ""

# Select web service
Write-Host "Step 3: Select your web service" -ForegroundColor Yellow
Write-Host "   Run: railway service" -ForegroundColor Gray
Write-Host "   (Select your web service, NOT Postgres)" -ForegroundColor Gray
Write-Host ""

# Set the API key
Write-Host "Step 4: Setting API key..." -ForegroundColor Cyan
railway variables --set ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ API key set successfully!" -ForegroundColor Green
    Write-Host "⏱️  Railway will auto-redeploy in 2-3 minutes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verify it's set:" -ForegroundColor Cyan
    Write-Host "   railway variables" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Failed to set API key. Make sure you're logged in and linked to the project." -ForegroundColor Red
    Write-Host ""
    Write-Host "Try manually:" -ForegroundColor Yellow
    Write-Host "   1. railway login" -ForegroundColor Gray
    Write-Host "   2. railway link" -ForegroundColor Gray
    Write-Host "   3. railway service" -ForegroundColor Gray
    Write-Host "   4. railway variables --set ANTHROPIC_API_KEY=`"sk-ant-your-actual-key-here`"" -ForegroundColor Gray
}
