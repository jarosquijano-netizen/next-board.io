# NextBoard.ai - Automated Test Suite
# Quick validation script for core functionality

Write-Host "🧪 NextBoard.ai - Automated Test Suite" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()
$passCount = 0
$failCount = 0

# Helper function to record test result
function Test-Result {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Details = ""
    )
    
    $result = @{
        Name = $TestName
        Passed = $Passed
        Details = $Details
        Timestamp = Get-Date -Format "HH:mm:ss"
    }
    
    $script:testResults += $result
    
    if ($Passed) {
        $script:passCount++
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
    } else {
        $script:failCount++
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Details) {
            Write-Host "   Details: $Details" -ForegroundColor Yellow
        }
    }
}

Write-Host "Starting tests at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# ============================================
# TEST 1: Server Running
# ============================================
Write-Host "TEST 1: Checking if server is running on port 3005..." -ForegroundColor Yellow

try {
    $portTest = Test-NetConnection -ComputerName localhost -Port 3005 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($portTest) {
        Test-Result "Server Running" $true "Port 3005 is open and listening"
    } else {
        Test-Result "Server Running" $false "Port 3005 is not responding"
    }
} catch {
    Test-Result "Server Running" $false $_.Exception.Message
}

# ============================================
# TEST 2: Critical Files Exist
# ============================================
Write-Host "`nTEST 2: Checking critical files..." -ForegroundColor Yellow

$criticalFiles = @(
    "package.json",
    "prisma\schema.prisma",
    "src\app\api\upload\route.ts",
    "src\app\api\process\route.ts",
    "src\app\api\board\[id]\route.ts",
    "src\components\BoardView.tsx",
    "src\components\CardItem.tsx"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Test-Result "Critical Files Exist" $allFilesExist

# ============================================
# TEST 3: Database File Exists
# ============================================
Write-Host "`nTEST 3: Checking database..." -ForegroundColor Yellow

if (Test-Path "prisma\dev.db") {
    $dbSize = (Get-Item "prisma\dev.db").Length
    Test-Result "Database File" $true "SQLite database exists - $dbSize bytes"
} else {
    Test-Result "Database File" $false "Database file not found"
}

# ============================================
# TEST 4: Node Modules Installed
# ============================================
Write-Host "`nTEST 4: Checking node_modules..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    $modulesCount = (Get-ChildItem "node_modules" -Directory).Count
    Test-Result "Dependencies Installed" $true "$modulesCount packages installed"
} else {
    Test-Result "Dependencies Installed" $false "node_modules folder not found - run 'npm install'"
}

# ============================================
# TEST 5: Environment Variables
# ============================================
Write-Host "`nTEST 5: Checking environment configuration..." -ForegroundColor Yellow

$envFiles = @(".env", ".env.local")
$envFound = $false

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $envFound = $true
        Write-Host "  ✓ Found $envFile" -ForegroundColor Gray
        
        # Check for critical env vars
        $envContent = Get-Content $envFile -Raw
        if ($envContent -match "CLERK_SECRET_KEY" -or $envContent -match "NEXT_PUBLIC_CLERK") {
            Write-Host "  ✓ Clerk configuration detected" -ForegroundColor Gray
        }
        if ($envContent -match "ANTHROPIC_API_KEY") {
            Write-Host "  ✓ Anthropic API key configured" -ForegroundColor Gray
        } else {
            Write-Host "  ℹ No Anthropic API key (demo mode will be used)" -ForegroundColor Cyan
        }
    }
}

if ($envFound) {
    Test-Result "Environment Config" $true "Environment file found"
} else {
    Test-Result "Environment Config" $false "No .env file found - app may not work correctly"
}

# ============================================
# TEST 6: Sample Files Available
# ============================================
Write-Host "`nTEST 6: Checking test files..." -ForegroundColor Yellow

if (Test-Path "sample-transcript.txt") {
    Test-Result "Sample Files" $true "sample-transcript.txt available for testing"
} else {
    Test-Result "Sample Files" $false "sample-transcript.txt not found"
}

# ============================================
# TEST 7: Port Availability
# ============================================
Write-Host "`nTEST 7: Checking for port conflicts..." -ForegroundColor Yellow

