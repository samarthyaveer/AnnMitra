import admin from 'firebase-admin'

// Get service account configuration from environment variables
const getServiceAccount = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKeyId || !privateKey) {
    throw new Error('Missing Firebase service account environment variables')
  }

  return {
    type: "service_account",
    project_id: projectId,
    private_key_id: privateKeyId,
    private_key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
    client_email: clientEmail,
    client_id: "113744917772549757120",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
    universe_domain: "googleapis.com"
  }
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = getServiceAccount()
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  })
}

export const firebaseAdmin = admin
export const messaging = admin.messaging()

// Function to send push notification
export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
    }

    const response = await messaging.send(message)
    console.log('Successfully sent message:', response)
    return { success: true, messageId: response }
  } catch (error) {
    console.error('Error sending message:', error)
    return { success: false, error }
  }
}

// Function to send notification to multiple tokens
export async function sendMulticastNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens,
    }

    const response = await messaging.sendEachForMulticast(message)
    console.log('Successfully sent multicast message:', response)
    return { success: true, response }
  } catch (error) {
    console.error('Error sending multicast message:', error)
    return { success: false, error }
  }
}
