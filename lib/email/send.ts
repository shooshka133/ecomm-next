import React from 'react'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import OrderConfirmationEmail from './templates/OrderConfirmation'
import ShippingNotificationEmail from './templates/ShippingNotification'
import DeliveryNotificationEmail from './templates/DeliveryNotification'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// From email address
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderItems: Array<{
    name: string
    price: number
    quantity: number
    image_url?: string
  }>
  total: number
  orderDate: string
  trackingNumber?: string
  estimatedDelivery?: string
}

export interface ShippingEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  trackingNumber: string
  estimatedDelivery?: string
  shippedDate: string
  orderUrl?: string
  orderId?: string
}

export interface DeliveryEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  trackingNumber: string
  deliveredDate: string
  orderItems: Array<{
    name: string
    price: number
    quantity: number
    image_url?: string
  }>
  total: number
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    console.log('🔍 [Email] Starting sendOrderConfirmationEmail...')
    console.log('🔍 [Email] Environment check:')
    console.log('  - NODE_ENV:', process.env.NODE_ENV)
    console.log('  - RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('  - RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0)
    console.log('  - RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'NOT SET')
    console.log('  - FROM_EMAIL (final):', FROM_EMAIL)
    console.log('  - TO_EMAIL:', data.customerEmail)
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [Email] RESEND_API_KEY not set in environment variables!')
      console.error('❌ [Email] This usually means environment variables are not configured in Vercel')
      return { success: false, error: 'API key not configured - check Vercel environment variables' }
    }
    
    if (!process.env.RESEND_FROM_EMAIL || FROM_EMAIL === 'onboarding@resend.dev') {
      console.warn('⚠️  [Email] RESEND_FROM_EMAIL not set or using default. Using:', FROM_EMAIL)
    }

    console.log(`📧 Sending order confirmation email to ${data.customerEmail}`)
    console.log('📧 From:', `Ecommerce Start <${FROM_EMAIL}>`)
    console.log('📧 Subject:', `Order Confirmation #${data.orderNumber} - Thank You!`)

    // Render React email component to HTML
    console.log('🔍 [Email] Rendering email template...')
    const emailHtml = await render(React.createElement(OrderConfirmationEmail, data))
    console.log('✅ [Email] Template rendered successfully')
    console.log('🔍 [Email] HTML type:', typeof emailHtml)
    console.log('🔍 [Email] HTML length:', emailHtml?.length || 0)

    const { data: emailData, error } = await resend.emails.send({
      from: `Ecommerce Start <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Order Confirmation #${data.orderNumber} - Thank You!`,
      html: emailHtml,
    })

    if (error) {
      console.error('❌ Failed to send order confirmation email:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      
      // Provide helpful error message for common issues
      let errorMessage = error.message || 'Unknown error'
      if (error.message?.includes('Not authorized to send emails from')) {
        errorMessage = `Domain not verified in Resend: ${FROM_EMAIL}. Please verify the domain in Resend dashboard or use a verified domain. See RESEND_DOMAIN_VERIFICATION.md for instructions.`
      } else if (error.message?.includes('API key')) {
        errorMessage = `Resend API key issue: ${error.message}. Check RESEND_API_KEY in Vercel environment variables.`
      }
      
      return { success: false, error: errorMessage }
    }

    console.log(`✅ Order confirmation email sent successfully! ID: ${emailData?.id}`)
    return { success: true, emailId: emailData?.id }
  } catch (error: any) {
    console.error('❌ Error sending order confirmation email:', error)
    console.error('❌ Error stack:', error.stack)
    return { success: false, error: error.message }
  }
}

/**
 * Send shipping notification email
 */
export async function sendShippingNotificationEmail(data: ShippingEmailData) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not set. Skipping email send.')
      return { success: false, error: 'API key not configured' }
    }

    console.log(`📧 Sending shipping notification email to ${data.customerEmail}`)

    // Ensure orderUrl is set (fallback to production URL)
    // In production, always use production URL (even if localhost is detected)
    // In development, keep localhost for local testing
    const baseUrl = data.orderUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://store.shooshka.online'
    const isProduction = process.env.NODE_ENV === 'production'
    const orderUrl = (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) && isProduction
      ? 'https://store.shooshka.online' 
      : baseUrl

    // Render React email component to HTML
    const emailHtml = await render(React.createElement(ShippingNotificationEmail, {
      ...data,
      orderUrl,
    }))

    const { data: emailData, error } = await resend.emails.send({
      from: `Ecommerce Start <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Your Order #${data.orderNumber} Has Shipped! 📦`,
      html: emailHtml,
    })

    if (error) {
      console.error('❌ Failed to send shipping notification email:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Shipping notification email sent successfully! ID: ${emailData?.id}`)
    return { success: true, emailId: emailData?.id }
  } catch (error: any) {
    console.error('❌ Error sending shipping notification email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send delivery notification email
 */
export async function sendDeliveryNotificationEmail(data: DeliveryEmailData) {
  try {
    console.log('🔍 [Email] Starting sendDeliveryNotificationEmail...')
    console.log('🔍 [Email] TO_EMAIL:', data.customerEmail)
    
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not set. Skipping email send.')
      return { success: false, error: 'API key not configured' }
    }

    console.log(`📧 Sending delivery notification email to ${data.customerEmail}`)

    // Render React email component to HTML
    console.log('🔍 [Email] Rendering delivery email template...')
    const emailHtml = await render(React.createElement(DeliveryNotificationEmail, data))
    console.log('✅ [Email] Template rendered successfully')

    const { data: emailData, error } = await resend.emails.send({
      from: `Ecommerce Start <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Your Order #${data.orderNumber} Has Been Delivered! 🎉`,
      html: emailHtml,
    })

    if (error) {
      console.error('❌ Failed to send delivery notification email:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    console.log(`✅ Delivery notification email sent successfully! ID: ${emailData?.id}`)
    return { success: true, emailId: emailData?.id }
  } catch (error: any) {
    console.error('❌ Error sending delivery notification email:', error)
    console.error('❌ Error stack:', error.stack)
    return { success: false, error: error.message }
  }
}

