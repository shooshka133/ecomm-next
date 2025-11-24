/**
 * Send Shipping Email Script
 * 
 * Usage:
 *   node scripts/send-shipping-email.js <orderId> [force]
 * 
 * Examples:
 *   node scripts/send-shipping-email.js 3a40bb52-98da-4f96-9262-4a7ca2d8e5e3
 *   node scripts/send-shipping-email.js 3a40bb52-98da-4f96-9262-4a7ca2d8e5e3 force
 */

const orderId = process.argv[2]
const force = process.argv[3] === 'force' || process.argv[3] === 'true'

if (!orderId) {
  console.error('❌ Error: Order ID is required')
  console.log('\nUsage: node scripts/send-shipping-email.js <orderId> [force]')
  console.log('Example: node scripts/send-shipping-email.js 3a40bb52-98da-4f96-9262-4a7ca2d8e5e3 force')
  process.exit(1)
}

// Use production URL by default, or localhost if LOCAL=true
const baseUrl = process.env.LOCAL === 'true' 
  ? 'http://localhost:3000'
  : process.env.NEXT_PUBLIC_APP_URL || 'https://store.shooshka.online'

const endpoint = `${baseUrl}/api/send-shipping-email`

console.log('📦 Sending shipping email...')
console.log(`   Order ID: ${orderId}`)
console.log(`   Endpoint: ${endpoint}`)
console.log(`   Force: ${force ? 'Yes (bypass 24h check)' : 'No'}`)
console.log('')

fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    orderId,
    force
  })
})
  .then(async (res) => {
    const data = await res.json()
    
    if (res.ok && data.success) {
      console.log('✅ Success!')
      console.log(`   Email ID: ${data.emailId}`)
      console.log(`   Message: ${data.message}`)
    } else {
      console.error('❌ Failed!')
      console.error(`   Error: ${data.error || 'Unknown error'}`)
      if (data.hint) {
        console.log(`   Hint: ${data.hint}`)
      }
      if (data.shippedAt) {
        console.log(`   Shipped At: ${data.shippedAt}`)
      }
      process.exit(1)
    }
  })
  .catch((err) => {
    console.error('❌ Error:', err.message)
    process.exit(1)
  })

