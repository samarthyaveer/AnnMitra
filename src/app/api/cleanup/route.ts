import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const now = new Date().toISOString()
    
    // First, migrate any existing 'expired' status to 'unavailable'
    const { data: migratedListings, error: migrateError } = await supabaseAdmin
      .from('listings')
      .update({ status: 'unavailable' })
      .eq('status', 'expired')
      .select('id')

    if (migrateError) {
      console.error('Error migrating expired listings:', migrateError)
    } else if (migratedListings && migratedListings.length > 0) {
      console.log(`Migrated ${migratedListings.length} expired listings to unavailable`)
    }
    
    // Update listings where available_until has passed and status is still 'available'
    const { data: unavailableListings, error: unavailableError } = await supabaseAdmin
      .from('listings')
      .update({ 
        status: 'unavailable',
        updated_at: now
      })
      .lt('available_until', now)
      .eq('status', 'available')
      .select('id, title, available_until')

    if (unavailableError) {
      console.error('Error updating unavailable listings:', unavailableError)
      return NextResponse.json({ error: 'Failed to update unavailable listings' }, { status: 500 })
    }

    // Also cancel any pending pickups for unavailable listings
    const allUnavailableIds = [
      ...(migratedListings?.map(l => l.id) || []),
      ...(unavailableListings?.map(l => l.id) || [])
    ]
    
    const { data: cancelledPickups, error: pickupError } = await supabaseAdmin
      .from('pickups')
      .update({
        status: 'cancelled'
      })
      .in('listing_id', allUnavailableIds)
      .neq('status', 'completed')
      .select('id')

    if (pickupError) {
      console.error('Error cancelling pickups for unavailable listings:', pickupError)
    }

    const result = {
      migratedListings: migratedListings?.length || 0,
      unavailableListings: unavailableListings?.length || 0,
      cancelledPickups: cancelledPickups?.length || 0,
      timestamp: now
    }

    console.log('Cleanup completed:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in cleanup process:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Manual cleanup endpoint - only accessible via API calls
export async function GET() {
  return POST() // Same logic for manual cleanup
}
