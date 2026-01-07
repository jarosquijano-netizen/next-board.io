# Wait for server then test
Write-Host "Waiting for server to start (20 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host "Testing email endpoint..." -ForegroundColor Cyan

try {
    $result = Invoke-RestMethod -Uri "http://localhost:3005/api/cron/email-notifications?type=daily-digest&secret=test-secret-123" -Method GET
    Write-Host ""
    Write-Host "SUCCESS! Email endpoint is working!" -ForegroundColor Green
    Write-Host ""
    $result | ConvertTo-Json
    Write-Host ""
    Write-Host "Check your email: jarosquijano@gmail.com" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try refreshing http://localhost:3005/email-preview to see the templates" -ForegroundColor Yellow
}





