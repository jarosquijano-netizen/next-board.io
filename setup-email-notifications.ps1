# NextBoard Email Notification Setup Script
# Run this after setting up your Resend account

Write-Host "🚀 NextBoard Email Notification Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file first." -ForegroundColor Yellow
    exit 1
}

Write-Host "📧 Email Notification Configuration" -ForegroundColor Green
Write-Host ""

# Prompt for Resend API Key
$resendKey = Read-Host "Enter your Resend API Key (from resend.com/api-keys)"
if (-not $resendKey) {
    Write-Host "❌ Resend API Key is required!" -ForegroundColor Red
    exit 1
}

# Prompt for from email
$fromEmail = Read-Host "Enter FROM email address (e.g., notifications@yourdomain.com or onboarding@resend.dev)"
if (-not $fromEmail) {
    $fromEmail = "onboarding@resend.dev"
    Write-Host "Using default: $fromEmail" -ForegroundColor Yellow
}

# Prompt for app URL
$appUrl = Read-Host "Enter APP URL (e.g., http://localhost:3005 or https://your-app.railway.app)"
if (-not $appUrl) {
    $appUrl = "http://localhost:3005"
    Write-Host "Using default: $appUrl" -ForegroundColor Yellow
}

# Generate CRON_SECRET
$cronSecret = -join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host ""
Write-Host "✅ Configuration complete!" -ForegroundColor Green
Write-Host ""

# Add to .env
$envContent = Get-Content ".env" -Raw

# Check if variables already exist
if ($envContent -match "RESEND_API_KEY") {
    Write-Host "⚠️  RESEND_API_KEY already exists in .env" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Skipping .env update. Please manually add the variables." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Add these to your .env:" -ForegroundColor Cyan
        Write-Host "RESEND_API_KEY=$resendKey"
        Write-Host "RESEND_FROM_EMAIL=$fromEmail"
        Write-Host "RESEND_FROM_NAME=NextBoard"
        Write-Host "APP_URL=$appUrl"
        Write-Host "CRON_SECRET=$cronSecret"
        exit 0
    }
}

# Append to .env
$envAdditions = @"

# Email Notifications (Added by setup-email-notifications.ps1)
RESEND_API_KEY=$resendKey
RESEND_FROM_EMAIL=$fromEmail
RESEND_FROM_NAME=NextBoard
APP_URL=$appUrl
CRON_SECRET=$cronSecret
"@

Add-Content -Path ".env" -Value $envAdditions

Write-Host "✅ Environment variables added to .env" -ForegroundColor Green
Write-Host ""

# Restart dev server prompt
Write-Host "⚠️  Important: Restart your dev server to load new environment variables" -ForegroundColor Yellow
Write-Host ""

Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart dev server: npm run dev" -ForegroundColor White
Write-Host "2. Sync your user: POST /api/user/sync" -ForegroundColor White
Write-Host "3. Test emails: See EMAIL_NOTIFICATION_SETUP.md" -ForegroundColor White
Write-Host "4. Configure preferences: GET/PUT /api/notifications/preferences" -ForegroundColor White
Write-Host ""

Write-Host "✅ Setup complete! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Read EMAIL_NOTIFICATION_SETUP.md for full documentation." -ForegroundColor Cyan





