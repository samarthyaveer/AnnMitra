'use client'

import { useEffect, useState } from 'react'
import { getFCMToken, onMessageListener } from '@/lib/firebase'

interface UseNotificationsReturn {
  token: string | null
  requestPermission: () => Promise<boolean>
  isSupported: boolean
}

export function useNotifications(): UseNotificationsReturn {
  const [token, setToken] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.log('Notifications not supported')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        console.log('Notification permission granted')
        
        // Try to get FCM token
        const fcmToken = await getFCMToken()
        if (fcmToken) {
          setToken(fcmToken)
          
          // Send token to server
          try {
            await fetch('/api/fcm-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fcm_token: fcmToken })
            })
            console.log('FCM token sent to server')
          } catch (error) {
            console.error('Error sending FCM token to server:', error)
          }
        } else {
          console.log('FCM token not available (VAPID key may not be configured)')
          // Still return true as basic notification permission is granted
        }
        
        return true
      } else {
        console.log('Notification permission denied')
        return false
      }
    } catch (error: any) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  useEffect(() => {
    if (isSupported && Notification.permission === 'granted') {
      // Auto-get token if permission already granted
      getFCMToken().then((fcmToken) => {
        if (fcmToken) {
          setToken(fcmToken)
        }
      })
    }
  }, [isSupported])

  useEffect(() => {
    if (isSupported) {
      // Listen for foreground messages
      onMessageListener().then((payload: any) => {
        console.log('Received foreground message:', payload)
        
        // Show notification if app is in foreground
        if (payload.notification) {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/icon.svg'
          })
        }
      }).catch((error) => {
        console.log('Error listening for messages:', error)
      })
    }
  }, [isSupported])

  return {
    token,
    requestPermission,
    isSupported
  }
}
