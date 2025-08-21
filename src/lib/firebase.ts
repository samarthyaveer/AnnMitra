import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging'
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyDGs4mdZ74wChHJzWM9iiM6bnUH339ENJ4",
  authDomain: "annmitra-d6d44.firebaseapp.com",
  projectId: "annmitra-d6d44",
  storageBucket: "annmitra-d6d44.firebasestorage.app",
  messagingSenderId: "840149072497",
  appId: "1:840149072497:web:4cda04f29b8c4764def9d0",
  measurementId: "G-5GZRBF3ZY6"
}

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  })
}

// Initialize messaging (only in browser environment)
let messaging: Messaging | null = null
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.log('Messaging not available:', error)
  }
}

export { app, analytics, messaging }

// Function to get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.log('Messaging not available')
    return null
  }
  
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY_HERE' || vapidKey === 'BYour_Actual_VAPID_Key_Here') {
    console.log('VAPID key not configured properly. Please set a valid VAPID key in .env.local')
    return null
  }
  
  try {
    const token = await getToken(messaging, {
      vapidKey: vapidKey
    })
    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

// Function to listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return
    
    onMessage(messaging, (payload) => {
      resolve(payload)
    })
  })
