import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendPushNotification } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    // Get user's ID from clerk_id
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get notifications
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data: notifications, error } = await query.limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json({ success: true, notifications })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type, targetUserId, data } = body

    if (!title || !message || !type || !targetUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get target user
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('id, fcm_token, notifications_enabled')
      .eq('id', targetUserId)
      .single()

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    // Create notification in database
    const { data: notification, error: dbError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: targetUserId,
        title,
        body: message,
        type,
        data: data || {}
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error creating notification:', dbError)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    // Send push notification if user has FCM token and notifications enabled
    if (targetUser.fcm_token && targetUser.notifications_enabled) {
      const pushResult = await sendPushNotification(
        targetUser.fcm_token,
        title,
        message,
        data
      )

      if (!pushResult.success) {
        console.error('Failed to send push notification:', pushResult.error)
        // Don't fail the API call if push notification fails
      }
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, read } = body

    if (!notificationId || typeof read !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user's ID from clerk_id
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update notification
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .update({ read })
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user can only update their own notifications
      .select()
      .single()

    if (error) {
      console.error('Error updating notification:', error)
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
