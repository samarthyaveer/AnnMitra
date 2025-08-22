# Listing Status Logic Refactor

## Problem
Listings were being incorrectly marked as "expired" after pickup completion, causing confusion for users.

## Root Cause Analysis
1. **Race Conditions**: Both API code and database triggers were trying to update listing status simultaneously
2. **Missing Validation**: No validation to prevent invalid status transitions (e.g., picked_up → expired)
3. **Incomplete Trigger Logic**: Database triggers didn't handle all edge cases properly
4. **Manual Code Generation**: Pickup codes were generated in API instead of database triggers

## Solution

### 1. Database Trigger Improvements (`fix-listing-status-logic.sql`)

#### Enhanced Expiration Logic
- Modified `expire_old_listings()` to only expire `available` listings
- Added explicit checks to prevent expiring `claimed` or `picked_up` listings
- Added logging for debugging

#### Improved Status Transition Trigger
- Enhanced `update_listing_status()` with proper state checks
- Only updates listing status if the current status allows the transition
- Handles all pickup status changes: `confirmed`, `collected`, `cancelled`

#### Status Validation Trigger
- New `validate_listing_status_transition()` function prevents invalid transitions
- Blocks attempts to expire listings that are `claimed` or `picked_up`
- Ensures data integrity at the database level

#### Cleanup Function
- `fix_incorrectly_expired_listings()` repairs any existing corrupted data
- Automatically runs during migration to fix current issues

#### Monitoring Tools
- Added `listing_status_audit` view for monitoring status consistency
- Performance indexes for status-based queries
- Summary query to show current status distribution

### 2. API Code Cleanup (`src/app/api/pickups/route.ts`)

#### Removed Manual Status Updates
- Removed duplicate listing status updates from API code
- Database triggers now handle all status transitions automatically
- Prevents race conditions between API and trigger updates

#### Simplified Pickup Creation
- Pickup status set to `confirmed` immediately upon creation
- Database triggers handle listing status update and code generation
- Cleaner, more reliable flow

### 3. Trigger Enhancements (`phase6-migration.sql`)

#### Pickup Code Generation
- Enhanced `set_pickup_code()` to handle both INSERT and UPDATE operations
- Automatic code generation for new pickups
- Removed manual code generation from API

## Status Transition Flow

### Valid Transitions
```
available → claimed (when pickup confirmed)
available → expired (when past deadline and not claimed)
claimed → picked_up (when pickup collected)
claimed → available (when pickup cancelled)
picked_up → [FINAL STATE] (cannot change)
expired → [FINAL STATE] (cannot change)
cancelled → available (if relisted)
```

### Prevented Invalid Transitions
- `picked_up` → `expired` ❌
- `claimed` → `expired` ❌
- Direct status changes bypassing pickup flow ❌

## Deployment Instructions

### 1. Apply Database Fixes
```sql
-- Run the comprehensive fix
\i fix-listing-status-logic.sql

-- Verify the fixes
SELECT * FROM listing_status_audit WHERE status_check = 'INCONSISTENT';
```

### 2. Deploy API Changes
- The updated API code removes manual status management
- All status transitions now happen through database triggers
- More reliable and consistent behavior

### 3. Verify Functionality
1. Create a new food listing
2. Claim the listing (should become `claimed`)
3. Mark pickup as collected (should become `picked_up`)
4. Verify it never shows as "expired"

## Benefits

### Data Integrity
- Database-level validation prevents invalid state transitions
- Triggers ensure consistent status updates
- Audit view helps monitor system health

### Performance
- Added indexes for faster status-based queries
- Reduced API complexity and potential race conditions
- Single source of truth for status logic

### Maintainability
- All status logic centralized in database triggers
- Clear documentation and monitoring tools
- Easier to debug and extend

## Monitoring

### Check Status Consistency
```sql
SELECT * FROM listing_status_audit WHERE status_check != 'CONSISTENT';
```

### View Status Distribution
```sql
SELECT status, COUNT(*) FROM listings GROUP BY status ORDER BY status;
```

### Find Expired Listings
```sql
SELECT * FROM listings WHERE status = 'expired';
```

## Future Considerations

1. **Automated Cleanup**: Consider scheduled jobs to run `expire_old_listings()`
2. **Status History**: Track status change history for better debugging
3. **Real-time Updates**: Ensure real-time subscriptions reflect status changes properly
4. **User Notifications**: Send notifications for important status changes

This refactor ensures that completed pickups will never be marked as expired, providing a consistent and logical user experience.
