'use client'

import { useEffect, useState } from 'react'

interface PWAState {
  isInstalled: boolean
  isStandalone: boolean
  isOnline: boolean
  canInstall: boolean
  platform: 'ios' | 'android' | 'desktop' | 'unknown'
}

export function usePWA() {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstalled: false,
    isStandalone: false,
    isOnline: true,
    canInstall: false,
    platform: 'unknown'
  })

  useEffect(() => {
    // Check platform
    const getPlatform = (): PWAState['platform'] => {
      const userAgent = navigator.userAgent.toLowerCase()
      if (/ipad|iphone|ipod/.test(userAgent)) return 'ios'
      if (/android/.test(userAgent)) return 'android'
      return 'desktop'
    }

    // Check if app is in standalone mode
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://')
    }

    // Check if service worker is supported and registered
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          return !!registration
        } catch (error) {
          console.error('[PWA] Service worker check failed:', error)
          return false
        }
      }
      return false
    }

    // Initialize PWA state
    const initializePWA = async () => {
      const platform = getPlatform()
      const isStandalone = checkStandalone()
      const hasServiceWorker = await checkServiceWorker()
      
      setPWAState(prev => ({
        ...prev,
        platform,
        isStandalone,
        isInstalled: isStandalone,
        isOnline: navigator.onLine,
        canInstall: hasServiceWorker && !isStandalone
      }))
    }

    initializePWA()

    // Listen for online/offline events
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOnline: true }))
      
      // Notify service worker that we're back online
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'NETWORK_ONLINE'
        })
      }
    }

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOnline: false }))
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setPWAState(prev => ({
        ...prev,
        isInstalled: true,
        isStandalone: true,
        canInstall: false
      }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Register service worker
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service workers not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('[PWA] Service worker registered:', registration)

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('[PWA] New service worker available')
              
              // You could show a notification to refresh the app here
              if (window.confirm('New version available! Refresh to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' })
                window.location.reload()
              }
            }
          })
        }
      })

      return true
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error)
      return false
    }
  }

  // Update cache
  const updateCache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_UPDATE'
      })
    }
  }

  // Request persistent storage
  const requestPersistentStorage = async () => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const persistent = await navigator.storage.persist()
        console.log('[PWA] Persistent storage:', persistent)
        return persistent
      } catch (error) {
        console.error('[PWA] Persistent storage request failed:', error)
        return false
      }
    }
    return false
  }

  // Get storage usage
  const getStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0,
          percentage: estimate.quota ? Math.round(((estimate.usage || 0) / estimate.quota) * 100) : 0
        }
      } catch (error) {
        console.error('[PWA] Storage estimate failed:', error)
        return null
      }
    }
    return null
  }

  return {
    ...pwaState,
    registerServiceWorker,
    updateCache,
    requestPersistentStorage,
    getStorageUsage
  }
}

// Hook for PWA installation
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setCanInstall(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('[PWA] Install prompt result:', outcome)
      
      setDeferredPrompt(null)
      setCanInstall(false)
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('[PWA] Install failed:', error)
      return false
    }
  }

  return {
    canInstall,
    installApp
  }
}
