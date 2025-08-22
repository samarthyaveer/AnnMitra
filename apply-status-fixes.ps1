# Apply Listing Status Logic Fixes
# This script applies the database fixes to resolve listing status issues

Write-Host "🔧 Applying listing status logic fixes..." -ForegroundColor Cyan

# Note: You'll need to run these commands in your Supabase SQL editor or psql client
Write-Host "📦 Please run the following SQL files in your Supabase SQL editor:" -ForegroundColor Yellow
Write-Host "   1. fix-listing-status-logic.sql" -ForegroundColor White
Write-Host "   2. Updated triggers from phase6-migration.sql" -ForegroundColor White

Write-Host ""
Write-Host "After running the SQL scripts, you can check the results with:" -ForegroundColor Green
Write-Host "   SELECT * FROM listing_status_audit WHERE status_check = 'INCONSISTENT';" -ForegroundColor Gray
Write-Host "   SELECT status, COUNT(*) as count FROM listings GROUP BY status ORDER BY status;" -ForegroundColor Gray

Write-Host ""
Write-Host "🎉 Next steps:" -ForegroundColor Green
Write-Host "1. Run the SQL scripts in Supabase" -ForegroundColor White
Write-Host "2. Deploy the updated API code" -ForegroundColor White
Write-Host "3. Test the claim/pickup flow" -ForegroundColor White
Write-Host "4. Monitor the listing_status_audit view for any issues" -ForegroundColor White

Write-Host ""
Write-Host "Files ready for deployment:" -ForegroundColor Cyan
Write-Host "✅ fix-listing-status-logic.sql - Comprehensive database fixes" -ForegroundColor Green
Write-Host "✅ Updated phase6-migration.sql - Enhanced triggers" -ForegroundColor Green
Write-Host "✅ Updated src/app/api/pickups/route.ts - Cleaned API code" -ForegroundColor Green
Write-Host "✅ LISTING_STATUS_REFACTOR.md - Documentation" -ForegroundColor Green
