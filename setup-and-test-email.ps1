# Complete email test setup
Write-Host ""
Write-Host "NextBoard Email Test - Complete Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Add user to database
Write-Host "Step 1: Adding user to database..." -ForegroundColor Yellow
node add-test-user.js jarosquijano@gmail.com "Jaros"

Write-Host ""
Write-Host "Step 2: Waiting 2 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Step 2: Test email
Write-Host ""
Write-Host "Step 3: Sending test email..." -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3005/api/cron/email-notifications?type=daily-digest&secret=test-secret-123" `
        -Method GET
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    
    if ($response.result.success -gt 0) {
        Write-Host "Email sent to: jarosquijano@gmail.com" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Check your inbox in 1-2 minutes!" -ForegroundColor Green
        Write-Host "(Check spam/junk folder too)" -ForegroundColor Yellow
    } else {
        Write-Host "No emails sent yet." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "This is normal! To receive emails, you need:" -ForegroundColor White
        Write-Host "1. Cards with due dates in your boards" -ForegroundColor Gray
        Write-Host "2. Overdue or due-today items" -ForegroundColor Gray
        Write-Host ""
        Write-Host "The system is working - it just has nothing to notify you about yet!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
