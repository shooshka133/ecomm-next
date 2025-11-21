# Admin Quick Reference - Order Tracking 📦

## 🚀 Setup (One Time Only)

1. Open Supabase Dashboard: https://app.supabase.com
2. Go to **SQL Editor**
3. Open `supabase-order-tracking.sql`
4. Copy all → Paste → **Run**
5. Done! ✅

---

## 📦 Daily Workflow

### View Orders That Need Shipping:
**Supabase → Table Editor → "orders" table**

Filter: `status = processing`

---

### Ship an Order:
1. Find the order in **orders** table
2. Click the **status** cell
3. **Select "shipped" from dropdown** ⬇️
4. **Tracking auto-generates!** (TRK-20240115-10523) 🎉
5. (Optional) Replace with carrier tracking (USPS, FedEx, etc.)
6. Done! Customer sees it instantly ✅

**✨ New Features:**
- Status dropdown - no typing!
- Tracking numbers auto-generate!
- Can use auto or replace with carrier tracking!

---

### Mark as Delivered:
1. Find the order in **orders** table
2. Click the **status** cell
3. Select **"delivered"**
4. Done! Customer sees green checkmark ✅

---

## 🎯 Order Status Meanings

| Status | What It Means | What Customer Sees |
|--------|---------------|-------------------|
| **processing** | Payment received, preparing shipment | "Order is being processed" 📦 |
| **shipped** | Package sent to customer | "Order is on the way!" 🚚 |
| **delivered** | Customer received it | "Order delivered!" ✅ |
| **cancelled** | Order cancelled | "Order cancelled" ❌ |

---

## 💡 Quick Tips

### Add Tracking Number:
When you set status to "shipped", also add the tracking number.
Customers will see it prominently!

### Check by Email:
```sql
SELECT o.id, o.status, o.tracking_number, u.email
FROM orders o
JOIN auth.users u ON o.user_id = u.id
WHERE u.email = 'customer@email.com'
ORDER BY o.created_at DESC;
```

### View Today's Orders:
```sql
SELECT id, total, status, created_at
FROM orders
WHERE created_at::date = CURRENT_DATE
ORDER BY created_at DESC;
```

---

## 🔥 Most Used Actions

### Ship Multiple Orders:
Supabase → orders table → Select multiple rows → **Bulk Edit** → status = "shipped"

### Find Old Unshipped Orders:
```sql
SELECT id, created_at
FROM orders
WHERE status = 'processing'
  AND created_at < NOW() - INTERVAL '3 days'
ORDER BY created_at ASC;
```

---

## 🎉 That's It!

**Super simple:**
1. Processing → Shipped → Delivered
2. Just change the status in Supabase
3. System handles everything else!

**Need more help?** See `ORDER_TRACKING_GUIDE.md`

