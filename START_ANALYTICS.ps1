#!/usr/bin/env pwsh
# Launch NextBoard Analytics Dashboard

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   📊 Analytics Dashboard Ready!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Opening NextBoard Analytics...`n" -ForegroundColor Green

Write-Host "What you'll see:" -ForegroundColor Yellow
Write-Host "  ✅ Key metrics (completion rate, velocity)" -ForegroundColor White
Write-Host "  ✅ Meeting efficiency tracking" -ForegroundColor White
Write-Host "  ✅ Line & bar charts (Recharts)" -ForegroundColor White
Write-Host "  ✅ Top contributors leaderboard" -ForegroundColor White
Write-Host "  ✅ Blocker analysis" -ForegroundColor White
Write-Host "  ✅ Period selector (7d, 30d, 90d, all)`n" -ForegroundColor White

Write-Host "Navigation:" -ForegroundColor Yellow
Write-Host "  - Click 'Analytics' in sidebar" -ForegroundColor White
Write-Host "  - Or visit: http://localhost:3005/analytics`n" -ForegroundColor White

Start-Process "http://localhost:3005/analytics"

Write-Host "Browser opened! Check it out!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan





