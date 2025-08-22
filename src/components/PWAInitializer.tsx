'use client'

import { useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'

export default function PWAInitializer() {
  const { registerServiceWorker, requestPersistentStorage } = usePWA()

  useEffect(() => {
    // Initialize PWA features
    const initializePWA = async () => {
      try {
        console.log('[PWA] Initializing PWA features...')

        // Register service worker
        const swRegistered = await registerServiceWorker()
        if (swRegistered) {
          console.log('[PWA] Service worker registered successfully')
        }

        // Request persistent storage
        const persistentStorage = await requestPersistentStorage()
        if (persistentStorage) {
          console.log('[PWA] Persistent storage granted')
        }

        // Handle visibility change for better performance
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            // App became visible, could refresh data here
            console.log('[PWA] App became visible')
          }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
      } catch (error) {
        console.error('[PWA] Initialization failed:', error)
      }
    }

    initializePWA()
  }, [registerServiceWorker, requestPersistentStorage])

  return null // This component doesn't render anything
}
