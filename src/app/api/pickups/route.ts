import { auth } from '@clerk/nextjs/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'claimed' or 'created'

    // Get user from database using admin client
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Use admin client for pickups query
    let query = supabaseAdmin
      .from('pickups')
      .select(`
        *,
        listing:listings!listing_id (
          *,
          owner:users!owner_id (
            name,
            organization_name
          )
        ),
        claimer:users!claimer_id (
          name,
          organization_name
        )
      `)
      .order('claimed_at', { ascending: false })

    if (type === 'claimed') {
      // Get pickups where this user is the claimer
      query = query.eq('claimer_id', user.id)
    } else if (type === 'created') {
      // Get pickups for listings owned by this user  
      // Note: we need to filter by the user's listings, not by a nested field
      const { data: userListings } = await supabaseAdmin
        .from('listings')
        .select('id')
        .eq('owner_id', user.id)
      
      const listingIds = userListings?.map(listing => listing.id) || []
      if (listingIds.length > 0) {
        query = query.in('listing_id', listingIds)
      } else {
        // No listings, return empty array
        return NextResponse.json({ pickups: [] })
      }
    } else {
      // Get all pickups related to this user (either as claimer or owner of the listing)
      const { data: userListings } = await supabaseAdmin
        .from('listings')
        .select('id')
        .eq('owner_id', user.id)
      
      const listingIds = userListings?.map(listing => listing.id) || []
      
      if (listingIds.length > 0) {
        query = query.or(`claimer_id.eq.${user.id},listing_id.in.(${listingIds.join(',')})`)
      } else {
        query = query.eq('claimer_id', user.id)
      }
    }

    const { data: pickups, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ pickups })
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
    const { listing_id, notes } = body

    if (!listing_id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if listing exists and is available
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, status, owner_id')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.status !== 'available') {
      return NextResponse.json({ error: 'Listing is not available' }, { status: 400 })
    }

    if (listing.owner_id === user.id) {
      return NextResponse.json({ error: 'Cannot claim your own listing' }, { status: 400 })
    }

    // Check if user already has a pending/confirmed pickup for this listing
    const { data: existingPickup } = await supabase
      .from('pickups')
      .select('id')
      .eq('listing_id', listing_id)
      .eq('claimer_id', user.id)
      .in('status', ['pending', 'confirmed'])
      .single()

    if (existingPickup) {
      return NextResponse.json({ error: 'You already have a pending pickup for this listing' }, { status: 400 })
    }

    // Generate pickup code
    const pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create pickup
    const { data: pickup, error } = await supabase
      .from('pickups')
      .insert({
        listing_id,
        claimer_id: user.id,
        pickup_code: pickupCode,
        notes: notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create pickup' }, { status: 500 })
    }

    // Update listing status to claimed
    await supabase
      .from('listings')
      .update({ status: 'claimed' })
      .eq('id', listing_id)

    return NextResponse.json({ pickup }, { status: 201 })
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
    const { pickup_id, status, notes } = body

    if (!pickup_id || !status) {
      return NextResponse.json({ error: 'Pickup ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['confirmed', 'collected', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if pickup exists and user has permission to update
    const { data: pickup, error: pickupError } = await supabase
      .from('pickups')
      .select(`
        *,
        listing:listings!listing_id (
          owner_id,
          status
        )
      `)
      .eq('id', pickup_id)
      .single()

    if (pickupError || !pickup) {
      return NextResponse.json({ error: 'Pickup not found' }, { status: 404 })
    }

    // Check permission: claimer can cancel, owner can confirm/collect
    const isOwner = pickup.listing.owner_id === user.id
    const isClaimer = pickup.claimer_id === user.id

    if (!isOwner && !isClaimer) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    if (status === 'cancelled' && !isClaimer) {
      return NextResponse.json({ error: 'Only claimer can cancel pickup' }, { status: 403 })
    }

    if ((status === 'confirmed' || status === 'collected') && !isOwner) {
      return NextResponse.json({ error: 'Only owner can confirm or mark as collected' }, { status: 403 })
    }

    // Update pickup
    const updateData: any = { status, notes }
    
    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    } else if (status === 'collected') {
      updateData.collected_at = new Date().toISOString()
    }

    const { data: updatedPickup, error } = await supabase
      .from('pickups')
      .update(updateData)
      .eq('id', pickup_id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update pickup' }, { status: 500 })
    }

    // Update listing status based on pickup status
    let listingStatus = pickup.listing.status
    if (status === 'cancelled') {
      listingStatus = 'available'
    } else if (status === 'collected') {
      listingStatus = 'picked_up'
    }

    if (listingStatus !== pickup.listing.status) {
      await supabase
        .from('listings')
        .update({ status: listingStatus })
        .eq('id', pickup.listing_id)
    }

    return NextResponse.json({ pickup: updatedPickup })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
