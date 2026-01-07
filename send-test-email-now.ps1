#!/usr/bin/env pwsh
# Direct test email - sends immediately to your logged-in account

Write-Host "`nDIRECT EMAIL TEST" -ForegroundColor Cyan
Write-Host "==================`n" -ForegroundColor Cyan

Write-Host "This will send a test email with sample data" -ForegroundColor Yellow
Write-Host "Make sure you're logged into the app first!`n" -ForegroundColor Yellow

Write-Host "Opening test email page..." -ForegroundColor Green
Start-Process "http://localhost:3005/api/test-email"

Write-Host "`nCheck your browser for results!" -ForegroundColor Cyan
Write-Host "Then check your email inbox (including SPAM)`n" -ForegroundColor Gray





