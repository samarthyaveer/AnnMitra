import admin from 'firebase-admin'

const serviceAccount = {
  type: "service_account",
  project_id: "annmitra-d6d44",
  private_key_id: "fb1dc747da91132c93dfcdf23b1225968082f19c",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDb5zS5gqqpdKoO\n7MC4OUZpH++xYQ36c+aDO+ECgUj57ZH7cby3ZI+PDQOI1rIOhtQdjdjhq+YHVcHD\nja66cXJPTH/HprM42lb7KNz1lpyjKD28irVhD05WBc5bc/jJReCLPgcg3nawkfXP\nqv55Fagz6jVzXOHtq4UCW0B6s3aV5O0gIet+CarPlQfOYX+22YV2rn3cLwrZHP3Y\nIUn+Sr0Ulq2+15vxJvYSG02chonFuhrKGMWWuz+mKCn9c53vyHnjUUwVNarufAjW\n/CLlwbiPZFI7+xgtWvehXXZGby7LtkjmiRtX3vBVJWap8XdOSFpZbHzU1++M3I1J\naAl2Z/LHAgMBAAECggEAGuDjSmuExaqrYKCim8Hwb8gGCbXVug+xlMfcZGx+CYJ2\nzfeke/wQKgmKrY6ke+8R/TzJzievOaVLRkZKnaJhOP0ePz6KeIADkrZ3b5NFuRGh\nniqMKf1vc0dJZldCCQQAArUFtQhMFJ/6njQF37H8eb/+YYfwW5cT7mpN8tF9xKtZ\nJUsdbFFM3r0KuCgHRxdpUJ3mZDbep55HfbmoUaGdDmAFOSH5YZidn4KfYIXzEb3B\nZaonJqoGsg160IE0Syb0Jt0FkKRoAUNi0+NbSbwfclm37GqD9Qx0gG4w5RGnH6YN\nM+PbPYDX+bvGm4ilHRbq0vcNcvS7fepPBsq/jmEKvQKBgQDzSVLqLlME/HwHoI0R\n/3njqMa6qq9mQYkrO4WarRqXbWXdQBo5k3Cd92n5z0fX/3HZjV8ADJcMaN5Kv4xl\n27kriFdhE6xdlXXvjsg+BPV44ftyso+I0yk6PprOA+DN4DjvBgLI9TEjmHAExYjQ\nk30wkrCoZ75qKy4weBlmmjpHIwKBgQDnZQ/C3hRXv/UlJe2hLlC+Gi6tWKu7ttGL\n0xNuJTtf1UWRa8Qw3Fy19gdo9AwqcSrlnbNm4r1MuTNILTRbNHD9/Jk7LvtKtK7Z\nsVa9GngQv3HYOuayyrB/8zh56ZlyJtBuSLzvGKU4PdfOaXEt67RU+KwPrRcDlEbu\no5UXsdSyDQKBgFVuvEUsO08W8t8izCcz1bPSgubuJWX9QZQC9OnaO+pNKmZFqm/p\njLSMO5TT62C4fVxuPpwfz7M16EnLdhwWyrG00Spv5CmA4MddFohg6WqnwMsIVUsx\nC9s+PNJ3nivtv1CAhd3X7IeZckzaqS7FfELgYFTjCYTy4Od4ZUMYibqNAoGBALxs\n8Fu3qgsWtlJsw0eoRnm3KmFgPmAabCKXXFAqI2JTclYL0nQTTa+iy7/sU2fQRaU7\nONbENnAes6LHpMXMO2Kn6kNma50W6vc8UKymvDSvIM56kFfxc66NaWTlE14AO2RC\n+Q8eG5Rjz7M268IAGRXEdaBCS+ZPPT+gl4z284OVAoGBALvA0HvuP/AbSNqLZBjL\nTAAWLNv3sGOpKngC1gwCzhlhVf+zJJyPvW7fooyZOR8FyIAMZ5Zz3t+TX95Yrk0I\nXf43bQcspdSeTV0kXqX+ka4X3r6JkSdviVmBerMjQSs9dB1wkHkEdvP3CnkIji3V\nXlhqV2JHlhVLLKk8wva54LKi\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@annmitra-d6d44.iam.gserviceaccount.com",
  client_id: "113744917772549757120",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40annmitra-d6d44.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'annmitra-d6d44'
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
