import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fcm_token } = body

    if (!fcm_token) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 })
    }

    // Update user's FCM token
    const { error } = await supabaseAdmin
      .from('users')
      .update({ fcm_token })
      .eq('clerk_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating FCM token:', error)
      return NextResponse.json({ error: 'Failed to update FCM token' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'FCM token updated successfully' })
  } catch (error) {
    console.error('Error in FCM token API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove user's FCM token (user disabled notifications)
    const { error } = await supabaseAdmin
      .from('users')
      .update({ fcm_token: null, notifications_enabled: false })
      .eq('clerk_id', userId)

    if (error) {
      console.error('Error removing FCM token:', error)
      return NextResponse.json({ error: 'Failed to remove FCM token' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Notifications disabled successfully' })
  } catch (error) {
    console.error('Error in FCM token API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
