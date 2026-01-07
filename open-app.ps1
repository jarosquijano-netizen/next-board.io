#!/usr/bin/env pwsh
# Quick launcher for NextBoard

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "   NextBoard - Quick Launch" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`nServer should be ready!" -ForegroundColor Green
Write-Host "Opening NextBoard in your browser...`n" -ForegroundColor Green

Write-Host "What to try:" -ForegroundColor Cyan
Write-Host "1. Click the settings icon (bottom left)" -ForegroundColor White
Write-Host "2. Settings modal will popup!" -ForegroundColor White
Write-Host "3. Click 'Send Test Email' button" -ForegroundColor White
Write-Host "4. Check your email inbox`n" -ForegroundColor White

Start-Process "http://localhost:3005"

Write-Host "Browser opened! Enjoy!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan





