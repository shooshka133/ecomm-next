'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Settings,
  Eye,
  Edit,
  Palette,
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalOrders: number
  totalRevenue: number
  recentOrders: number
  totalProducts: number
  statusCounts: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
}

interface Order {
  orderId: string
  orderNumber: string
  userEmail: string
  total: number
  status: string
  trackingNumber?: string
  shippedAt?: string
  createdAt: string
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const response = await fetch('/api/list-all-orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  const checkAdminStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/check')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin)
        if (data.isAdmin) {
          loadStats()
          loadOrders()
        }
      } else {
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setCheckingAdmin(false)
      setLoading(false)
    }
  }, [loadStats, loadOrders])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?next=/admin')
      return
    }

    if (user) {
      checkAdminStatus()
    }
  }, [user, authLoading, router, checkAdminStatus])

  const loadOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrderDetails(data.order)
      }
    } catch (error) {
      console.error('Error loading order details:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, tracking_number: trackingNumber }),
      })

      if (response.ok) {
        await loadOrders()
        await loadStats()
        setExpandedOrder(null)
        setOrderDetails(null)
        alert(`Order status updated to ${newStatus}`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to update order'}`)
      }
    } catch (error: any) {
      console.error('Error updating order:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const sendOrderEmail = async (orderId: string, emailType: 'shipping' | 'delivery') => {
    try {
      const endpoint = emailType === 'shipping' 
        ? '/api/send-shipping-email'
        : '/api/send-delivery-email'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert(`${emailType === 'shipping' ? 'Shipping' : 'Delivery'} email sent successfully!`)
      } else {
        alert(`Error: ${data.error || 'Failed to send email'}`)
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'processing':
        return <Package className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  if (authLoading || checkingAdmin || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-xl shadow-md p-8 border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-4">
            You don&apos;t have permission to access the admin dashboard. Admin access is required.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  if (isAdmin === null) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage orders, products, and store operations</p>
          </div>
          <Link
            href="/admin/brand-settings"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg font-semibold text-lg whitespace-nowrap"
          >
            <Palette className="w-5 h-5" />
            Brand Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <ShoppingBag className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Summary */}
      {stats && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.statusCounts.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.statusCounts.processing}</div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.statusCounts.shipped}</div>
              <div className="text-sm text-gray-600">Shipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.statusCounts.delivered}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.statusCounts.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/brand-settings"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg font-semibold text-base"
          >
            <Palette className="w-5 h-5" />
            <span>🎨 Brand Settings</span>
          </Link>
          <Link
            href="/admin/emails"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Send Emails</span>
          </Link>
          <button
            onClick={loadOrders}
            disabled={ordersLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Settings className="w-4 h-4" />
            <span>{ordersLoading ? 'Loading...' : 'Refresh Orders'}</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No orders found</div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">#{order.orderNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.userEmail}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">${Number(order.total).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                      ID: {order.orderId}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-xs text-indigo-600 mt-1">Tracking: {order.trackingNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (expandedOrder === order.orderId) {
                          setExpandedOrder(null)
                          setOrderDetails(null)
                        } else {
                          setExpandedOrder(order.orderId)
                          loadOrderDetails(order.orderId)
                        }
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      {expandedOrder === order.orderId ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.orderId && orderDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                    {orderDetails.order_items && orderDetails.order_items.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                        <div className="space-y-2">
                          {orderDetails.order_items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">
                                {item.products?.name || 'Unknown Product'} x {item.quantity}
                              </span>
                              <span className="font-semibold text-gray-900">${Number(item.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Order Actions:</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <button
                          onClick={() => updateOrderStatus(order.orderId, 'processing')}
                          disabled={order.status === 'processing'}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark Processing
                        </button>
                        <button
                          onClick={() => {
                            const tracking = prompt('Enter tracking number (optional):')
                            updateOrderStatus(order.orderId, 'shipped', tracking || undefined)
                          }}
                          disabled={order.status === 'shipped' || order.status === 'delivered'}
                          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark Shipped
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.orderId, 'delivered')}
                          disabled={order.status === 'delivered'}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark Delivered
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this order?')) {
                              updateOrderStatus(order.orderId, 'cancelled')
                            }
                          }}
                          disabled={order.status === 'cancelled' || order.status === 'delivered'}
                          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel Order
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => {
                            if (order.status !== 'shipped') {
                              alert('Order must be marked as "shipped" before sending shipping email')
                              return
                            }
                            if (confirm('Send shipping notification email to customer?')) {
                              sendOrderEmail(order.orderId, 'shipping')
                            }
                          }}
                          disabled={order.status !== 'shipped'}
                          className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Mail className="w-4 h-4" />
                          Send Shipping Email
                        </button>
                        <button
                          onClick={() => {
                            if (order.status !== 'delivered') {
                              alert('Order must be marked as "delivered" before sending delivery email')
                              return
                            }
                            if (confirm('Send delivery confirmation email to customer?')) {
                              sendOrderEmail(order.orderId, 'delivery')
                            }
                          }}
                          disabled={order.status !== 'delivered'}
                          className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Mail className="w-4 h-4" />
                          Send Delivery Email
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Tip: Update order status first, then send the corresponding email
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

