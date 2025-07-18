import React from 'react'
import { DashboardHeader } from './components/DashboardHeader'
import { TableColumn } from './components/TableColumn'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorDisplay } from './components/ErrorDisplay'
import { useOrders } from './hooks/useOrders'

function App() {
  const { 
    orders, 
    loading, 
    error, 
    completedToday, 
    newOrderIds, 
    completeOrder, 
    printOrder, 
    refetch 
  } = useOrders()

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          totalOrders={orders.length} 
          completedToday={completedToday} 
        />
        
        <div className="flex gap-5 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map(tableNumber => (
            <TableColumn
              key={tableNumber}
              tableNumber={tableNumber}
              orders={orders}
              onComplete={completeOrder}
              onPrint={printOrder}
              newOrderIds={newOrderIds}
            />
          ))}
        </div>
        
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Active Orders</h2>
            <p className="text-gray-500">The kitchen is all caught up! New orders will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App