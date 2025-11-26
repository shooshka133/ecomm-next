import Stripe from 'stripe'
import { getStripeClient } from './services/router'

// Legacy export for backward compatibility
// In API routes, prefer: const stripe = await getStripeClient()
let stripeInstance: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    // Lazy initialization for backward compatibility
    if (!stripeInstance) {
      const secretKey = process.env.STRIPE_SECRET_KEY || ''
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY is not set. Use getStripeClient() from lib/services/router for multi-brand support.')
      }
      stripeInstance = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      })
    }
    return (stripeInstance as any)[prop]
  }
})

// Export service router function for multi-brand support
export { getStripeClient, getStripePublishableKey } from './services/router'

