import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
  Button,
} from '@react-email/components'

interface DeliveryNotificationEmailProps {
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
  orderUrl?: string
  orderId?: string
}

export default function DeliveryNotificationEmail({
  orderNumber = 'ORD-12345',
  customerName = 'John Doe',
  customerEmail = 'customer@example.com',
  trackingNumber = 'TRK-123456789',
  deliveredDate = new Date().toLocaleDateString(),
  orderItems = [],
  total = 0,
  orderUrl,
  orderId,
}: DeliveryNotificationEmailProps) {
  // Use provided orderUrl or fallback to production URL, then append /orders path
  // If orderId is provided, add it as a query parameter to auto-expand the order
  let baseUrl = orderUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://store.shooshka.online'
  
  // Ensure baseUrl doesn't have trailing slash
  baseUrl = baseUrl.replace(/\/$/, '')
  
  // Ensure /orders is always appended (not already in baseUrl)
  const ordersPageUrl = baseUrl.includes('/orders') ? baseUrl : `${baseUrl}/orders`
  
  // Construct final URL with orderId query parameter
  const orderPageUrl = orderId ? `${ordersPageUrl}?orderId=${encodeURIComponent(orderId)}` : ordersPageUrl
  return (
    <Html>
      <Head />
      <Preview>Your order #{orderNumber} has been delivered! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>Ecommerce Start</Heading>
            <Text style={tagline}>Delivery Confirmed!</Text>
          </Section>

          {/* Success Message */}
          <Section style={successBox}>
            <Text style={successIcon}>🎉</Text>
            <Text style={successText}>Order Delivered</Text>
            <Text style={orderNumberText}>Order #{orderNumber}</Text>
            <Text style={dateText}>Delivered on {deliveredDate}</Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Great news! Your order has been successfully delivered. We hope you love your purchase!
            </Text>
          </Section>

          {/* Tracking Info */}
          <Section style={trackingBox}>
            <Text style={trackingLabel}>Tracking Number</Text>
            <Text style={trackingNumberStyle}>{trackingNumber}</Text>
            <Text style={deliveredText}>
              ✅ Package delivered
            </Text>
          </Section>

          {/* Order Items */}
          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Items Delivered
            </Heading>
            {orderItems.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemNameColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceColumn}>
                  <Text style={itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
            <Hr style={divider} />
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Total</Text>
              </Column>
              <Column style={itemPriceColumn}>
                <Text style={totalAmount}>${total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          {/* Call to Action */}
          <Section style={section}>
            <Text style={text}>
              You can view your order details and leave a review anytime.
            </Text>
            <Button style={button} href={orderPageUrl}>
              View Order Details
            </Button>
          </Section>

          {/* Feedback Section */}
          <Section style={feedbackBox}>
            <Heading as="h3" style={feedbackHeading}>
              How did we do?
            </Heading>
            <Text style={feedbackText}>
              We&apos;d love to hear about your experience! Your feedback helps us improve.
            </Text>
            <Text style={feedbackText}>
              ⭐ Rate your purchase • 📝 Leave a review
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order?
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

const heading = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#4F46E5',
  margin: '0 0 8px',
}

const tagline = {
  fontSize: '16px',
  color: '#6B7280',
  margin: '0',
}

const successBox = {
  backgroundColor: '#F0FDF4',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '0 32px 32px',
}

const successIcon = {
  fontSize: '48px',
  margin: '0 0 8px',
}

const successText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#16A34A',
  margin: '0 0 8px',
}

const orderNumberText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 4px',
}

const dateText = {
  fontSize: '14px',
  color: '#6B7280',
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
  backgroundColor: '#EEF2FF',
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
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#4F46E5',
  margin: '0 0 8px',
  letterSpacing: '0.5px',
}

const deliveredText = {
  fontSize: '16px',
  color: '#16A34A',
  fontWeight: '600',
  margin: '0',
}

const subheading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 16px',
}

const itemRow = {
  marginBottom: '16px',
}

const itemNameColumn = {
  verticalAlign: 'top' as const,
}

const itemName = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#111827',
  margin: '0 0 4px',
}

const itemQuantity = {
  fontSize: '14px',
  color: '#6B7280',
  margin: '0',
}

const itemPriceColumn = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
}

const itemPrice = {
  fontSize: '16px',
  color: '#111827',
  margin: '0',
}

const divider = {
  borderColor: '#E5E7EB',
  margin: '16px 0',
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

const totalRow = {
  marginTop: '16px',
}

const totalLabel = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
}

const totalAmount = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#4F46E5',
  margin: '0',
}

const feedbackBox = {
  backgroundColor: '#FEF3C7',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '0 32px 32px',
}

const feedbackHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#92400E',
  margin: '0 0 12px',
}

const feedbackText = {
  fontSize: '14px',
  color: '#78350F',
  margin: '0 0 8px',
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

