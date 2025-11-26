# 🚀 Start Development Server

## The Problem

You're getting `ERR_CONNECTION_REFUSED` which means the Next.js dev server is **not running**.

---

## ✅ Quick Fix: Start the Server

### Step 1: Open Terminal

1. **Open your terminal/command prompt**
2. **Navigate to your project:**
   ```bash
   cd C:\ecomm
   ```

### Step 2: Start Dev Server

```bash
npm run dev
```

**Expected output:**
```
> ecommerce-start@0.1.0 dev
> next dev -p 3000

▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
○ Compiling / ...
✓ Compiled / in 1.2s
```

### Step 3: Wait for "Ready"

Wait until you see:
- ✅ `Ready in X.Xs`
- ✅ `Local: http://localhost:3000`

### Step 4: Open Browser

1. **Open:** `http://localhost:3000`
2. **Should see:** Your store homepage

---

## 🎯 Then Access Admin Panel

Once server is running:

1. **Go to:** `http://localhost:3000/admin/brand-settings`
2. **Sign in** if needed
3. **Activate/Deactivate brands** as needed

---

## 🔧 Troubleshooting

### Issue: "npm: command not found"

**Solution:**
- Node.js is not installed
- Install Node.js: https://nodejs.org/
- Restart terminal after installation

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Option 1: Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Option 2: Use different port
npm run dev -- -p 3001
# Then visit: http://localhost:3001
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Install dependencies
npm install

# Then start server
npm run dev
```

### Issue: Server starts but page doesn't load

**Solution:**
1. Check terminal for errors
2. Clear browser cache: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Try incognito/private window

---

## 📝 Common Commands

```bash
# Start dev server
npm run dev

# Start on different port
npm run dev -- -p 3001

# Build for production
npm run build

# Start production server
npm start
```

---

## ✅ Quick Checklist

- [ ] Terminal is open
- [ ] In project directory (`C:\ecomm`)
- [ ] Dependencies installed (`npm install` if needed)
- [ ] Server started (`npm run dev`)
- [ ] See "Ready" message
- [ ] Browser opens `http://localhost:3000`
- [ ] Store loads successfully

---

## 🎯 After Server Starts

1. **Visit:** `http://localhost:3000`
2. **Go to:** `http://localhost:3000/admin/brand-settings`
3. **Sign in** (if needed)
4. **Switch brands** as needed

---

**The server must be running for localhost to work!** 🚀

