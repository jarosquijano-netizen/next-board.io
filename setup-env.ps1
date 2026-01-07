@"
DATABASE_URL=postgresql://postgres:DcAyvwFiQTKqhMIDktdPCTkiKUHHmiEf@mainline.proxy.rlwy.net:42102/railway

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZnVsbC1iZWUtNzIuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_h3WbKiz4bTLY05A6KQ1Nk9UoydZtgJHBKcaHLqLUsP

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
"@ | Out-File -FilePath .env -Encoding utf8

Write-Host "✅ .env file created successfully!"
Write-Host "Your Clerk keys are configured."







