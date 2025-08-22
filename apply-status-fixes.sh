#!/bin/bash

# Apply Listing Status Logic Fixes
# This script applies the database fixes to resolve listing status issues

echo "🔧 Applying listing status logic fixes..."

# Apply the comprehensive fix
echo "📦 Running fix-listing-status-logic.sql..."
psql -f fix-listing-status-logic.sql

# Apply the updated triggers from phase6-migration.sql
echo "📦 Updating triggers from phase6-migration.sql..."
psql -f phase6-migration.sql

echo "✅ Database fixes applied successfully!"

echo "🔍 Checking for any inconsistent listings..."
psql -c "SELECT * FROM listing_status_audit WHERE status_check = 'INCONSISTENT';"

echo "📊 Current status distribution:"
psql -c "SELECT status, COUNT(*) as count FROM listings GROUP BY status ORDER BY status;"

echo "🎉 Listing status logic has been successfully refactored!"
echo ""
echo "Next steps:"
echo "1. Deploy the updated API code"
echo "2. Test the claim/pickup flow"
echo "3. Monitor the listing_status_audit view for any issues"
