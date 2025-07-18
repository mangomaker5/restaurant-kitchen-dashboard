import React, { useState } from 'react'
import { GroupedOrder } from '../lib/supabase'

interface OrderCardProps {
  order: GroupedOrder
  onComplete: (orderUuid: string) => Promise<void>
  onPrint: (order: GroupedOrder) => void
  isNew?: boolean
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onComplete, onPrint, isNew = false }) => {
  const [isCompleting, setIsCompleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleComplete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsCompleting(true)
    try {
      await onComplete(order.order_uuid)
    } catch (error) {
      console.error('Error completing order:', error)
    } finally {
      setIsCompleting(false)
      setShowConfirm(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const orderTime = new Date(timestamp)
    const diffMs = now.getTime() - orderTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ${diffMins % 60}m ago`
  }

  const getUrgencyColor = (timestamp: string) => {
    const now = new Date()
    const orderTime = new Date(timestamp)
    const diffMins = Math.floor((now.getTime() - orderTime.getTime()) / 60000)
    
    if (diffMins > 30) return 'border-red-500 bg-red-50'
    if (diffMins > 15) return 'border-yellow-500 bg-yellow-50'
    return 'border-green-500 bg-green-50'
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 mb-4 transition-all duration-300 ${getUrgencyColor(order.created_at)} ${isNew ? 'animate-pulse' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Order #{order.order_uuid.slice(-8)}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            ⏰ {formatTime(order.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{order.item_count} items</p>
          <p className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <span className="font-medium text-gray-900">{item.item_name}</span>
              <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
            </div>
            <span className="text-gray-700 font-medium">${item.subtotal.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onPrint(order)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px]"
        >
          🖨️ Print Order
        </button>
        
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={`flex-1 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px] ${
            showConfirm 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          } ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCompleting ? (
            <span className="animate-spin">⏳</span>
          ) : showConfirm ? (
            '✓ Confirm'
          ) : (
            <>✅ Complete</>
          )}
        </button>
      </div>

      {showConfirm && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Click "Confirm" to complete this order. This action cannot be undone.
          <button
            onClick={() => setShowConfirm(false)}
            className="ml-2 text-yellow-600 hover:text-yellow-800 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}