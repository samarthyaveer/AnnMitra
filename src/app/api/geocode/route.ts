import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const query = searchParams.get('q')

    if (lat && lng) {
      // Reverse geocoding - get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AnnMitra-Campus-Food-App/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({ 
        success: true, 
        address: data.display_name || `${lat}, ${lng}`,
        data 
      })
    } else if (query) {
      // Forward geocoding - get coordinates from address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AnnMitra-Campus-Food-App/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json({ 
        success: true, 
        results: data 
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch location data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
