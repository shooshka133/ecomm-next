# Setup Local Host Mapping for Multi-Brand Testing
# Run this script as Administrator

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

# Check if entries already exist
$existing = Get-Content $hostsPath | Select-String "shooshka.online"

if ($existing) {
    Write-Host "Host entries for shooshka.online already exist:" -ForegroundColor Yellow
    $existing | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""
    $response = Read-Host "Do you want to add them again? (y/n)"
    if ($response -ne "y") {
        Write-Host "Skipping host file update." -ForegroundColor Yellow
        exit 0
    }
}

# Entries to add
# Using .local domains to avoid HTTPS/HSTS conflicts with production domains
$entries = @(
    "",
    "# Multi-brand local testing (using .local to avoid production domain conflicts)",
    "127.0.0.1 store.local",
    "127.0.0.1 grocery.local",
    "127.0.0.1 fashion.local",
    "",
    "# Original production domains (commented out - use .local for testing)",
    "# 127.0.0.1 store.shooshka.online",
    "# 127.0.0.1 grocery.shooshka.online",
    "# 127.0.0.1 fashion.shooshka.online"
)

# Add entries
try {
    Add-Content -Path $hostsPath -Value $entries -ErrorAction Stop
    Write-Host "✓ Successfully added host entries!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Added entries:" -ForegroundColor Cyan
    $entries | Where-Object { $_ -and $_ -notmatch "^#" } | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Flush DNS cache
    Write-Host "Flushing DNS cache..." -ForegroundColor Yellow
    ipconfig /flushdns | Out-Null
    Write-Host "✓ DNS cache flushed!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start your dev server: npm run dev" -ForegroundColor White
    Write-Host "2. Test domains (using .local to avoid production conflicts):" -ForegroundColor White
    Write-Host "   - http://store.local:3000" -ForegroundColor Gray
    Write-Host "   - http://grocery.local:3000" -ForegroundColor Gray
    Write-Host "   - http://fashion.local:3000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Note: Using .local domains avoids HTTPS/HSTS issues with production domains." -ForegroundColor Yellow
    
} catch {
    Write-Host "ERROR: Failed to update hosts file" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

