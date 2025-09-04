// src/components/SessionStatusIndicator.tsx
import React from 'react'
import { useSessionStatus } from '../hooks/useSessionStatus'

const SessionStatusIndicator: React.FC = () => {
  const { isExpiringSoon, timeLeft, isExpired, refreshSession } = useSessionStatus()

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRefresh = async () => {
    await refreshSession()
  }

  if (isExpired) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>Sesión Expirada</span>
        <button
          onClick={handleRefresh}
          className="ml-2 px-2 py-0.5 bg-red-200 hover:bg-red-300 rounded text-xs"
        >
          Renovar
        </button>
      </div>
    )
  }

  if (isExpiringSoon) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Expira en {formatTime(timeLeft)}</span>
        <button
          onClick={handleRefresh}
          className="ml-2 px-2 py-0.5 bg-yellow-200 hover:bg-yellow-300 rounded text-xs"
        >
          Extender
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Activa</span>
    </div>
  )
}

export default SessionStatusIndicator
