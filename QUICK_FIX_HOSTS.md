# Quick Fix: Remove Production Domains from Hosts File

## Problem
Your hosts file has production domains (`store.shooshka.online`, etc.) pointing to `127.0.0.1`, which makes your laptop try to connect to localhost instead of the real production server.

## Solution

### Option 1: Run the Script (Easiest)

Run as Administrator:
```powershell
.\remove-production-domains-from-hosts.ps1
```

### Option 2: Manual Edit

1. **Open Notepad as Administrator:**
   ```powershell
   notepad C:\Windows\System32\drivers\etc\hosts
   ```

2. **Find and DELETE these lines:**
   ```
   127.0.0.1 store.shooshka.online
   127.0.0.1 grocery.shooshka.online
   127.0.0.1 fashion.shooshka.online
   ```

3. **Keep these (they're commented out, so safe):**
   ```
   # 127.0.0.1 store.shooshka.online
   # 127.0.0.1 grocery.shooshka.online
   # 127.0.0.1 fashion.shooshka.online
   ```

4. **Keep these (for local testing):**
   ```
   127.0.0.1 store.local
   127.0.0.1 grocery.local
   127.0.0.1 fashion.local
   ```

5. **Save the file**

6. **Flush DNS:**
   ```powershell
   ipconfig /flushdns
   ```

7. **Restart browser**

## After Fix

Your hosts file should only have:
- ✅ `.local` domains pointing to `127.0.0.1` (for local testing)
- ✅ Commented production domains (safe to keep)
- ❌ NO active production domain entries

## Test

After fixing:
- `https://store.shooshka.online` → Should work (uses real DNS)
- `https://grocery.shooshka.online` → Should work (uses real DNS)
- `http://store.local:3000` → Should work (uses hosts file for local testing)
- `http://grocery.local:3000` → Should work (uses hosts file for local testing)

