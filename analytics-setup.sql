-- Analytics setup for AnnMitra platform
-- This creates a view for basic analytics and extends user stats

-- Simple analytics view for basic platform stats
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    COUNT(DISTINCT l.id) as total_listings,
    COUNT(DISTINCT p.id) as total_pickups,
    COUNT(DISTINCT u.id) as total_users,
    COALESCE(SUM(l.quantity), 0) as total_food_saved,
    COUNT(DISTINCT l.owner_id) as active_canteens,
    COUNT(DISTINCT CASE WHEN p.status = 'collected' THEN p.id END) as successful_pickups
FROM listings l
LEFT JOIN pickups p ON l.id = p.listing_id
LEFT JOIN users u ON u.id IS NOT NULL;

-- User-specific analytics function for canteens
CREATE OR REPLACE FUNCTION get_canteen_analytics(user_id_param UUID)
RETURNS TABLE (
    total_listings BIGINT,
    total_claims BIGINT,
    successful_pickups BIGINT,
    total_food_offered NUMERIC,
    success_rate NUMERIC,
    active_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.id)::BIGINT as total_listings,
        COUNT(DISTINCT p.id)::BIGINT as total_claims,
        COUNT(DISTINCT CASE WHEN p.status = 'collected' THEN p.id END)::BIGINT as successful_pickups,
        COALESCE(SUM(l.quantity), 0) as total_food_offered,
        CASE 
            WHEN COUNT(DISTINCT p.id) > 0 
            THEN ROUND((COUNT(DISTINCT CASE WHEN p.status = 'collected' THEN p.id END)::NUMERIC / COUNT(DISTINCT p.id)::NUMERIC) * 100, 1)
            ELSE 0
        END as success_rate,
        COUNT(DISTINCT DATE(l.created_at))::BIGINT as active_days
    FROM listings l
    LEFT JOIN pickups p ON l.id = p.listing_id
    WHERE l.owner_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User-specific analytics function for regular users
CREATE OR REPLACE FUNCTION get_user_analytics(user_id_param UUID)
RETURNS TABLE (
    total_pickups BIGINT,
    successful_pickups BIGINT,
    total_food_saved NUMERIC,
    favorite_canteens BIGINT,
    success_rate NUMERIC,
    active_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT p.id)::BIGINT as total_pickups,
        COUNT(DISTINCT CASE WHEN p.status = 'collected' THEN p.id END)::BIGINT as successful_pickups,
        COALESCE(SUM(CASE WHEN p.status = 'collected' THEN l.quantity ELSE 0 END), 0) as total_food_saved,
        COUNT(DISTINCT l.owner_id)::BIGINT as favorite_canteens,
        CASE 
            WHEN COUNT(DISTINCT p.id) > 0 
            THEN ROUND((COUNT(DISTINCT CASE WHEN p.status = 'collected' THEN p.id END)::NUMERIC / COUNT(DISTINCT p.id)::NUMERIC) * 100, 1)
            ELSE 0
        END as success_rate,
        COUNT(DISTINCT DATE(p.created_at))::BIGINT as active_days
    FROM pickups p
    LEFT JOIN listings l ON p.listing_id = l.id
    WHERE p.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for RLS
GRANT SELECT ON analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_canteen_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analytics(UUID) TO authenticated;

-- Historical data functions for charts
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

-- Canteen daily stats
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

-- User daily stats
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
            COALESCE(SUM(CASE WHEN p.status = 'collected' THEN lst.quantity ELSE 0 END), 0) as food_saved
        FROM pickups p
        LEFT JOIN listings lst ON p.listing_id = lst.id
        WHERE p.user_id = user_id_param 
        AND p.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(p.created_at)
    ) p ON d.date = p.date
    ORDER BY d.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for new functions
GRANT EXECUTE ON FUNCTION get_daily_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_canteen_daily_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_daily_stats(UUID, INTEGER) TO authenticated;
