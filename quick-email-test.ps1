#!/usr/bin/env pwsh

Write-Host "`n=== EMAIL TEST ===" -ForegroundColor Cyan
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`nOpening test email page in browser..." -ForegroundColor Green
Write-Host "URL: http://localhost:3005/api/test-email`n" -ForegroundColor Gray

Start-Process "http://localhost:3005/api/test-email"

Write-Host "Check the browser for results!" -ForegroundColor Cyan
Write-Host "Then check your email inbox (jarosquijano@gmail.com)`n" -ForegroundColor Yellow





