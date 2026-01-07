#!/usr/bin/env pwsh
# Quick test to send email via our cron endpoint

Write-Host "`nTESTING EMAIL NOTIFICATION SYSTEM`n" -ForegroundColor Cyan

# Wait for server to be ready
Write-Host "Waiting for server..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Send test email
Write-Host "`nTriggering daily digest email..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3005/api/cron/email-notifications?type=daily-digest&secret=test-secret-123" -Method GET
    
    Write-Host "`nEmail trigger successful!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    
    Write-Host "`nCheck your email inbox (jarosquijano@gmail.com)" -ForegroundColor Cyan
    Write-Host "   - Check SPAM folder if not in inbox" -ForegroundColor Gray
    Write-Host "   - Email from: onboarding@resend.dev" -ForegroundColor Gray
    
} catch {
    Write-Host "`nFailed to trigger email" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`nTest complete!" -ForegroundColor Green
