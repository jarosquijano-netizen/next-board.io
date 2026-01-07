#!/usr/bin/env pwsh
# Launch NextBoard Unified Dashboard

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   🎯 Unified Dashboard Ready!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Opening your unified dashboard...`n" -ForegroundColor Green

Write-Host "What you'll see:" -ForegroundColor Yellow
Write-Host "  ✅ Quick stats (6 cards)" -ForegroundColor White
Write-Host "  ✅ Global search (⌘K)" -ForegroundColor White
Write-Host "  ✅ Filter tabs (Critical, Mine, Recent, All)" -ForegroundColor White
Write-Host "  ✅ Quick actions (New Board, All Boards, Analytics)" -ForegroundColor White
Write-Host "  ✅ All items from ALL meetings" -ForegroundColor White
Write-Host "  ✅ Keyboard shortcuts (1-4 to switch tabs)`n" -ForegroundColor White

Write-Host "Features:" -ForegroundColor Yellow
Write-Host "  🚨 Critical items - Overdue, due today, blocked" -ForegroundColor White
Write-Host "  👤 My items - Assigned to you, needing action" -ForegroundColor White
Write-Host "  ⏱️  Recent activity - Last 7 days" -ForegroundColor White
Write-Host "  📋 All meetings - Overview with progress`n" -ForegroundColor White

Start-Process "http://localhost:3005"

Write-Host "Browser opened!" -ForegroundColor Green
Write-Host "`nTry these:" -ForegroundColor Yellow
Write-Host "  - Press ⌘K to search" -ForegroundColor White
Write-Host "  - Press 1-4 to switch tabs" -ForegroundColor White
Write-Host "  - Click any card to open its board`n" -ForegroundColor White

Write-Host "========================================`n" -ForegroundColor Cyan





