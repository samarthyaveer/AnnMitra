'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import { Listing } from '@/lib/types'

// Dynamically import the map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
      <div className="text-gray-300">Loading map...</div>
    </div>
  )
})

export default function MapView() {
  const { user, isLoaded } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    fetchListings()
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.log('Error getting location:', error)
          // Default to a central location if GPS fails
          setUserLocation([40.7128, -74.0060]) // New York City
        }
      )
    } else {
      setUserLocation([40.7128, -74.0060]) // Default location
    }
  }

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings?status=available')
      if (response.ok) {
        const data = await response.json()
        // Filter listings that have coordinates
        const listingsWithCoords = data.filter((listing: Listing) => 
          listing.pickup_location_lat && listing.pickup_location_lng
        )
        setListings(listingsWithCoords)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    // Find the closest listing to the clicked point
    let closestListing: Listing | null = null
    let minDistance = Infinity

    listings.forEach(listing => {
      if (listing.pickup_location_lat && listing.pickup_location_lng) {
        const distance = Math.sqrt(
          Math.pow(listing.pickup_location_lat - lat, 2) + 
          Math.pow(listing.pickup_location_lng - lng, 2)
        )
        if (distance < minDistance && distance < 0.01) { // Within ~1km
          minDistance = distance
          closestListing = listing
        }
      }
    })

    setSelectedListing(closestListing)
  }

  const claimListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/claim`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Food claimed successfully! Check your pickups for details.')
        fetchListings() // Refresh listings
        setSelectedListing(null)
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to claim food'}`)
      }
    } catch (error) {
      console.error('Error claiming listing:', error)
      alert('Error claiming food')
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400">Loading...</div>
      </div>
    )
  }

  const mapCenter = userLocation || [40.7128, -74.0060]
  const mapMarkers = listings.map(listing => ({
    position: [listing.pickup_location_lat!, listing.pickup_location_lng!] as [number, number],
    popup: `${listing.title} - ${listing.quantity} ${listing.quantity_unit}`,
    title: listing.title
  }))

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Food Map</h1>
          <p className="text-gray-400">
            Discover available food near you • {listings.length} locations found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-green-400">Loading food locations...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Available Food Locations
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Click on markers to view details
                  </p>
                </div>
                
                <MapComponent
                  center={mapCenter}
                  zoom={12}
                  onMapClick={handleMapClick}
                  markers={mapMarkers}
                  className="h-96 w-full"
                />
              </div>
            </div>

            {/* Listing Details */}
            <div className="space-y-4">
              {selectedListing ? (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {selectedListing.title}
                  </h3>
                  
                  {selectedListing.image_url && (
                    <img 
                      src={selectedListing.image_url} 
                      alt={selectedListing.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity:</span>
                      <span className="text-white">
                        {selectedListing.quantity} {selectedListing.quantity_unit}
                      </span>
                    </div>
                    
                    {selectedListing.food_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white capitalize">
                          {selectedListing.food_type.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Safe until:</span>
                      <span className="text-white">
                        {selectedListing.safety_window_hours}h from pickup
                      </span>
                    </div>
                    
                    {selectedListing.available_until && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available until:</span>
                        <span className="text-white">
                          {new Date(selectedListing.available_until).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {selectedListing.description && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                      <p className="text-gray-400 text-sm">{selectedListing.description}</p>
                    </div>
                  )}
                  
                  {selectedListing.address && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Pickup Location</h4>
                      <p className="text-gray-400 text-sm">{selectedListing.address}</p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button
                      onClick={() => claimListing(selectedListing.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Claim This Food
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Select a Location
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Click on a marker on the map to view food details and claim it
                  </p>
                </div>
              )}

              {/* Listings List */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">All Available Food</h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {listings.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      No food available with GPS coordinates
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {listings.map((listing) => (
                        <div 
                          key={listing.id}
                          className="p-4 hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => setSelectedListing(listing)}
                        >
                          <h4 className="font-medium text-white">{listing.title}</h4>
                          <p className="text-sm text-gray-400">
                            {listing.quantity} {listing.quantity_unit}
                            {listing.owner?.organization_name && (
                              <span> • {listing.owner.organization_name}</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
