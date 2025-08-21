import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS for user profile retrieval
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ user: user || null })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, role, email, phone, organization_name, campus_location, campus_location_lat, campus_location_lng, fcm_token, notifications_enabled } = body

    console.log('Creating user with data:', { userId, name, role, email, phone, organization_name, campus_location, campus_location_lat, campus_location_lng })

    // Validate required fields
    if (!name || !role || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json({ error: 'Database error while checking user' }, { status: 500 })
    }

    if (existingUser) {
      console.log('User already exists, returning 409 error')
      const errorResponse = { error: 'User profile already exists' }
      console.log('Sending error response:', errorResponse)
      return NextResponse.json(errorResponse, { status: 409 })
    }

    // Create new user using admin client to bypass RLS
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: userId,
        name,
        role,
        email,
        phone,
        organization_name,
        campus_location,
        campus_location_lat,
        campus_location_lng,
        fcm_token,
        notifications_enabled: notifications_enabled !== false // Default to true
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating user:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json({ 
        error: 'Failed to create user', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, organization_name, campus_location, campus_location_lat, campus_location_lng, fcm_token, notifications_enabled } = body

    const updateData: any = {
      name,
      phone,
      organization_name,
      campus_location,
      campus_location_lat,
      campus_location_lng
    }

    // Only update FCM token and notifications if provided
    if (fcm_token !== undefined) {
      updateData.fcm_token = fcm_token
    }
    if (notifications_enabled !== undefined) {
      updateData.notifications_enabled = notifications_enabled
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('clerk_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
