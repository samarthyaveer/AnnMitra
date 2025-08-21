import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        owner:users!owner_id (
          name,
          organization_name
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if listing exists and user owns it
    const { data: existingListing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (listingError || !existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (existingListing.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this listing' }, { status: 403 })
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
      address,
      pickup_location_lat,
      pickup_location_lng
    } = body

    // Validate required fields
    if (!title || !quantity || !available_until || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update listing using admin client
    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .update({
        title,
        description,
        food_type,
        quantity,
        quantity_unit: quantity_unit || 'meals',
        safety_window_hours: safety_window_hours || 4,
        available_until,
        address,
        pickup_location_lat,
        pickup_location_lng,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if listing exists and user owns it
    const { data: existingListing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('owner_id, image_url')
      .eq('id', id)
      .single()

    if (listingError || !existingListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (existingListing.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this listing' }, { status: 403 })
    }

    // Delete the listing using admin client
    const { error: deleteError } = await supabaseAdmin
      .from('listings')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
    }

    // TODO: Also delete the image from storage if it exists
    // This would require parsing the image_url and calling supabase.storage.from('food-images').remove()

    return NextResponse.json({ message: 'Listing deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
