# NextBoard.ai - Quick Test Suite
# Simple validation script

Write-Host "NextBoard.ai - Quick Test Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$passCount = 0
$failCount = 0

function Test-Check {
    param([string]$Name, [bool]$Pass, [string]$Details = "")
    
    if ($Pass) {
        Write-Host "[PASS] $Name" -ForegroundColor Green
        $script:passCount++
    } else {
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        if ($Details) { Write-Host "       $Details" -ForegroundColor Yellow }
        $script:failCount++
    }
}

# TEST 1: Server Running
Write-Host "`n1. Checking if server is running..." -ForegroundColor Yellow
try {
    $portTest = Test-NetConnection -ComputerName localhost -Port 3005 -InformationLevel Quiet -WarningAction SilentlyContinue
    Test-Check "Server on port 3005" $portTest "Port 3005 must be listening"
} catch {
    Test-Check "Server on port 3005" $false "Error checking port"
}

# TEST 2: Critical Files
Write-Host "`n2. Checking critical files..." -ForegroundColor Yellow
$files = @("package.json", "prisma\schema.prisma", "src\app\api\upload\route.ts")
$allExist = $true
foreach ($f in $files) {
    if (-not (Test-Path $f)) { $allExist = $false }
}
Test-Check "Critical files exist" $allExist

# TEST 3: Database
Write-Host "`n3. Checking database..." -ForegroundColor Yellow
Test-Check "Database file" (Test-Path "prisma\dev.db")

# TEST 4: Dependencies
Write-Host "`n4. Checking dependencies..." -ForegroundColor Yellow
Test-Check "Node modules installed" (Test-Path "node_modules")

# TEST 5: Environment
Write-Host "`n5. Checking environment..." -ForegroundColor Yellow
$envExists = (Test-Path ".env") -or (Test-Path ".env.local")
Test-Check "Environment file" $envExists "Create .env or .env.local file"

# TEST 6: Sample Files
Write-Host "`n6. Checking test files..." -ForegroundColor Yellow
Test-Check "Sample transcript" (Test-Path "sample-transcript.txt")

# TEST 7: Prisma Client
Write-Host "`n7. Checking Prisma..." -ForegroundColor Yellow
Test-Check "Prisma client generated" (Test-Path "node_modules\.prisma\client")

# TEST 8: HTTP Response
Write-Host "`n8. Testing HTTP response..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Test-Check "HTTP server responds" ($response.StatusCode -eq 200)
} catch {
    if ($_.Exception.Message -like "*redirect*") {
        Test-Check "HTTP server responds" $true "Server redirecting (expected)"
    } else {
        Test-Check "HTTP server responds" $false "Server not responding"
    }
}

# SUMMARY
Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

$total = $passCount + $failCount
$rate = if ($total -gt 0) { [math]::Round(($passCount / $total) * 100, 1) } else { 0 }
Write-Host "Success Rate: $rate%" -ForegroundColor $(if ($rate -ge 80) { "Green" } else { "Yellow" })

Write-Host ""
if ($failCount -eq 0) {
    Write-Host "All tests passed! System is ready." -ForegroundColor Green
    Write-Host "Next: Open http://localhost:3005 in your browser" -ForegroundColor Cyan
} else {
    Write-Host "Some tests failed. Check the errors above." -ForegroundColor Yellow
}

exit $(if ($failCount -eq 0) { 0 } else { 1 })


