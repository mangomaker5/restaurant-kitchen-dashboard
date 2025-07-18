import { useState, useEffect } from 'react'
import { supabase, OrderItem, GroupedOrder } from '../lib/supabase'

export const useOrders = () => {
  const [orders, setOrders] = useState<GroupedOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedToday, setCompletedToday] = useState(0)
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch active orders
      const { data: orderItems, error: ordersError } = await supabase
        .from('order_items')
        .select('*')
        .order('created_at', { ascending: true })

      if (ordersError) throw ordersError

      // Group orders by order_uuid
      const groupedOrders = (orderItems || []).reduce((acc, item) => {
        const existingOrder = acc.find(order => order.order_uuid === item.order_uuid)
        
        if (existingOrder) {
          existingOrder.items.push(item)
          existingOrder.total += item.subtotal
          existingOrder.item_count += item.quantity
        } else {
          acc.push({
            order_uuid: item.order_uuid,
            table_number: item.table_number,
            created_at: item.created_at,
            items: [item],
            total: item.subtotal,
            item_count: item.quantity
          })
        }
        
        return acc
      }, [] as GroupedOrder[])

      // Fetch completed orders count for today
      const today = new Date().toISOString().split('T')[0]
      const { data: completedOrders, error: completedError } = await supabase
        .from('completed_orders')
        .select('order_uuid')
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`)

      if (completedError) throw completedError

      // Count unique completed orders for today
      const uniqueCompletedOrders = new Set(completedOrders?.map(order => order.order_uuid) || [])
      
      setOrders(groupedOrders)
      setCompletedToday(uniqueCompletedOrders.size)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const completeOrder = async (orderUuid: string) => {
    try {
      // Get all items for this order
      const { data: orderItems, error: fetchError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_uuid', orderUuid)

      if (fetchError) throw fetchError
      if (!orderItems || orderItems.length === 0) {
        throw new Error('Order not found')
      }

      // ✅ FIXED: Prepare completed order data - EXCLUDE the 'id' field to avoid conflicts
      const completedOrderData = orderItems.map(item => {
        const { id, ...itemWithoutId } = item  // Remove 'id' field
        return {
          ...itemWithoutId,
          completed_at: new Date().toISOString()
        }
      })

      // Insert into completed_orders table (new IDs will be auto-generated)
      const { error: insertError } = await supabase
        .from('completed_orders')
        .insert(completedOrderData)

      if (insertError) throw insertError

      // Delete from order_items table
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_uuid', orderUuid)

      if (deleteError) throw deleteError

      // Update local state
      setOrders(prev => prev.filter(order => order.order_uuid !== orderUuid))
      setCompletedToday(prev => prev + 1)

      // Remove from new orders set
      setNewOrderIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderUuid)
        return newSet
      })

    } catch (err) {
      console.error('Error completing order:', err)
      throw err
    }
  }

  const printOrder = (order: GroupedOrder) => {
    const printContent = `
      <div style="font-family: monospace; padding: 20px; max-width: 400px;">
        <h2 style="text-align: center; margin-bottom: 20px;">🍽️ KITCHEN ORDER</h2>
        <hr style="border: 1px solid #000; margin: 20px 0;">
        
        <div style="margin-bottom: 20px;">
          <strong>Order #:</strong> ${order.order_uuid.slice(-8)}<br>
          <strong>Table:</strong> ${order.table_number}<br>
          <strong>Time:</strong> ${new Date(order.created_at).toLocaleString()}<br>
          <strong>Items:</strong> ${order.item_count}
        </div>
        
        <hr style="border: 1px solid #000; margin: 20px 0;">
        
        <div style="margin-bottom: 20px;">
          ${order.items.map(item => `
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between;">
              <span><strong>${item.item_name}</strong> x${item.quantity}</span>
              <span>$${item.subtotal.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        
        <hr style="border: 1px solid #000; margin: 20px 0;">
        
        <div style="text-align: right; font-size: 18px; font-weight: bold;">
          <strong>TOTAL: $${order.total.toFixed(2)}</strong>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px;">
          Printed at: ${new Date().toLocaleString()}
        </div>
      </div>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    }
  }

  useEffect(() => {
    fetchOrders()

    // Set up real-time subscription
    const subscription = supabase
      .channel('order_items_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_items'
      }, (payload) => {
        console.log('New order item received:', payload.new)
        
        // Mark this order as new
        const newOrderUuid = (payload.new as OrderItem).order_uuid
        setNewOrderIds(prev => new Set(prev).add(newOrderUuid))
        
        // Remove new status after 5 seconds
        setTimeout(() => {
          setNewOrderIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(newOrderUuid)
            return newSet
          })
        }, 5000)
        
        // Refresh orders
        fetchOrders()
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'order_items'
      }, () => {
        // Refresh orders when items are deleted
        fetchOrders()
      })
      .subscribe()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  return {
    orders,
    loading,
    error,
    completedToday,
    newOrderIds,
    completeOrder,
    printOrder,
    refetch: fetchOrders
  }
}