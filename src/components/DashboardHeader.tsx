import React, { useState, useEffect } from 'react'

interface DashboardHeaderProps {
  totalOrders: number
  completedToday: number
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  totalOrders, 
  completedToday 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            🎯 Kitchen Dashboard
          </h1>
          <p className="text-gray-600 mt-1">{formatDate(currentTime)}</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
            <p className="text-sm text-gray-500">Active Orders</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{completedToday}</p>
            <p className="text-sm text-gray-500">Completed Today</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{formatTime(currentTime)}</p>
            <p className="text-sm text-gray-500">Current Time</p>
          </div>
        </div>
      </div>
    </div>
  )
}