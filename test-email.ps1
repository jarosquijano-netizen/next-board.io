# Quick Email Test Script
Write-Host "Testing NextBoard Email System" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check for required environment variables
if (-not $env:RESEND_API_KEY) {
    Write-Host "RESEND_API_KEY not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Quick Setup:" -ForegroundColor Yellow
    Write-Host "1. Sign up at https://resend.com (FREE)" -ForegroundColor White
    Write-Host "2. Get your API key" -ForegroundColor White
    Write-Host "3. Add these to your .env file:" -ForegroundColor White
    Write-Host ""
    Write-Host "RESEND_API_KEY=re_your_key_here" -ForegroundColor Gray
    Write-Host "RESEND_FROM_EMAIL=onboarding@resend.dev" -ForegroundColor Gray
    Write-Host "RESEND_FROM_NAME=NextBoard" -ForegroundColor Gray
    Write-Host "APP_URL=http://localhost:3005" -ForegroundColor Gray
    Write-Host "CRON_SECRET=test-secret-123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Restart your dev server: npm run dev" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    exit 1
}

Write-Host "Resend API Key: Found" -ForegroundColor Green
Write-Host ""

# Ask for email to send test to
$testEmail = Read-Host "Enter your email address to receive test notification"

if (-not $testEmail) {
    Write-Host "Email address required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Sending test email to: $testEmail" -ForegroundColor Cyan
Write-Host ""

# Create a test notification request
$body = @{
    type = "daily-digest"
    secret = if ($env:CRON_SECRET) { $env:CRON_SECRET } else { "test-secret-123" }
    testEmail = $testEmail
} | ConvertTo-Json

# Send test request
try {
    Write-Host "Triggering email notification..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri "http://localhost:3005/api/cron/email-notifications" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing
    
    Write-Host ""
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Check your email inbox (and spam folder)!" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "Error sending test email:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "- Dev server is running (npm run dev)" -ForegroundColor White
    Write-Host "- You have a user synced in the database" -ForegroundColor White
    Write-Host "- All environment variables are set" -ForegroundColor White
}





