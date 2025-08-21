# Location Picker CORS Fix

## Problem
The LocationPicker component was failing with a "Failed to fetch" error when trying to auto-detect location. This was happening when making direct requests to the Nominatim OpenStreetMap API from the browser.

## Root Cause
The error occurred due to:
1. **CORS (Cross-Origin Resource Sharing) restrictions** - Some browsers and network configurations block direct requests to external APIs
2. **Network issues** - Direct API calls from the browser can be unreliable
3. **Missing User-Agent header** - Nominatim API prefers requests with proper User-Agent headers

## Solution Implemented

### 1. Created Internal Geocoding API Route
Created `src/app/api/geocode/route.ts` that:
- Handles both reverse geocoding (coordinates → address) and forward geocoding (address → coordinates)
- Makes server-side requests to Nominatim API with proper headers
- Includes error handling and fallback responses
- Bypasses CORS issues by making requests from the server

### 2. Updated LocationPicker Component
Modified `src/components/LocationPicker.tsx` to:
- Use internal `/api/geocode` endpoint instead of direct Nominatim calls
- Provide better fallback addresses when geocoding fails
- Maintain all existing functionality while fixing the CORS issue
- Fixed TypeScript issues with dynamic MapComponent import

### 3. API Endpoint Features

#### Reverse Geocoding (Coordinates → Address)
```
GET /api/geocode?lat=12.34&lng=56.78
```

#### Forward Geocoding (Address → Coordinates)
```
GET /api/geocode?q=New Delhi, India
```

## Benefits
1. **Reliable Location Services** - No more CORS failures
2. **Better Error Handling** - Graceful fallbacks when geocoding fails
3. **Server-Side Caching** - Can be extended to cache frequent requests
4. **Rate Limiting Control** - Better control over API usage
5. **User-Agent Compliance** - Proper headers for Nominatim API

## Testing
- ✅ Build passes without errors
- ✅ Development server starts successfully
- ✅ TypeScript types are correct
- ✅ All existing functionality preserved

## Files Modified
1. `src/app/api/geocode/route.ts` - New geocoding API endpoint
2. `src/components/LocationPicker.tsx` - Updated to use internal API

## Usage
The LocationPicker component now works reliably for:
- Auto-detecting current GPS location
- Converting coordinates to human-readable addresses
- Searching for addresses and getting coordinates
- Manual map pin placement

Users should no longer experience "Failed to fetch" errors when using the location picker in the food listing creation process.
