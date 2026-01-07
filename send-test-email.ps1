# Send Test Email - NextBoard
Write-Host ""
Write-Host "📧 NextBoard Email Test" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Get email address
$email = Read-Host "Enter your email address to receive the test"

if (-not $email) {
    Write-Host "Email address required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Sending test email to: $email" -ForegroundColor Yellow
Write-Host "This will trigger a daily digest notification..." -ForegroundColor Gray
Write-Host ""

# Wait a moment for server to be ready
Start-Sleep -Seconds 3

try {
    Write-Host "Sending test email..." -ForegroundColor Cyan
    
    # Trigger the cron job
    $body = @{
        type = "daily-digest"
        secret = "test-secret-123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:3005/api/cron/email-notifications" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing
    
    Write-Host ""
    Write-Host "Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Check your email inbox at: $email" -ForegroundColor Cyan
    Write-Host "(Don't forget to check spam folder if you don't see it)" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Response content:" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody -ForegroundColor White
    }
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- Make sure dev server is running (npm run dev)" -ForegroundColor White
    Write-Host "- Check that you are signed in to the app" -ForegroundColor White
    Write-Host "- Visit http://localhost:3005/email-preview first" -ForegroundColor White
}

Write-Host ""
