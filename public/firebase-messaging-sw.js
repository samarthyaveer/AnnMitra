// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "AIzaSyDGs4mdZ74wChHJzWM9iiM6bnUH339ENJ4",
  authDomain: "annmitra-d6d44.firebaseapp.com",
  projectId: "annmitra-d6d44",
  storageBucket: "annmitra-d6d44.firebasestorage.app",
  messagingSenderId: "840149072497",
  appId: "1:840149072497:web:4cda04f29b8c4764def9d0",
  measurementId: "G-5GZRBF3ZY6"
}

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload)
  
  const notificationTitle = payload.notification?.title || 'AnnMitra'
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'annmitra-notification',
    data: payload.data
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.')
  
  event.notification.close()
  
  if (event.action === 'view') {
    // Open the app when notification is clicked
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})