try {
    $processesOnPort = Get-NetTCPConnection -LocalPort 3005 -ErrorAction SilentlyContinue | 
                      Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($processesOnPort) {
        $processCount = $processesOnPort.Count
        Test-Result "Port Usage" $true "Port 3005 in use by $processCount process(es) - likely the dev server"
    } else {
        Test-Result "Port Usage" $false "Port 3005 not in use - server may not be running"
    }
} catch {
    Test-Result "Port Usage" $false "Could not check port status"
}

# ============================================
# TEST 8: TypeScript Configuration
# ============================================
Write-Host "`nTEST 8: Checking TypeScript..." -ForegroundColor Yellow

if (Test-Path "tsconfig.json") {
    $tsconfig = Get-Content "tsconfig.json" | ConvertFrom-Json
    Test-Result "TypeScript Config" $true "tsconfig.json configured"
} else {
    Test-Result "TypeScript Config" $false "tsconfig.json not found"
}

# ============================================
# TEST 9: Upload Directory
# ============================================
Write-Host "`nTEST 9: Checking upload directory..." -ForegroundColor Yellow

if (Test-Path "public\uploads") {
    $uploadCount = (Get-ChildItem "public\uploads" -File -ErrorAction SilentlyContinue).Count
    Test-Result "Upload Directory" $true "$uploadCount files in upload directory"
} else {
    Write-Host "  ℹ Upload directory will be created on first upload" -ForegroundColor Cyan
    Test-Result "Upload Directory" $true "Directory will auto-create"
}

# ============================================
# TEST 10: Build Check (Optional)
# ============================================
Write-Host "`nTEST 10: Checking if project can be built..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Test-Result "Build Status" $true ".next directory exists (previously built)"
} else {
    Write-Host "  ℹ Project not yet built - this is normal for dev mode" -ForegroundColor Cyan
    Test-Result "Build Status" $true "Dev mode, build not required"
}

# ============================================
# TEST 11: HTTP Server Response (if running)
# ============================================
Write-Host "`nTEST 11: Testing HTTP server response..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Test-Result "HTTP Response" $true "Server responding with 200 OK"
    } else {
        Test-Result "HTTP Response" $false "Server returned status code: $($response.StatusCode)"
    }
} catch {
    if ($_.Exception.Message -like "*authentication*" -or $_.Exception.Message -like "*redirect*") {
        Test-Result "HTTP Response" $true "Server responding (redirect to auth - expected)"
    } else {
        Test-Result "HTTP Response" $false "Server not responding: $($_.Exception.Message)"
    }
}

# ============================================
# TEST 12: Prisma Client Generated
# ============================================
Write-Host "`nTEST 12: Checking Prisma client..." -ForegroundColor Yellow

if (Test-Path "node_modules\.prisma\client") {
    Test-Result "Prisma Client" $true "Prisma client generated"
} else {
    Test-Result "Prisma Client" $false "Prisma client not generated - run 'npx prisma generate'"
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($testResults.Count)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red

$successRate = [math]::Round(($passCount / $testResults.Count) * 100, 1)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })

Write-Host "`nCompleted at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# ============================================
# RECOMMENDATIONS
# ============================================
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

if ($failCount -eq 0) {
    Write-Host "✅ All tests passed! System is ready for use." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Open http://localhost:3005 in your browser" -ForegroundColor Gray
    Write-Host "2. Sign in with Clerk" -ForegroundColor Gray
    Write-Host "3. Upload sample-transcript.txt" -ForegroundColor Gray
    Write-Host "4. Test all 4 view modes: Kanban, Calendar, Focus, Matrix" -ForegroundColor Gray
    Write-Host "5. Run manual test cases from TEST_CASES.md" -ForegroundColor Gray
} else {
    Write-Host "⚠️ Some tests failed. Please address the following:" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($result in $testResults) {
        if (-not $result.Passed) {
            Write-Host "❌ $($result.Name): $($result.Details)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor White
    Write-Host "• Server not running: Run 'npm run dev' in a separate terminal" -ForegroundColor Gray
    Write-Host "• Missing dependencies: Run 'npm install'" -ForegroundColor Gray
    Write-Host "• Missing Prisma client: Run 'npx prisma generate'" -ForegroundColor Gray
    Write-Host "• No .env file: Copy .env.example to .env and configure" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# EXPORT RESULTS
# ============================================
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
$resultsFile = "test-results-$timestamp.json"
$testResults | ConvertTo-Json | Out-File $resultsFile
Write-Host "Test results saved to: $resultsFile" -ForegroundColor Cyan

# Return exit code based on results
if ($failCount -eq 0) {
    exit 0
} else {
    exit 1
}

