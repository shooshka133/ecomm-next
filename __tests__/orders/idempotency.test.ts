/**
 * Idempotency Tests
 * 
 * Tests for order creation and email sending idempotency
 * 
 * Run with: npm test -- idempotency
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createOrderFromCart } from '@/lib/orders/create'
import { sendOrderConfirmationEmailIdempotent } from '@/lib/orders/email'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(),
            single: vi.fn(),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn(),
          })),
        })),
      })),
      rpc: vi.fn(),
      auth: {
        admin: {
          getUserById: vi.fn(),
        },
      },
    })),
  }
})

describe('Order Creation Idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return existing order if order already exists', async () => {
    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      total: 100,
      status: 'processing',
      stripe_payment_intent_id: 'session-123',
    }

    const { createClient } = await import('@supabase/supabase-js')
    const mockSupabase = createClient as any

    mockSupabase.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
          })),
        })),
      })),
    })

    const result = await createOrderFromCart({
      userId: 'user-123',
      sessionId: 'session-123',
      cartItems: [],
    })

    expect(result.success).toBe(true)
    expect(result.wasDuplicate).toBe(true)
    expect(result.order?.id).toBe('order-123')
  })

  it('should create new order if order does not exist', async () => {
    const mockOrder = {
      id: 'order-456',
      user_id: 'user-123',
      total: 100,
      status: 'processing',
      stripe_payment_intent_id: 'session-456',
    }

    const { createClient } = await import('@supabase/supabase-js')
    const mockSupabase = createClient as any

    // First call: no existing order
    // Second call: create order
    mockSupabase.mockReturnValue({
      from: vi.fn((table) => {
        if (table === 'orders') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                single: vi.fn(),
              })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
              })),
            })),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
          delete: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        }
      }),
    })

    const result = await createOrderFromCart({
      userId: 'user-123',
      sessionId: 'session-456',
      cartItems: [
        {
          id: 'cart-1',
          user_id: 'user-123',
          product_id: 'product-1',
          quantity: 1,
          products: { price: 100, name: 'Product 1' },
        },
      ],
    })

    expect(result.success).toBe(true)
    expect(result.wasDuplicate).toBe(false)
    expect(result.order?.id).toBe('order-456')
  })

  it('should handle duplicate constraint violation gracefully', async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const mockSupabase = createClient as any

    mockSupabase.mockReturnValue({
      from: vi.fn((table) => {
        if (table === 'orders') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: { code: '23505', message: 'Duplicate key' },
                }),
              })),
            })),
          }
        }
        return {}
      }),
    })

    const result = await createOrderFromCart({
      userId: 'user-123',
      sessionId: 'session-123',
      cartItems: [],
    })

    // Should handle duplicate gracefully
    expect(result.success).toBe(true)
  })
})

describe('Email Sending Idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return early if email was already sent', async () => {
    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      confirmation_email_sent: true,
    }

    const { createClient } = await import('@supabase/supabase-js')
    const mockSupabase = createClient as any

    mockSupabase.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
          })),
        })),
      })),
      auth: {
        admin: {
          getUserById: vi.fn(),
        },
      },
    })

    const result = await sendOrderConfirmationEmailIdempotent({
      orderId: 'order-123',
      userId: 'user-123',
    })

    expect(result.success).toBe(true)
    expect(result.wasAlreadySent).toBe(true)
  })

  it('should send email if not already sent', async () => {
    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      total: 100,
      created_at: new Date().toISOString(),
      confirmation_email_sent: false,
    }

    const { createClient } = await import('@supabase/supabase-js')
    const mockSupabase = createClient as any

    mockSupabase.mockReturnValue({
      from: vi.fn((table) => {
        if (table === 'orders') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
              })),
            })),
          }
        }
        if (table === 'order_items') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'item-1',
                    order_id: 'order-123',
                    product_id: 'product-1',
                    quantity: 1,
                    price: 100,
                    products: { name: 'Product 1', price: 100 },
                  },
                ],
                error: null,
              }),
            })),
          }
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            })),
          })),
        }
      }),
      rpc: vi.fn().mockResolvedValue({ error: null }),
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: { user: { email: 'test@example.com' } },
          }),
        },
      },
    })

    // Mock email sending function
    vi.mock('@/lib/email/send', () => ({
      sendOrderConfirmationEmail: vi.fn().mockResolvedValue({
        success: true,
        emailId: 'email-123',
      }),
    }))

    const result = await sendOrderConfirmationEmailIdempotent({
      orderId: 'order-123',
      userId: 'user-123',
    })

    expect(result.success).toBe(true)
    expect(result.wasAlreadySent).toBe(false)
  })
})

