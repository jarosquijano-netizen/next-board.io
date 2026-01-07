Write-Host "Testing NextBoard Email System..." -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Sending request to email endpoint..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3005/api/cron/email-notifications?type=daily-digest&secret=test-secret-123" `
        -Method GET
    
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "========" -ForegroundColor Green
    Write-Host ""
    Write-Host "Email sent successfully!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "Check your inbox: jarosquijano@gmail.com" -ForegroundColor Cyan
    Write-Host "(Don't forget to check spam/junk folder!)" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Server Response:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Troubleshooting Tips:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're signed in to the app at http://localhost:3005" -ForegroundColor White
    Write-Host "2. Try visiting http://localhost:3005/email-preview to see templates" -ForegroundColor White
    Write-Host "3. Check the terminal for server errors" -ForegroundColor White
}





