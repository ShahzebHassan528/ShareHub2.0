# Start Memurai Service Script
Write-Host "Starting Memurai Redis Service..." -ForegroundColor Cyan

# Try to start the service
try {
    $service = Get-Service -Name "Memurai" -ErrorAction Stop
    
    if ($service.Status -eq "Running") {
        Write-Host "Memurai is already running!" -ForegroundColor Green
        Write-Host "Restarting to ensure fresh connection..." -ForegroundColor Yellow
        Stop-Service -Name "Memurai" -Force
        Start-Sleep -Seconds 2
    }
    
    Start-Service -Name "Memurai"
    Start-Sleep -Seconds 3
    
    $service = Get-Service -Name "Memurai"
    if ($service.Status -eq "Running") {
        Write-Host "✅ Memurai started successfully!" -ForegroundColor Green
        
        # Test connection
        $testPath = "C:\Program Files\Memurai\memurai-cli.exe"
        if (Test-Path $testPath) {
            Write-Host "Testing connection..." -ForegroundColor Yellow
            & $testPath ping
        }
    } else {
        Write-Host "❌ Failed to start Memurai" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this script as Administrator:" -ForegroundColor Yellow
    Write-Host "Right-click PowerShell -> Run as Administrator" -ForegroundColor Yellow
}
