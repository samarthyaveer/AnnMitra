'use client'

import { useState, useEffect } from 'react'

export default function OfflineIndicator() {
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setShowIndicator(false)
    }

    const handleOffline = () => {
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Show indicator if already offline
    if (!navigator.onLine) {
      setShowIndicator(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div className={`offline-indicator ${showIndicator ? 'show' : ''}`}>
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>You&apos;re offline. Some features may not be available.</span>
      </div>
    </div>
  )
}
