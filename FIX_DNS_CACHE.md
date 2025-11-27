# Fix DNS Cache Issue on Windows

## Problem
- ✅ Site works on mobile (DNS is correct)
- ❌ Laptop shows "refused to connect" (DNS cache issue)

## Solution: Flush DNS Cache

### Method 1: Command Prompt (Recommended)

1. **Open Command Prompt as Administrator:**
   - Press `Win + X`
   - Select "Windows Terminal (Admin)" or "Command Prompt (Admin)"

2. **Flush DNS:**
   ```cmd
   ipconfig /flushdns
   ```

3. **Restart browser** (close all browser windows and reopen)

4. **Try again:** `https://store.shooshka.online`

### Method 2: PowerShell

1. **Open PowerShell as Administrator:**
   - Press `Win + X`
   - Select "PowerShell (Admin)"

2. **Flush DNS:**
   ```powershell
   Clear-DnsClientCache
   ```

3. **Restart browser**

### Method 3: Restart Network Adapter

1. **Open Command Prompt as Administrator**

2. **Reset network:**
   ```cmd
   ipconfig /release
   ipconfig /renew
   ipconfig /flushdns
   ```

3. **Restart browser**

### Method 4: Clear Browser DNS Cache

**Chrome/Edge:**
1. Close all browser windows
2. Open browser
3. Go to: `chrome://net-internals/#dns`
4. Click "Clear host cache"
5. Try the domain again

**Firefox:**
1. Close browser
2. Open browser
3. Go to: `about:networking#dns`
4. Click "Clear DNS Cache"
5. Try the domain again

---

## Verify DNS Resolution

After flushing, verify DNS is correct:

```cmd
nslookup store.shooshka.online
nslookup grocery.shooshka.online
```

**Should return:**
- Vercel IP addresses (not old/local IPs)

---

## If Still Not Working

### Check Hosts File

Make sure your hosts file doesn't have old entries:

1. **Open hosts file:**
   ```cmd
   notepad C:\Windows\System32\drivers\etc\hosts
   ```

2. **Remove any entries for:**
   - `store.shooshka.online`
   - `grocery.shooshka.online`
   - `fashion.shooshka.online`

3. **Save and flush DNS again**

### Check Firewall/Antivirus

- Temporarily disable firewall/antivirus
- Try accessing the domain
- If it works, add exception for the domain

### Try Different Browser

- Test in incognito/private mode
- Test in different browser
- If works in different browser, clear cache in original browser

---

## Quick Fix Script

Run this PowerShell script as Administrator:

```powershell
# Flush DNS
ipconfig /flushdns
Clear-DnsClientCache

# Verify
Write-Host "DNS Cache flushed!" -ForegroundColor Green
Write-Host "Testing DNS resolution..." -ForegroundColor Yellow
nslookup store.shooshka.online
nslookup grocery.shooshka.online

Write-Host "`nDone! Now restart your browser and try again." -ForegroundColor Cyan
```

---

## Expected Result

After flushing DNS:
- ✅ `https://store.shooshka.online` should work
- ✅ `https://grocery.shooshka.online` should work
- ✅ Both should show correct brands

---

## Why This Happens

Windows caches DNS lookups to speed up browsing. When you:
1. Tested locally with `.local` domains
2. Changed DNS records
3. Deployed to new servers

Windows might still have old DNS entries cached, pointing to:
- Old server IPs
- Local IPs (127.0.0.1)
- Non-existent servers

Flushing DNS forces Windows to look up fresh DNS records.

