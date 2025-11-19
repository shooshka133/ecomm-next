# Use Port 3000 Only (Not 3001)

## Why It's Using Port 3001

Next.js automatically uses the next available port when 3000 is busy. This means:
- Port 3000 is already in use by another process
- Next.js automatically switched to 3001
- Your redirect URLs need to match the port you're using

## Solution: Free Port 3000

### Step 1: Kill All Node.js Processes

Run this in Command Prompt or PowerShell:

```cmd
taskkill /F /IM node.exe
```

This will stop all Node.js processes, including whatever is using port 3000.

### Step 2: Restart Your Dev Server

```bash
npm run dev
```

Now it should use port 3000:
```
✓ Ready in 3.2s
- Local:        http://localhost:3000
```

## Configure to Always Use Port 3000

To force Next.js to always use port 3000 (and fail if it's busy):

### Option 1: Modify package.json

```json
{
  "scripts": {
    "dev": "next dev -p 3000"
  }
}
```

### Option 2: Create .env.local

Create `.env.local` file:
```
PORT=3000
```

## Update Supabase Redirect URLs

Once you're using port 3000, make sure Supabase has:

**Redirect URLs:**
```
http://localhost:3000/api/auth/callback
http://localhost:3000/auth/reset-password
https://ecomm-next-yf7p.vercel.app/api/auth/callback
```

You can remove `http://localhost:3001` from the list if you're not using it.

## Quick Fix Commands

```bash
# 1. Kill all Node processes
taskkill /F /IM node.exe

# 2. Wait 2 seconds
timeout /t 2

# 3. Start dev server (will use port 3000)
npm run dev
```

## Verify Port 3000 is Free

Before starting, check if port 3000 is free:

```cmd
netstat -ano | findstr :3000
```

If this shows nothing, port 3000 is free!

## Why This Matters

- **Consistency**: Always use the same port for development
- **Redirect URLs**: Supabase redirect URLs must match your actual port
- **No Confusion**: Don't have to remember which port you're using

