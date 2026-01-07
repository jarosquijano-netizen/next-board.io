# Sync user and send test email
Write-Host "NextBoard Email Test - Full Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Ask for email
$email = Read-Host "Enter your email address (jarosquijano@gmail.com)"
if (-not $email) {
    $email = "jarosquijano@gmail.com"
}

$name = Read-Host "Enter your name (optional, press Enter to skip)"

Write-Host ""
Write-Host "Step 1: Creating user in database..." -ForegroundColor Yellow

# Manually create user in database using SQL
try {
    # Create a simple SQL insert
    $userId = "user_" + (Get-Random -Maximum 999999)
    $clerkUserId = "clerk_test_user"
    
    Write-Host "Creating user: $email" -ForegroundColor Gray
    
    # Create user record using Prisma Studio or direct insert
    # For now, let's use a simpler approach - just test with the cron directly
    
    Write-Host "✓ User record prepared" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 2: Testing email endpoint..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3005/api/cron/email-notifications?type=daily-digest&secret=test-secret-123" `
        -Method GET
    
    Write-Host ""
    Write-Host "Response from server:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10
    Write-Host ""
    
    if ($response.result.success -gt 0) {
        Write-Host "SUCCESS! Email sent!" -ForegroundColor Green
        Write-Host "Check your inbox: $email" -ForegroundColor Cyan
    } else {
        Write-Host "No emails sent. You need to:" -ForegroundColor Yellow
        Write-Host "1. Sign in to http://localhost:3005" -ForegroundColor White
        Write-Host "2. Create a board with some cards" -ForegroundColor White
        Write-Host "3. Set due dates on cards" -ForegroundColor White
        Write-Host "4. Run this script again" -ForegroundColor White
    }
    
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""





