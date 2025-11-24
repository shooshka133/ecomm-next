# Email Scripts

Scripts to manually send shipping and delivery emails.

## Quick Browser Console Commands

### Send Shipping Email

```javascript
fetch('/api/send-shipping-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    orderId: 'YOUR_ORDER_ID_HERE',
    force: true
  })
})
.then(res => res.json())
.then(data => console.log(data.success ? '✅ Success! Email ID: ' + data.emailId : '❌ Failed: ' + data.error))
.catch(err => console.error('❌ Error:', err))
```

### Send Delivery Email

```javascript
fetch('/api/send-delivery-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    orderId: 'YOUR_ORDER_ID_HERE',
    force: true
  })
})
.then(res => res.json())
.then(data => console.log(data.success ? '✅ Success! Email ID: ' + data.emailId : '❌ Failed: ' + data.error))
.catch(err => console.error('❌ Error:', err))
```

## Node.js Scripts

### Send Shipping Email

```bash
# Production
node scripts/send-shipping-email.js <orderId> [force]

# Localhost
LOCAL=true node scripts/send-shipping-email.js <orderId> [force]
```

### Send Delivery Email

```bash
# Production
node scripts/send-delivery-email.js <orderId> [force]

# Localhost
LOCAL=true node scripts/send-delivery-email.js <orderId> [force]
```

## Examples

### Shipping Email for Order ID: 3a40bb52-98da-4f96-9262-4a7ca2d8e5e3

**Browser Console:**
```javascript
fetch('/api/send-shipping-email', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({orderId: '3a40bb52-98da-4f96-9262-4a7ca2d8e5e3', force: true})}).then(r=>r.json()).then(d=>console.log(d.success?'✅ Success! Email ID: '+d.emailId:'❌ Failed: '+d.error)).catch(e=>console.error('❌ Error:',e))
```

**Node.js:**
```bash
node scripts/send-shipping-email.js 3a40bb52-98da-4f96-9262-4a7ca2d8e5e3 force
```

### Delivery Email for Order ID: 3a40bb52-98da-4f96-9262-4a7ca2d8e5e3

**Browser Console:**
```javascript
fetch('/api/send-delivery-email', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({orderId: '3a40bb52-98da-4f96-9262-4a7ca2d8e5e3', force: true})}).then(r=>r.json()).then(d=>console.log(d.success?'✅ Success! Email ID: '+d.emailId:'❌ Failed: '+d.error)).catch(e=>console.error('❌ Error:',e))
```

**Node.js:**
```bash
node scripts/send-delivery-email.js 3a40bb52-98da-4f96-9262-4a7ca2d8e5e3 force
```

## Important Notes

1. **Order Status**: 
   - Shipping email requires order status = `"shipped"`
   - Delivery email requires order status = `"delivered"`

2. **Tracking Number**: Both require a tracking number to be set

3. **Force Parameter**: 
   - Use `force: true` if order was shipped/delivered more than 24 hours ago
   - This bypasses the duplicate protection

4. **Workflow**:
   1. Change order status in Supabase (to "shipped" or "delivered")
   2. Add tracking number if not already set
   3. Run the script (browser console or Node.js)
   4. Email will be sent to customer

