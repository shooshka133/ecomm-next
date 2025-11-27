# Remove Production Domains from Hosts File
# Run this script as Administrator to remove production domain entries

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

# Read current hosts file
$hostsContent = Get-Content $hostsPath

# Domains to remove (production domains that should NOT be in hosts file)
$domainsToRemove = @(
    "store.shooshka.online",
    "grocery.shooshka.online",
    "fashion.shooshka.online"
)

# Filter out lines containing production domains
$newContent = $hostsContent | Where-Object {
    $line = $_
    $shouldKeep = $true
    
    foreach ($domain in $domainsToRemove) {
        if ($line -match $domain) {
            $shouldKeep = $false
            Write-Host "Removing: $line" -ForegroundColor Yellow
            break
        }
    }
    
    $shouldKeep
}

# Write back to hosts file
try {
    $newContent | Set-Content $hostsPath -Encoding UTF8
    Write-Host "✓ Successfully removed production domain entries!" -ForegroundColor Green
    Write-Host ""
    
    # Flush DNS cache
    Write-Host "Flushing DNS cache..." -ForegroundColor Yellow
    ipconfig /flushdns | Out-Null
    Clear-DnsClientCache | Out-Null
    Write-Host "✓ DNS cache flushed!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Production domains removed from hosts file." -ForegroundColor Cyan
    Write-Host "Your laptop will now use real DNS for:" -ForegroundColor White
    Write-Host "  - store.shooshka.online" -ForegroundColor Gray
    Write-Host "  - grocery.shooshka.online" -ForegroundColor Gray
    Write-Host "  - fashion.shooshka.online" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Restart your browser and try again!" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERROR: Failed to update hosts file" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

