import { NextRequest, NextResponse } from 'next/server'
import { sendShippingNotificationEmail } from '@/lib/email/send'

/**
 * Test shipping email to a specific email address
 * POST /api/test-shipping-to-email
 * Body: { email: "test@example.com", orderNumber: "ABC123", trackingNumber: "TRK-123" }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, orderNumber, trackingNumber } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    console.log('📧 [Test Shipping Email] Sending to:', email)

    const result = await sendShippingNotificationEmail({
      orderNumber: orderNumber || 'TEST12345',
      customerName: email.split('@')[0],
      customerEmail: email,
      trackingNumber: trackingNumber || 'TRK-' + Date.now(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      shippedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })

    if (result.success) {
      console.log('✅ [Test Shipping Email] Sent successfully!')
      return NextResponse.json({
        success: true,
        message: `Shipping notification sent to ${email}`,
        emailId: result.emailId,
      })
    } else {
      console.error('❌ [Test Shipping Email] Failed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ [Test Shipping Email] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

