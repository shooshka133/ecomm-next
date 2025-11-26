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

interface OrderConfirmationEmailProps {
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
  orderUrl?: string
  orderId?: string
  brandName?: string
  contactEmail?: string
  primaryColor?: string
}

export default function OrderConfirmationEmail({
  orderNumber = 'ORD-12345',
  customerName = 'John Doe',
  customerEmail = 'customer@example.com',
  orderItems = [],
  total = 0,
  orderDate = new Date().toLocaleDateString(),
  trackingNumber,
  estimatedDelivery,
  orderUrl,
  orderId,
  brandName = 'E-Commerce Store',
  contactEmail = 'support@example.com',
  primaryColor = '#4F46E5',
}: OrderConfirmationEmailProps) {
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
      <Preview>Your order #{orderNumber} has been confirmed! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={{ ...heading, color: primaryColor }}>{brandName}</Heading>
            <Text style={tagline}>Thank you for your order!</Text>
          </Section>

          {/* Success Message */}
          <Section style={successBox}>
            <Text style={successText}>✅ Order Confirmed</Text>
            <Text style={orderNumberText}>Order #{orderNumber}</Text>
            <Text style={dateText}>{orderDate}</Text>
          </Section>

          {/* Greeting */}
          <Section style={section}>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              We&apos;ve received your order and are processing it now. You&apos;ll receive another email when your order ships.
            </Text>
          </Section>

          {/* Order Items */}
          <Section style={section}>
            <Heading as="h2" style={subheading}>
              Order Details
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
                <Text style={{ ...totalAmount, color: primaryColor }}>${total.toFixed(2)}</Text>
              </Column>
            </Row>
          </Section>

          {/* Tracking Info */}
          {trackingNumber && (
            <Section style={trackingBox}>
              <Text style={trackingLabel}>Tracking Number</Text>
              <Text style={{ ...trackingNumberStyle, color: primaryColor }}>{trackingNumber}</Text>
              {estimatedDelivery && (
                <Text style={estimatedText}>
                  Estimated Delivery: {estimatedDelivery}
                </Text>
              )}
            </Section>
          )}

          {/* Call to Action */}
          <Section style={section}>
            <Text style={text}>
              You can track your order status anytime by visiting your orders page.
            </Text>
            <Button style={{ ...button, backgroundColor: primaryColor }} href={orderPageUrl}>
              View Order Details
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order?
            </Text>
            <Text style={footerText}>
              Reply to this email or contact us at {contactEmail}
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerSmall}>
              © {new Date().getFullYear()} {brandName}. All rights reserved.
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
  color: '#4F46E5', // Will be overridden by inline style
  margin: '0',
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
  color: '#4F46E5', // Will be overridden by inline style
  margin: '0 0 8px',
  letterSpacing: '0.5px',
}

const estimatedText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
}

const button = {
  backgroundColor: '#4F46E5', // Will be overridden by inline style
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

