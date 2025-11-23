# 📧 Email Sending Locations in Code

This document shows **exactly where** order confirmation emails are sent in the codebase.

---

## 🗺️ Email Sending Flow

```
Payment Complete
    ↓
Stripe Webhook (Primary) → app/api/webhook/route.ts
    ↓
Success Page (Fallback) → app/checkout/success/page.tsx
    ↓
Email API Route → app/api/send-order-email/route.ts
    ↓
Email Function → lib/email/send.ts
    ↓
Resend API → Email Sent! ✅
```

---

## 📍 Location 1: Stripe Webhook (Primary Method)

**File:** `app/api/webhook/route.ts`

**When it runs:**
- Stripe sends webhook event when payment is completed
- This is the **primary** method (happens automatically)

**Code location:**
```typescript
// Line ~182-260
// Send order confirmation email
try {
  log('Preparing to send email...')
  
  // Get user email from Supabase auth
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
  const customerEmail = authUser?.user?.email || session.customer_details?.email
  
  // Send the email
  const emailResult = await sendOrderConfirmationEmail({
    orderNumber: order.id.substring(0, 8).toUpperCase(),
    customerName,
    customerEmail,
    orderItems: emailOrderItems,
    total,
    orderDate: new Date().toLocaleDateString('en-US', {...}),
    trackingNumber: undefined,
  })
  
  if (emailResult.success) {
    log('✅ Order confirmation email sent successfully!')
  }
} catch (emailError) {
  logError('Failed to send confirmation email', emailError)
}
```

**Trigger:** Automatically when Stripe sends `checkout.session.completed` event

---

## 📍 Location 2: Success Page (Fallback Method)

**File:** `app/checkout/success/page.tsx`

**When it runs:**
- User lands on `/checkout/success` page after payment
- Only sends if order was created **very recently** (< 10 seconds)
- This is a **fallback** in case webhook didn't fire

**Code location:**
```typescript
// Line ~75-132
// Check if order was created recently (webhook might still be processing)
const orderCreatedAt = new Date(existingOrder.created_at)
const now = new Date()
const secondsSinceCreation = (now.getTime() - orderCreatedAt.getTime()) / 1000

// Use localStorage to prevent duplicates on refresh
const emailSentKey = `order_email_sent_${existingOrder.id}`
const emailAlreadySent = typeof window !== 'undefined' && 
  localStorage.getItem(emailSentKey) === 'true'

// Only send email if order is very recent AND not already sent
if (secondsSinceCreation < 10 && !emailAlreadySent) {
  console.log('📧 Order created very recently, sending email as fallback...')
  
  // Set localStorage flag IMMEDIATELY to prevent duplicates
  if (typeof window !== 'undefined') {
    localStorage.setItem(emailSentKey, 'true')
  }
  
  // Wait a moment to give webhook time to process
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Call email API
  const response = await fetch('/api/send-order-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: existingOrder.id,
      userId: user.id,
    }),
  })
}
```

**Trigger:** User visits `/checkout/success` page after payment

---

## 📍 Location 3: Manual Order Creation (Fallback)

**File:** `app/checkout/success/page.tsx`

**When it runs:**
- If webhook completely failed and order doesn't exist
- Success page creates order manually
- Then sends email immediately

**Code location:**
```typescript
// Line ~258-295
// Send order confirmation email (webhook didn't fire, so we must send it)
const emailSentKey = `order_email_sent_${order.id}`
const emailAlreadySent = typeof window !== 'undefined' && 
  localStorage.getItem(emailSentKey) === 'true'

if (!emailAlreadySent) {
  console.log('📧 Sending email for manually created order...')
  
  // Set localStorage flag IMMEDIATELY
  if (typeof window !== 'undefined') {
    localStorage.setItem(emailSentKey, 'true')
  }
  
  // Call email API
  const response = await fetch('/api/send-order-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      userId: user.id,
    }),
  })
}
```

**Trigger:** When webhook fails and order is created manually on success page

---

## 📍 Location 4: Email API Route

**File:** `app/api/send-order-email/route.ts`

**When it runs:**
- Called by success page (locations 2 and 3)
- Fetches order details and calls email function

**Code location:**
```typescript
// Line ~11-149
export async function POST(request: NextRequest) {
  const { orderId, userId } = await request.json()
  
  // Fetch order details
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  
  // Get order items
  const { data: orderItems } = await supabaseAdmin
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', orderId)
  
  // Get user details
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
  const customerEmail = authUser.user?.email || 'customer@example.com'
  
  // Send email
  const result = await sendOrderConfirmationEmail({
    orderNumber: order.id.substring(0, 8).toUpperCase(),
    customerName,
    customerEmail,
    orderItems: emailOrderItems,
    total: order.total,
    orderDate: new Date(order.created_at).toLocaleDateString('en-US', {...}),
    trackingNumber: order.tracking_number,
  })
  
  return NextResponse.json({ success: result.success })
}
```

**Trigger:** Called by success page via `fetch('/api/send-order-email')`

---

## 📍 Location 5: Email Sending Function (Core)

