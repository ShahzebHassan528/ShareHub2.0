# Redis Installation Script for Windows
# This script installs Memurai (Redis-compatible) using Chocolatey

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Redis Installation for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Right-click PowerShell -> Run as Administrator" -ForegroundColor Yellow
    exit 1
}

# Check if Chocolatey is installed
Write-Host "Checking for Chocolatey..." -ForegroundColor Yellow
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if (-not $chocoInstalled) {
    Write-Host "Chocolatey not found. Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "Chocolatey installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Chocolatey is already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing Memurai (Redis for Windows)..." -ForegroundColor Yellow

# Install Memurai
choco install memurai-developer -y

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Memurai installed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Start Memurai service
    Write-Host "Starting Memurai service..." -ForegroundColor Yellow
    Start-Service Memurai -ErrorAction SilentlyContinue
    
    # Wait a moment for service to start
    Start-Sleep -Seconds 2
    
    # Check service status
    $service = Get-Service Memurai -ErrorAction SilentlyContinue
    if ($service.Status -eq 'Running') {
        Write-Host "Memurai service is running!" -ForegroundColor Green
    } else {
        Write-Host "Starting Memurai service manually..." -ForegroundColor Yellow
        net start Memurai
    }
    
    Write-Host ""
    Write-Host "Testing connection..." -ForegroundColor Yellow
    
    # Test connection
    $testResult = & memurai-cli ping 2>&1
    if ($testResult -eq "PONG") {
        Write-Host "Connection test successful! Redis is ready." -ForegroundColor Green
    } else {
        Write-Host "Connection test failed. Please restart your computer." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. Restart your backend server" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm start" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. You should see:" -ForegroundColor White
    Write-Host "   ✅ Redis Connected" -ForegroundColor Gray
    Write-Host "   ✅ BullMQ Queues initialized" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "Installation failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual Installation:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://www.memurai.com/get-memurai" -ForegroundColor White
    Write-Host "2. Download Memurai Developer Edition" -ForegroundColor White
    Write-Host "3. Run the installer" -ForegroundColor White
    Write-Host ""
}
