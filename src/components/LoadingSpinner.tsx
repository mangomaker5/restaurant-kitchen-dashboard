import React from 'react'

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">⏳</div>
        <p className="text-xl text-gray-600">Loading kitchen dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">Connecting to database</p>
      </div>
    </div>
  )
}