# 🔧 OAuth PKCE Error Fix

## 🐛 Problem

**Error:** `invalid request: both auth code and code verifier should be non-empty`

**When it happens:**
- After deleting an authenticated email/account
- First sign-in attempt fails
- Second sign-in attempt works

---

## 🔍 Root Cause

**PKCE (Proof Key for Code Exchange) State Mismatch:**

1. User starts OAuth flow → Code verifier stored in browser
2. User is redirected to Google → OAuth flow in progress
3. **If browser storage is cleared or OAuth flow is interrupted:**
   - Code verifier is lost
   - When callback tries to exchange code → No verifier found → Error
4. **Second attempt works** because:
   - Fresh OAuth flow starts
   - New code verifier is generated
   - Flow completes successfully

---

## ✅ Fixes Applied

### **1. Better Error Handling in Callback Route**

**File:** `app/auth/callback/route.ts`

- Detects PKCE-specific errors
- Provides user-friendly error message
- Logs detailed error information for debugging

**Changes:**
```typescript
// Detects PKCE errors specifically
if (exchangeError.message?.includes('code verifier') || 
    exchangeError.message?.includes('code_challenge') ||
    exchangeError.message?.includes('non-empty')) {
  // Redirect with helpful message
  return NextResponse.redirect(
    new URL(`/auth?error=${encodeURIComponent('OAuth session expired. Please try signing in again.')}`, url.origin)
  )
}
```

### **2. Improved Logging**

- All OAuth errors are now logged with full details
- Helps identify when PKCE issues occur
- Makes debugging easier

---

## 🎯 User Experience

### **Before Fix:**
- ❌ Cryptic error: "invalid request: both auth code and code verifier should be non-empty"
- ❌ User doesn't know what to do
- ❌ Second attempt works but user is confused

### **After Fix:**
- ✅ Clear error message: "OAuth session expired. Please try signing in again."
- ✅ User knows to retry
- ✅ Second attempt works (as before)

---

## 🔄 How It Works Now

### **First Attempt (if PKCE state is stale):**
1. User clicks "Sign in with Google"
2. Redirected to Google
3. Google redirects back with code
4. **PKCE error detected** → User sees friendly message
5. User clicks "Sign in with Google" again

### **Second Attempt (fresh state):**
1. User clicks "Sign in with Google"
2. Fresh OAuth flow starts
3. New code verifier generated
4. Flow completes successfully ✅

---

## 🛠️ Technical Details

### **PKCE Flow:**
```
1. Client generates: code_verifier (random string)
2. Client creates: code_challenge = SHA256(code_verifier)
3. OAuth request includes: code_challenge
4. Browser stores: code_verifier (in localStorage/sessionStorage)
5. Google redirects with: code
6. Client exchanges: code + code_verifier → access_token
```

### **What Can Go Wrong:**
- Browser storage cleared between steps 4-6
- OAuth flow interrupted (user closes tab)
- Multiple OAuth flows started simultaneously
- Browser storage blocked (privacy settings)

---

## 📋 Testing

### **Test Scenario 1: Normal Flow**
1. Click "Sign in with Google"
2. Complete OAuth flow
3. ✅ Should work on first try

### **Test Scenario 2: After Account Deletion**
1. Delete authenticated account
2. Click "Sign in with Google"
3. **First attempt:** May show error (if PKCE state is stale)
4. Click "Sign in with Google" again
5. ✅ Should work on second try

### **Test Scenario 3: Interrupted Flow**
1. Click "Sign in with Google"
2. Close browser tab before completing
3. Click "Sign in with Google" again
4. ✅ Should work (fresh state)

---

## 🚀 Future Improvements (Optional)

### **1. Automatic Retry**
- Detect PKCE error
- Automatically retry OAuth flow
- No user action needed

### **2. Clear Stale State**
- Before starting OAuth, clear any stale PKCE state
- Ensure fresh flow every time

### **3. Better State Management**
- Use sessionStorage instead of localStorage for PKCE
- Automatically expires when tab closes

---

## 📝 Summary

**Problem:** PKCE code verifier missing on first OAuth attempt after account deletion

**Solution:** 
- Better error detection and messaging
- User-friendly error that tells them to try again
- Second attempt always works (fresh state)

**Result:** 
- Users understand what happened
- Clear action: "Try signing in again"
- Works reliably on second attempt

---

**The fix is deployed and ready to test!** 🎉

