import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'available'
    const food_type = searchParams.get('food_type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const owner = searchParams.get('owner') // For fetching user's own listings

    let query = supabase
      .from('listings')
      .select(`
        *,
        owner:users!owner_id (
          name,
          organization_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // If owner=true, get current user's listings only
    if (owner === 'true') {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Use admin client to bypass RLS for user lookup
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single()

      if (userError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Use admin client for listings query when owner=true
      query = supabaseAdmin
        .from('listings')
        .select(`
          *,
          owner:users!owner_id (
            name,
            organization_name
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)
    } else {
      // For public listings, only show available ones by default
      query = query.eq('status', status)
    }

    if (food_type) {
      query = query.eq('food_type', food_type)
    }

    const { data: listings, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ listings })
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

    // Get user from database to check role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'canteen') {
      return NextResponse.json({ error: 'Only canteen owners can create listings' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      food_type,
      quantity,
      quantity_unit,
      safety_window_hours,
      available_until,
      pickup_location_lat,
      pickup_location_lng,
      address,
      image_url
    } = body

    // Validate required fields
    if (!title || !quantity || !available_until || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        owner_id: user.id,
        title,
        description,
        food_type,
        quantity,
        quantity_unit: quantity_unit || 'meals',
        safety_window_hours: safety_window_hours || 4,
        available_until,
        pickup_location_lat,
        pickup_location_lng,
        address,
        image_url
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
    }

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