**File:** `lib/email/send.ts`

**When it runs:**
- Called by webhook (location 1) OR email API route (location 4)
- This is the **core function** that actually sends the email via Resend

**Code location:**
```typescript
// Line ~56-101
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    console.log('🔍 [Email] Starting sendOrderConfirmationEmail...')
    
    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'API key not configured' }
    }
    
    // Render email template to HTML
    const emailHtml = await render(React.createElement(OrderConfirmationEmail, data))
    
    // Send email via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: `Ecommerce Start <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Order Confirmation #${data.orderNumber} - Thank You!`,
      html: emailHtml,
    })
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true, emailId: emailData?.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

**Trigger:** Called by webhook or email API route

---

## 📍 Location 6: Email Template

**File:** `lib/email/templates/OrderConfirmation.tsx`

**What it does:**
- React component that renders the email HTML
- Used by `lib/email/send.ts` to generate email content

**Code location:**
```typescript
// Entire file - React Email component
export default function OrderConfirmationEmail({
  orderNumber,
  customerName,
  customerEmail,
  orderItems,
  total,
  orderDate,
  trackingNumber,
  estimatedDelivery,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        {/* Email content */}
      </Body>
    </Html>
  )
}
```

---

## 🔄 Complete Flow Example

### Scenario 1: Webhook Works (Normal Flow)

1. **Payment completes** → Stripe sends webhook
2. **Webhook receives event** → `app/api/webhook/route.ts` (Line ~50)
3. **Webhook creates order** → Supabase database
4. **Webhook sends email** → `app/api/webhook/route.ts` (Line ~210) → `lib/email/send.ts` → Resend ✅
5. **User lands on success page** → `app/checkout/success/page.tsx`
6. **Success page checks** → Order exists, older than 10 seconds → Assumes webhook sent it → No email sent ✅

**Result:** 1 email sent (from webhook)

---

### Scenario 2: Webhook Fails (Fallback Flow)

1. **Payment completes** → Stripe sends webhook
2. **Webhook fails** → Order not created
3. **User lands on success page** → `app/checkout/success/page.tsx`
4. **Success page waits 3 seconds** → Checks for order → Still doesn't exist
5. **Success page creates order manually** → `app/checkout/success/page.tsx` (Line ~200)
6. **Success page sends email** → `app/checkout/success/page.tsx` (Line ~260) → `app/api/send-order-email/route.ts` → `lib/email/send.ts` → Resend ✅

**Result:** 1 email sent (from success page fallback)

---

### Scenario 3: Webhook Delayed (Recent Order)

1. **Payment completes** → Stripe sends webhook
2. **User lands on success page quickly** → Order exists but < 10 seconds old
3. **Success page sends email as fallback** → `app/checkout/success/page.tsx` (Line ~89)
4. **Webhook also sends email** → `app/api/webhook/route.ts` (Line ~210)
5. **localStorage prevents duplicates** → On refresh, no duplicate email ✅

**Result:** 1-2 emails (webhook + fallback, but localStorage prevents duplicates on refresh)

---

## 🛠️ How to Debug Email Sending

### Check Webhook Logs:
```bash
# Vercel Dashboard → Deployments → Functions → webhook
# Look for: "[Webhook] ✅ Order confirmation email sent successfully!"
```

### Check Success Page Logs:
```bash
# Browser Console
# Look for: "📧 Order created very recently, sending email as fallback..."
# Or: "📧 Email already sent for this order (localStorage), skipping..."
```

### Check Email API Logs:
```bash
# Vercel Dashboard → Deployments → Functions → send-order-email
# Look for: "✅ [API] Email sent successfully!"
```

### Check Email Function Logs:
```bash
# Vercel Dashboard → Deployments → Functions
# Look for: "✅ Order confirmation email sent successfully! ID: ..."
```

---

## 📝 Summary

**Email sending happens in 3 main places:**

1. **`app/api/webhook/route.ts`** (Line ~210) - Primary method, automatic
2. **`app/checkout/success/page.tsx`** (Line ~89) - Fallback for recent orders
3. **`app/checkout/success/page.tsx`** (Line ~260) - Fallback for manual order creation

**All three call:**
- **`app/api/send-order-email/route.ts`** (for success page) OR
- **`lib/email/send.ts`** directly (for webhook)

**Which then calls:**
- **`lib/email/templates/OrderConfirmation.tsx`** to render email
- **Resend API** to actually send the email

---

## 🔍 Quick Reference

| Location | File | Line | When |
|----------|------|------|------|
| Webhook | `app/api/webhook/route.ts` | ~210 | Automatic (primary) |
| Success Page (existing order) | `app/checkout/success/page.tsx` | ~89 | Fallback (< 10 sec old) |
| Success Page (manual order) | `app/checkout/success/page.tsx` | ~260 | Fallback (webhook failed) |
| Email API | `app/api/send-order-email/route.ts` | ~116 | Called by success page |
| Email Function | `lib/email/send.ts` | ~57 | Core sending function |
| Email Template | `lib/email/templates/OrderConfirmation.tsx` | All | Email content |

