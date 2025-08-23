-- Surplus Analysis Feature Database Schema (Simple Version Without RLS)
-- Run this in Supabase SQL Editor

-- First, drop existing tables if they exist
DROP TABLE IF EXISTS food_recommendations CASCADE;
DROP TABLE IF EXISTS surplus_analysis CASCADE;
DROP TABLE IF EXISTS transaction_history CASCADE;
DROP TABLE IF EXISTS upload_sessions CASCADE;

-- Transaction history table
CREATE TABLE transaction_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    upload_session_id UUID NOT NULL,
    transaction_date DATE NOT NULL,
    transaction_time TIME NOT NULL,
    transaction_datetime TIMESTAMP NOT NULL,
    food_item VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analysis results table
CREATE TABLE surplus_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    upload_session_id UUID NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    period_identifier VARCHAR(50) NOT NULL,
    food_item VARCHAR(100),
    avg_transactions DECIMAL(8,2),
    predicted_transactions DECIMAL(8,2),
    confidence_score DECIMAL(3,2),
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Upload sessions table
CREATE TABLE upload_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    filename VARCHAR(255),
    total_records INTEGER,
    processed_records INTEGER,
    status VARCHAR(50) DEFAULT 'processing',
    error_message TEXT,
    analysis_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Food preparation recommendations table
CREATE TABLE food_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    upload_session_id UUID NOT NULL,
    food_item VARCHAR(100) NOT NULL,
    current_avg_daily DECIMAL(8,2),
    predicted_demand DECIMAL(8,2),
    recommended_quantity DECIMAL(8,2),
    peak_hours VARCHAR(500),
    low_demand_days VARCHAR(500),
    waste_reduction_potential DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_transaction_history_user_date ON transaction_history(user_id, transaction_date);
CREATE INDEX idx_transaction_history_session ON transaction_history(upload_session_id);
CREATE INDEX idx_transaction_history_food ON transaction_history(food_item, transaction_date);
CREATE INDEX idx_surplus_analysis_user ON surplus_analysis(user_id, upload_session_id);
CREATE INDEX idx_upload_sessions_user ON upload_sessions(user_id);
CREATE INDEX idx_food_recommendations_user ON food_recommendations(user_id, upload_session_id);
