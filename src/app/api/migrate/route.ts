import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Migrate all existing 'expired' status to 'unavailable' status
    const { data: migratedListings, error: listingsError } = await supabaseAdmin
      .from('listings')
      .update({ status: 'unavailable' })
      .eq('status', 'expired')
      .select('id, title')

    if (listingsError) {
      console.error('Error migrating listings:', listingsError)
      return NextResponse.json({ error: 'Failed to migrate listings' }, { status: 500 })
    }

    // Also update any notification types that reference 'listing_expired'
    const { data: migratedNotifications, error: notificationsError } = await supabaseAdmin
      .from('notifications')
      .update({ type: 'listing_unavailable' })
      .eq('type', 'listing_expired')
      .select('id')

    if (notificationsError) {
      console.error('Error migrating notifications:', notificationsError)
    }

    const result = {
      migratedListings: migratedListings?.length || 0,
      migratedNotifications: migratedNotifications?.length || 0,
      timestamp: new Date().toISOString()
    }

    console.log('Migration completed:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in migration process:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET method for manual migration
export async function GET() {
  return POST()
}
