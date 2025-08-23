import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Create a Supabase admin client for analytics
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    if (type === 'public') {
      // Public analytics for landing page
      const { data, error } = await supabaseAdmin
        .from('analytics_summary')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching public analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
      }

      // Get historical data for charts (last 7 days)
      const { data: historicalData } = await supabaseAdmin
        .rpc('get_daily_stats', { days_back: 7 });

      return NextResponse.json({
        totalMeals: data.total_food_saved || 0,
        totalUsers: data.total_users || 0,
        campusPartners: data.active_canteens || 0,
        successfulPickups: data.successful_pickups || 0,
        totalListings: data.total_listings || 0,
        totalPickups: data.total_pickups || 0,
        historical: historicalData || []
      });
    }

    if (type === 'user' && userId) {
      // Verify authentication
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user role to determine which analytics to fetch
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('clerk_id', clerkUserId)
        .single();

      if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const userRole = userData.role;

      if (userRole === 'canteen') {
        // Canteen analytics
        const { data, error } = await supabaseAdmin
          .rpc('get_canteen_analytics', { user_id_param: userId });

        if (error) {
          console.error('Error fetching canteen analytics:', error);
          return NextResponse.json({ error: 'Failed to fetch canteen analytics' }, { status: 500 });
        }

        // Get canteen historical data
        const { data: historicalData } = await supabaseAdmin
          .rpc('get_canteen_daily_stats', { user_id_param: userId, days_back: 30 });

        const analytics = data[0] || {};
        return NextResponse.json({
          totalListings: analytics.total_listings || 0,
          totalClaims: analytics.total_claims || 0,
          successfulPickups: analytics.successful_pickups || 0,
          totalFoodOffered: analytics.total_food_offered || 0,
          successRate: analytics.success_rate || 0,
          activeDays: analytics.active_days || 0,
          historical: historicalData || []
        });
      } else {
        // Regular user analytics
        const { data, error } = await supabaseAdmin
          .rpc('get_user_analytics', { user_id_param: userId });

        if (error) {
          console.error('Error fetching user analytics:', error);
          return NextResponse.json({ error: 'Failed to fetch user analytics' }, { status: 500 });
        }

        // Get user historical data
        const { data: historicalData } = await supabaseAdmin
          .rpc('get_user_daily_stats', { user_id_param: userId, days_back: 30 });

        const analytics = data[0] || {};
        return NextResponse.json({
          totalPickups: analytics.total_pickups || 0,
          successfulPickups: analytics.successful_pickups || 0,
          totalFoodSaved: analytics.total_food_saved || 0,
          favoriteCanteens: analytics.favorite_canteens || 0,
          successRate: analytics.success_rate || 0,
          activeDays: analytics.active_days || 0,
          historical: historicalData || []
        });
      }
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
