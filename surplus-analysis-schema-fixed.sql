-- Surplus Analysis Feature Database Schema (Fixed for Clerk Auth)
-- Run this in Supabase SQL Editor

-- Transaction history table (without foreign key to users)
CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Changed from UUID to TEXT for Clerk compatibility
    upload_session_id UUID NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_time TIME NOT NULL,
    transaction_datetime TIMESTAMP NOT NULL,
    food_item VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analysis results table (without foreign key to users)
CREATE TABLE IF NOT EXISTS surplus_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Changed from UUID to TEXT for Clerk compatibility
    upload_session_id UUID NOT NULL,
    analysis_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'hourly', 'food_item'
    period_identifier VARCHAR(50) NOT NULL, -- 'monday', '2024-01-15', '14:00', 'biryani'
    food_item VARCHAR(100),
    avg_transactions DECIMAL(8,2),
    predicted_transactions DECIMAL(8,2),
    confidence_score DECIMAL(3,2),
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Upload sessions table (without foreign key to users)
CREATE TABLE IF NOT EXISTS upload_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Changed from UUID to TEXT for Clerk compatibility
    filename VARCHAR(255),
    total_records INTEGER,
    processed_records INTEGER,
    status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    error_message TEXT,
    analysis_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Food preparation recommendations table (without foreign key to users)
CREATE TABLE IF NOT EXISTS food_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Changed from UUID to TEXT for Clerk compatibility
    upload_session_id UUID NOT NULL,
    food_item VARCHAR(100) NOT NULL,
    current_avg_daily DECIMAL(8,2),
    predicted_demand DECIMAL(8,2),
    recommended_quantity DECIMAL(8,2),
    peak_hours VARCHAR(500), -- JSON array of peak hours
    low_demand_days VARCHAR(500), -- JSON array of low demand days
    waste_reduction_potential DECIMAL(5,2), -- percentage
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transaction_history_user_date ON transaction_history(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_history_session ON transaction_history(upload_session_id);
CREATE INDEX IF NOT EXISTS idx_transaction_history_food ON transaction_history(food_item, transaction_date);
CREATE INDEX IF NOT EXISTS idx_surplus_analysis_user ON surplus_analysis(user_id, upload_session_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_user ON upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_food_recommendations_user ON food_recommendations(user_id, upload_session_id);

-- RLS Policies (using Clerk's auth.uid())
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE surplus_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_recommendations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transaction history" ON transaction_history;
DROP POLICY IF EXISTS "Users can insert own transaction history" ON transaction_history;
DROP POLICY IF EXISTS "Users can view own analysis" ON surplus_analysis;
DROP POLICY IF EXISTS "Users can insert own analysis" ON surplus_analysis;
DROP POLICY IF EXISTS "Users can view own upload sessions" ON upload_sessions;
DROP POLICY IF EXISTS "Users can insert own upload sessions" ON upload_sessions;
DROP POLICY IF EXISTS "Users can update own upload sessions" ON upload_sessions;
DROP POLICY IF EXISTS "Users can view own recommendations" ON food_recommendations;
DROP POLICY IF EXISTS "Users can insert own recommendations" ON food_recommendations;

-- Policies for transaction_history
CREATE POLICY "Users can view own transaction history" ON transaction_history
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own transaction history" ON transaction_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policies for surplus_analysis
CREATE POLICY "Users can view own analysis" ON surplus_analysis
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own analysis" ON surplus_analysis
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policies for upload_sessions
CREATE POLICY "Users can view own upload sessions" ON upload_sessions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own upload sessions" ON upload_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own upload sessions" ON upload_sessions
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policies for food_recommendations
CREATE POLICY "Users can view own recommendations" ON food_recommendations
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own recommendations" ON food_recommendations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);
