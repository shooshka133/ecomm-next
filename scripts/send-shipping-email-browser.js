/**
 * Browser Console Script - Send Shipping Email
 * 
 * Copy and paste this into your browser console on your website
 * 
 * Usage:
 *   1. Go to your website (store.shooshka.online)
 *   2. Open browser console (F12)
 *   3. Paste this entire script
 *   4. Change the orderId below
 *   5. Press Enter
 */

const orderId = '3a40bb52-98da-4f96-9262-4a7ca2d8e5e3' // Change this to your order ID
const force = true // Set to true if order was shipped more than 24 hours ago

console.log('📦 Sending shipping email for order:', orderId)

fetch('/api/send-shipping-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    orderId,
    force
  })
})
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Success!')
      console.log('   Email ID:', data.emailId)
      console.log('   Message:', data.message)
    } else {
      console.error('❌ Failed!')
      console.error('   Error:', data.error)
      if (data.hint) {
        console.log('   Hint:', data.hint)
      }
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
  })

