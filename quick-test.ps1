# Quick email test
$email = Read-Host "Enter your email"
Write-Host "Sending test..." -ForegroundColor Cyan

$body = '{"type":"daily-digest","secret":"test-secret-123"}' 

Invoke-RestMethod -Uri "http://localhost:3005/api/cron/email-notifications" -Method POST -ContentType "application/json" -Body $body

Write-Host "Done! Check your email at: $email" -ForegroundColor Green





