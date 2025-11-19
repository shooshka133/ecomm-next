# Fix Port 3000 Already in Use

## Quick Fix: Kill Process on Port 3000 (Windows)

### Method 1: Using Command Prompt

1. **Find the process using port 3000:**
   ```cmd
   netstat -ano | findstr :3000
   ```
   This will show something like:
   ```
   TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       12345
   ```
   Note the PID (Process ID) - in this example it's `12345`

2. **Kill the process:**
   ```cmd
   taskkill /PID 12345 /F
   ```

### Method 2: One-Liner Command

```cmd
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %a
```

### Method 3: Using PowerShell

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

## Alternative: Use a Different Port

If you want to keep the other process running, use a different port:

### Option A: Run on Port 3001

```bash
npm run dev -- -p 3001
```

Or modify `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

### Option B: Set Port in Environment Variable

Create or edit `.env.local`:
```
PORT=3001
```

## Check What's Running

To see all Node.js processes:
```cmd
tasklist | findstr node
```

To kill all Node.js processes (be careful!):
```cmd
taskkill /F /IM node.exe
```

## Common Causes

1. **Previous dev server still running** - Most common cause
2. **Another Next.js app running** - Check if you have multiple projects
3. **Background process** - A previous `npm run dev` that didn't close properly

## Prevention

Always stop the dev server properly:
- Press `Ctrl+C` in the terminal running `npm run dev`
- Or close the terminal window

## Quick Solution

The fastest way is usually:
```cmd
taskkill /F /IM node.exe
```
This kills all Node.js processes, then you can restart your dev server.

