import React from 'react'

interface ErrorDisplayProps {
  error: string
  onRetry: () => void
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Connection Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          🔄 Retry Connection
        </button>
      </div>
    </div>
  )
}