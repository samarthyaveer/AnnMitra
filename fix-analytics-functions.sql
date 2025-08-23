-- Fix for Analytics Functions - Column Name Issues
-- Run this in Supabase SQL Editor to fix the existing functions

-- First, let's check what columns actually exist in the pickups table
-- Run this query first to see the actual column names:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'pickups';

-- Updated get_daily_stats function - using listings created_at for both
CREATE OR REPLACE FUNCTION get_daily_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
    date DATE,
    listings_count BIGINT,
    pickups_count BIGINT,
    food_saved NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.date::DATE,
        COALESCE(l.listings_count, 0) as listings_count,
        COALESCE(p.pickups_count, 0) as pickups_count,
        COALESCE(p.food_saved, 0) as food_saved
    FROM (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 day' * days_back,
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE as date
    ) d
    LEFT JOIN (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as listings_count
        FROM listings 
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(created_at)
    ) l ON d.date = l.date
    LEFT JOIN (
        SELECT 
            DATE(lst.created_at) as date,
            COUNT(*) as pickups_count,
            COALESCE(SUM(CASE WHEN p.status = 'collected' THEN lst.quantity ELSE 0 END), 0) as food_saved
        FROM pickups p
        LEFT JOIN listings lst ON p.listing_id = lst.id
        WHERE lst.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(lst.created_at)
    ) p ON d.date = p.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated get_canteen_daily_stats function
CREATE OR REPLACE FUNCTION get_canteen_daily_stats(user_id_param UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    listings_count BIGINT,
    claims_count BIGINT,
    food_offered NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.date::DATE,
        COALESCE(l.listings_count, 0) as listings_count,
        COALESCE(p.claims_count, 0) as claims_count,
        COALESCE(l.food_offered, 0) as food_offered
    FROM (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 day' * days_back,
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE as date
    ) d
    LEFT JOIN (
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as listings_count,
            COALESCE(SUM(quantity), 0) as food_offered
        FROM listings 
        WHERE owner_id = user_id_param 
        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(created_at)
    ) l ON d.date = l.date
    LEFT JOIN (
        SELECT 
            DATE(lst.created_at) as date,
            COUNT(*) as claims_count
        FROM pickups p
        JOIN listings lst ON p.listing_id = lst.id
        WHERE lst.owner_id = user_id_param 
        AND lst.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(lst.created_at)
    ) p ON d.date = p.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated get_user_daily_stats function
CREATE OR REPLACE FUNCTION get_user_daily_stats(user_id_param UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    pickups_count BIGINT,
    food_saved NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.date::DATE,
        COALESCE(p.pickups_count, 0) as pickups_count,
        COALESCE(p.food_saved, 0) as food_saved
    FROM (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 day' * days_back,
            CURRENT_DATE,
            INTERVAL '1 day'
        )::DATE as date
    ) d
    LEFT JOIN (
        SELECT 
            DATE(lst.created_at) as date,
            COUNT(*) as pickups_count,
            COALESCE(SUM(CASE WHEN p.status = 'collected' THEN lst.quantity ELSE 0 END), 0) as food_saved
        FROM pickups p
        LEFT JOIN listings lst ON p.listing_id = lst.id
        WHERE p.user_id = user_id_param 
        AND lst.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(lst.created_at)
    ) p ON d.date = p.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the fixed functions
SELECT 'Fixed analytics functions successfully' as message;
SELECT COUNT(*) as total_test_records FROM get_daily_stats(7);
