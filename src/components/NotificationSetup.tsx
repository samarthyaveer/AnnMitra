'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationSetup() {
  const { isSupported, requestPermission } = useNotifications()
  const [hasAsked, setHasAsked] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isSupported && !hasAsked && Notification.permission === 'default') {
      // Show notification prompt after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isSupported, hasAsked])

  const handleEnable = async () => {
    setHasAsked(true)
    try {
      const granted = await requestPermission()
      if (granted) {
        setIsVisible(false)
      }
    } catch (error) {
      console.log('Notification setup not complete:', error)
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setHasAsked(true)
    setIsVisible(false)
  }

  if (!isVisible || !isSupported) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 rounded-lg p-4 max-w-sm shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white">Stay Updated</h3>
          <p className="text-xs text-gray-400 mt-1">
            Get notified when your food is claimed or when new listings are available near you.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
