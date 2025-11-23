import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components'

interface ShippingNotificationEmailProps {
  orderNumber: string
  customerName: string
  trackingNumber: string
  estimatedDelivery?: string
  shippedDate: string
  orderUrl?: string
  orderId?: string
}

export default function ShippingNotificationEmail({
  orderNumber = 'ORD-12345',
  customerName = 'John Doe',
  trackingNumber = 'TRK-20251121-10001',
  estimatedDelivery,
  shippedDate = new Date().toLocaleDateString(),
  orderUrl,
  orderId,
}: ShippingNotificationEmailProps) {
  // Use provided orderUrl or fallback to production URL, then append /orders path
  // If orderId is provided, add it as a query parameter to auto-expand the order
  const baseUrl = orderUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://store.shooshka.online'
  // Ensure /orders is always appended
  const ordersPageUrl = `${baseUrl}/orders`
  const orderPageUrl = orderId ? `${ordersPageUrl}?orderId=${orderId}` : ordersPageUrl
  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber} has shipped! 📦</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={emoji}>📦</Text>
            <Heading style={heading}>Your Order Has Shipped!</Heading>
          </Section>

          {/* Shipping Box */}
          <Section style={shippingBox}>
            <Text style={shippingLabel}>Order #{orderNumber}</Text>
            <Text style={shippedText}>Shipped on {shippedDate}</Text>
          </Section>

          {/* Message */}
          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Good news! Your order has been shipped and is on its way to you. 🎉
            </Text>
          </Section>

          {/* Tracking Info */}
          <Section style={trackingBox}>
            <Text style={trackingLabel}>Tracking Number</Text>
            <Text style={trackingNumberStyle}>{trackingNumber}</Text>
            {estimatedDelivery && (
              <>
                <Hr style={divider} />
                <Text style={deliveryLabel}>Estimated Delivery</Text>
                <Text style={deliveryDate}>{estimatedDelivery}</Text>
              </>
            )}
          </Section>

          {/* Call to Action */}
          <Section style={section}>
            <Text style={text}>
              You can track your package status anytime by visiting your orders page.
            </Text>
            <Button style={button} href={orderPageUrl}>
              View Order Details
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your shipment?
            </Text>
            <Text style={footerText}>
              Reply to this email or contact us at support@ecommercestart.com
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerSmall}>
              © {new Date().getFullYear()} Ecommerce Start. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 32px 20px',
  textAlign: 'center' as const,
}

const emoji = {
  fontSize: '64px',
  margin: '0 0 16px',
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0',
}

const shippingBox = {
  backgroundColor: '#DBEAFE',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '0 32px 32px',
}

const shippingLabel = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1E40AF',
  margin: '0 0 4px',
}

const shippedText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
}

const section = {
  padding: '0 32px',
  marginBottom: '32px',
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 16px',
}

const trackingBox = {
  backgroundColor: '#F3F4F6',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '0 32px 32px',
}

const trackingLabel = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0 0 8px',
}

const trackingNumberStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0',
  letterSpacing: '1px',
  fontFamily: 'monospace',
}

const divider = {
  borderColor: '#D1D5DB',
  margin: '20px 0',
}

const deliveryLabel = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0 0 4px',
}

const deliveryDate = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
}

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 20px',
  margin: '24px auto',
  maxWidth: '280px',
}

const footer = {
  padding: '32px 32px 0',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0 0 8px',
}

const footerDivider = {
  borderColor: '#E5E7EB',
  margin: '24px 0',
}

const footerSmall = {
  fontSize: '12px',
  color: '#9CA3AF',
  margin: '0',
}

