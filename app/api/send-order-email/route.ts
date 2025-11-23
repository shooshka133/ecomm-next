import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmailIdempotent } from '@/lib/orders/email'

// Structured logging
interface LogContext {
  orderId?: string
  userId?: string
  [key: string]: any
}

const log = (level: 'info' | 'warn' | 'error', message: string, context?: LogContext) => {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  }

  if (level === 'error') {
    console.error(`[SendOrderEmail] ${JSON.stringify(logEntry)}`)
  } else if (level === 'warn') {
    console.warn(`[SendOrderEmail] ${JSON.stringify(logEntry)}`)
  } else {
    console.log(`[SendOrderEmail] ${JSON.stringify(logEntry)}`)
  }
}

export async function POST(request: NextRequest) {
  const correlationId = crypto.randomUUID()

  try {
    const { orderId, userId } = await request.json()

    log('info', 'Send email request received', {
      correlationId,
      orderId,
      userId,
    })

    if (!orderId || !userId) {
      log('error', 'Missing required parameters', { correlationId, orderId, userId })
      return NextResponse.json(
        { error: 'Missing orderId or userId' },
        { status: 400 }
      )
    }

    // Check email configuration
    if (!process.env.RESEND_API_KEY) {
      log('warn', 'RESEND_API_KEY not configured', { correlationId })
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      log('warn', 'RESEND_FROM_EMAIL not configured', { correlationId })
    }

    // Send email using idempotent function
    log('info', 'Sending order confirmation email', { correlationId, orderId, userId })
    
    const result = await sendOrderConfirmationEmailIdempotent({
      orderId,
      userId,
    })

    if (result.success) {
      if (result.wasAlreadySent) {
        log('info', 'Email already sent (idempotent)', {
          correlationId,
          orderId,
          userId,
        })
        return NextResponse.json({
          success: true,
          message: 'Email was already sent',
          wasAlreadySent: true,
        })
      }

      log('info', 'Email sent successfully', {
        correlationId,
        orderId,
        userId,
        emailId: result.emailId,
      })

      return NextResponse.json({
        success: true,
        emailId: result.emailId,
      })
    } else {
      log('error', 'Email sending failed', {
        correlationId,
        orderId,
        userId,
        error: result.error,
      })

      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    log('error', 'Unexpected error', {
      correlationId,
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
