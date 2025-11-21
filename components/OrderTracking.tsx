'use client'

import { Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { Order } from '@/types'

interface OrderTrackingProps {
  order: Order
}

export default function OrderTracking({ order }: OrderTrackingProps) {
  const { status, created_at, shipped_at, delivered_at, tracking_number } = order

  // Define tracking stages
  const stages = [
    {
      key: 'processing',
      label: 'Processing',
      icon: Package,
      date: created_at,
      description: 'Order confirmed and being prepared'
    },
    {
      key: 'shipped',
      label: 'Shipped',
      icon: Truck,
      date: shipped_at,
      description: 'Package is on the way'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: CheckCircle,
      date: delivered_at,
      description: 'Package has been delivered'
    }
  ]

  // Determine which stage we're at
  const getStageStatus = (stageKey: string) => {
    const stageOrder = ['processing', 'shipped', 'delivered']
    const currentIndex = stageOrder.indexOf(status)
    const stageIndex = stageOrder.indexOf(stageKey)

    if (status === 'cancelled') return 'cancelled'
    if (stageIndex < currentIndex) return 'completed'
    if (stageIndex === currentIndex) return 'active'
    return 'pending'
  }

  const formatDate = (date?: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <Clock className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-900 mb-2">Order Cancelled</h3>
        <p className="text-red-700">This order has been cancelled</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 sm:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Order Tracking</h3>

      {/* Tracking Number */}
      {tracking_number && (
        <div className="bg-white rounded-lg p-4 mb-6 border border-indigo-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
              <p className="text-lg font-bold text-indigo-600 font-mono">{tracking_number}</p>
            </div>
            <Truck className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative mb-8">
        {/* Progress stages */}
        <div className="flex justify-between items-start relative">
          {stages.map((stage, index) => {
            const stageStatus = getStageStatus(stage.key)
            const Icon = stage.icon
            const isCompleted = stageStatus === 'completed'
            const isActive = stageStatus === 'active'
            const isPending = stageStatus === 'pending'

            return (
              <div key={stage.key} className="flex flex-col items-center relative z-10 flex-1">
                {/* Icon Circle */}
                <div
                  className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 mb-3
                    ${isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50 scale-110' : ''}
                    ${isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50 scale-110 animate-pulse' : ''}
                    ${isPending ? 'bg-gray-200 border-2 border-gray-300' : ''}
                  `}
                >
                  <Icon
                    className={`
                      w-6 h-6 sm:w-8 sm:h-8
                      ${isCompleted || isActive ? 'text-white' : 'text-gray-400'}
                    `}
                  />
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className={`
                      text-xs sm:text-sm font-bold mb-1
                      ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'}
                    `}
                  >
                    {stage.label}
                  </p>
                  {stage.date && (
                    <p className="text-xs text-gray-600">{formatDate(stage.date)}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block max-w-[100px]">
                    {stage.description}
                  </p>
                </div>

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div className="absolute top-7 sm:top-8 left-1/2 w-full h-1 -z-10">
                    <div
                      className={`
                        h-full transition-all duration-500
                        ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300'}
                      `}
                      style={{ width: 'calc(100% + 0.5rem)' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Status Message */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {status === 'processing' && <Package className="w-5 h-5 text-indigo-600" />}
            {status === 'shipped' && <Truck className="w-5 h-5 text-indigo-600" />}
            {status === 'delivered' && <CheckCircle className="w-5 h-5 text-green-600" />}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">
              {status === 'processing' && 'Your order is being processed'}
              {status === 'shipped' && 'Your order is on the way!'}
              {status === 'delivered' && 'Your order has been delivered!'}
            </h4>
            <p className="text-sm text-gray-600">
              {status === 'processing' && 'We are preparing your items for shipment. You will receive a tracking number once shipped.'}
              {status === 'shipped' && tracking_number && `Track your package with number: ${tracking_number}`}
              {status === 'shipped' && !tracking_number && 'Your package is on its way to you. Tracking information will be updated soon.'}
              {status === 'delivered' && 'Thank you for your purchase! We hope you enjoy your items.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

