# Simple test - just checks if endpoint is working
Write-Host "Testing email notification endpoint..." -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 10

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3005/api/cron/email-notifications?type=daily-digest&secret=test-secret-123" `
        -Method GET
    
    Write-Host "Success! Endpoint is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "Check your email at: jarosquijano@gmail.com" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Server might still be starting. Wait 10 more seconds and try again." -ForegroundColor Yellow
}





