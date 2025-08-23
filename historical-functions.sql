-- Historical Data Functions for Analytics Charts
-- Run this in Supabase SQL Editor
-- This adds all missing historical functions needed for charts

-- Function to get daily platform statistics
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
            DATE(p.created_at) as date,
            COUNT(*) as pickups_count,
            COALESCE(SUM(CASE WHEN p.status = 'collected' THEN lst.quantity ELSE 0 END), 0) as food_saved
        FROM pickups p
        LEFT JOIN listings lst ON p.listing_id = lst.id
        WHERE p.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(p.created_at)
    ) p ON d.date = p.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily canteen statistics
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
            SUM(quantity) as food_offered
        FROM listings 
        WHERE owner_id = user_id_param
        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(created_at)
    ) l ON d.date = l.date
    LEFT JOIN (
        SELECT 
            DATE(p.created_at) as date,
            COUNT(*) as claims_count
        FROM pickups p
        JOIN listings lst ON p.listing_id = lst.id
        WHERE lst.owner_id = user_id_param
        AND p.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(p.created_at)
    ) p ON d.date = p.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to get daily user statistics
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
            DATE(p.created_at) as date,
            COUNT(*) as pickups_count,
            SUM(l.quantity) as food_saved
        FROM pickups p
        JOIN listings l ON p.listing_id = l.id
        WHERE p.user_id = user_id_param
        AND p.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        AND p.status = 'collected'
        GROUP BY DATE(p.created_at)
    ) p ON d.date = p.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for all functions
GRANT EXECUTE ON FUNCTION get_daily_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_canteen_daily_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_daily_stats(UUID, INTEGER) TO authenticated;

-- Test the functions
SELECT 'All historical data functions created successfully' as message;

-- Test with sample data (if any exists) 
SELECT COUNT(*) as total_test_records FROM get_daily_stats(7);
