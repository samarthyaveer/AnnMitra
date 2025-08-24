'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone)
      setIsInstalled(standalone)
    }

    // Check if iOS
    const checkIOS = () => {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
      setIsIOS(ios)
    }

    checkStandalone()
    checkIOS()

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const installEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(installEvent)
      setShowInstallButton(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
      console.log('[PWA] App was installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show install button after a delay if conditions are met
    const timer = setTimeout(() => {
      if (!isInstalled && !isStandalone && (deferredPrompt || isIOS)) {
        setShowInstallButton(true)
      }
    }, 3000) // Show after 3 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [deferredPrompt, isInstalled, isStandalone, isIOS])

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return

    if (isIOS) {
      // Show iOS install instructions
      setShowInstallButton(false)
      // Could show a modal with iOS install instructions here
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt')
      } else {
        console.log('[PWA] User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowInstallButton(false)
    }
  }

  const dismissInstallPrompt = () => {
    setShowInstallButton(false)
    // Remember user dismissed (only on client side)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', 'true')
    }
  }

  // Don't show if already installed or user previously dismissed
  if (isInstalled || isStandalone) return null
  
  // Check dismissal only on client side
  if (typeof window !== 'undefined' && localStorage.getItem('pwa-install-dismissed') === 'true') return null

  if (!showInstallButton) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Install AnnMitra
              </h3>
              <button
                onClick={dismissInstallPrompt}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss install prompt"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isIOS 
                ? "Add to your home screen for a better experience" 
                : "Get the full app experience with offline access and notifications"
              }
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                {isIOS ? 'Learn How' : 'Install App'}
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// iOS Install Instructions Component (optional)
export function IOSInstallInstructions({ onClose }: { onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-modal flex items-center justify-center p-4 z-50"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        background: 'rgba(0, 0, 0, 0.8)',
        transform: 'translateZ(0)',
        willChange: 'backdrop-filter'
      }}
    >
      <div 
        className="glass-nav backdrop-blur-strong max-w-sm w-full p-6"
        style={{
          backdropFilter: 'blur(35px) saturate(180%)',
          WebkitBackdropFilter: 'blur(35px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          transform: 'translateZ(0)',
          willChange: 'backdrop-filter'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Install AnnMitra</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center">
              <span className="text-green-400 font-medium">1</span>
            </div>
            <div>
              <p className="text-white">Tap the <strong>Share</strong> button in Safari</p>
              <p className="text-gray-300">Look for the share icon in the bottom menu</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center">
              <span className="text-green-400 font-medium">2</span>
            </div>
            <div>
              <p className="text-white">Select <strong>&quot;Add to Home Screen&quot;</strong></p>
              <p className="text-gray-300">Scroll down in the share menu to find this option</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center">
              <span className="text-green-400 font-medium">3</span>
            </div>
            <div>
              <p className="text-white">Tap <strong>&quot;Add&quot;</strong> to confirm</p>
              <p className="text-gray-300">AnnMitra will appear on your home screen</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 btn-primary"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}
