import { Resend } from 'resend'
import { render } from '@react-email/render'
import OrderConfirmationEmail from './templates/OrderConfirmation'
import ShippingNotificationEmail from './templates/ShippingNotification'

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
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    console.log('🔍 [Email] Starting sendOrderConfirmationEmail...')
    console.log('🔍 [Email] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('🔍 [Email] FROM_EMAIL:', FROM_EMAIL)
    console.log('🔍 [Email] TO_EMAIL:', data.customerEmail)
    
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not set. Skipping email send.')
      return { success: false, error: 'API key not configured' }
    }

    console.log(`📧 Sending order confirmation email to ${data.customerEmail}`)
    console.log('📧 From:', `Ecommerce Start <${FROM_EMAIL}>`)
    console.log('📧 Subject:', `Order Confirmation #${data.orderNumber} - Thank You!`)

    // Render React email component to HTML
    console.log('🔍 [Email] Rendering email template...')
    const emailHtml = await render(OrderConfirmationEmail(data), {
      pretty: false,
    })
    console.log('✅ [Email] Template rendered successfully')
    console.log('🔍 [Email] HTML type:', typeof emailHtml)
    console.log('🔍 [Email] HTML length:', emailHtml?.length || 0)

    const { data: emailData, error } = await resend.emails.send({
      from: `Ecommerce Start <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Order Confirmation #${data.orderNumber} - Thank You!`,
      html: String(emailHtml),
    })

    if (error) {
      console.error('❌ Failed to send order confirmation email:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
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

    // Render React email component to HTML
    const emailHtml = await render(ShippingNotificationEmail(data), {
      pretty: false,
    })

    const { data: emailData, error } = await resend.emails.send({
      from: `Ecommerce Start <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Your Order #${data.orderNumber} Has Shipped! 📦`,
      html: String(emailHtml),
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
 * Send delivery confirmation email (optional)
 */
export async function sendDeliveryConfirmationEmail(data: {
  orderNumber: string
  customerName: string
  customerEmail: string
  deliveredDate: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not set. Skipping email send.')
      return { success: false, error: 'API key not configured' }
    }

    console.log(`📧 Sending delivery confirmation email to ${data.customerEmail}`)

    const { data: emailData, error } = await resend.emails.send({
      from: `Ecommerce Start <${FROM_EMAIL}>`,
      to: [data.customerEmail],
      subject: `Your Order #${data.orderNumber} Has Been Delivered! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5; text-align: center;">🎉 Delivered!</h1>
          <p>Hi ${data.customerName},</p>
          <p>Great news! Your order <strong>#${data.orderNumber}</strong> has been successfully delivered on ${data.deliveredDate}.</p>
          <p>We hope you love your purchase! If you have any questions or concerns, please don't hesitate to reach out.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Order</a>
          </div>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
          <p style="text-align: center; color: #6B7280; font-size: 12px;">© ${new Date().getFullYear()} Ecommerce Start. All rights reserved.</p>
        </div>
      `,
    })

    if (error) {
      console.error('❌ Failed to send delivery confirmation email:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Delivery confirmation email sent successfully! ID: ${emailData?.id}`)
    return { success: true, emailId: emailData?.id }
  } catch (error: any) {
    console.error('❌ Error sending delivery confirmation email:', error)
    return { success: false, error: error.message }
  }
}

