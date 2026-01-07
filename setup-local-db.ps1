# Setup Local Development Database
Write-Host "🔧 Setting up local SQLite database for development..." -ForegroundColor Cyan

# Create .env file with SQLite database
$envContent = @"
# Local Development Database (SQLite)
DATABASE_URL="file:./dev.db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZnVsbC1iZWUtNzIuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_h3WbKiz4bTLY05A6KQ1Nk9UoydZtgJHBKcaHLqLUsP
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# AI Integration (Optional - Leave commented for Demo Mode)
# ANTHROPIC_API_KEY=sk-ant-...
# NEXT_PUBLIC_HAS_API_KEY=true
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✅ Created .env file with local SQLite database" -ForegroundColor Green

Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npx prisma db push" -ForegroundColor White
Write-Host "  2. Restart your dev server (npm run dev)" -ForegroundColor White







