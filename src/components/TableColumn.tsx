import React from 'react'
import { GroupedOrder } from '../lib/supabase'
import { OrderCard } from './OrderCard'

interface TableColumnProps {
  tableNumber: number
  orders: GroupedOrder[]
  onComplete: (orderUuid: string) => Promise<void>
  onPrint: (order: GroupedOrder) => void
  newOrderIds: Set<string>
}

export const TableColumn: React.FC<TableColumnProps> = ({ 
  tableNumber, 
  orders, 
  onComplete, 
  onPrint, 
  newOrderIds 
}) => {
  const tableOrders = orders.filter(order => order.table_number === tableNumber)

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 mb-4 shadow-lg">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          🍽️ Table {tableNumber}
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          {tableOrders.length} active order{tableOrders.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-0">
        {tableOrders.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No active orders</p>
            <p className="text-gray-400 text-sm mt-1">Orders will appear here when placed</p>
          </div>
        ) : (
          tableOrders.map((order) => (
            <OrderCard
              key={order.order_uuid}
              order={order}
              onComplete={onComplete}
              onPrint={onPrint}
              isNew={newOrderIds.has(order.order_uuid)}
            />
          ))
        )}
      </div>
    </div>
  )
}