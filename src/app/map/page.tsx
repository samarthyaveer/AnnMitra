'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import Image from 'next/image'
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
  const { isLoaded } = useUser()
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
        // Extract listings array from response object
        const allListings = data.listings || []
        // Filter listings that have coordinates
        const listingsWithCoords = allListings.filter((listing: Listing) => 
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-green-400 font-medium">Loading map...</div>
        </div>
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
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Food Map 🗺️
          </h1>
          <p className="text-lg text-gray-300">
            Discover available food near you • <span className="text-green-400">{listings.length}</span> locations found
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="glass-card p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-green-400 font-medium">Loading food locations...</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Map */}
            <div className="xl:col-span-2 order-2 xl:order-1">
              <div className="glass-card p-0 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-600">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Available Food Locations
                  </h2>
                  <p className="text-gray-300 mt-2">
                    Click on markers to view details and claim food
                  </p>
                </div>
                
                <div className="h-96 lg:h-[500px]">
                  <MapComponent
                    center={mapCenter}
                    zoom={12}
                    onMapClick={handleMapClick}
                    markers={mapMarkers}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>

            {/* Listing Details & List */}
            <div className="space-y-6 order-1 xl:order-2">
              {/* Selected Listing Details */}
              {selectedListing ? (
                <div className="glass-card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span>🍽️</span>
                    {selectedListing.title}
                  </h3>
                  
                  {selectedListing.image_url && (
                    <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden border border-gray-600">
                      <Image 
                        src={selectedListing.image_url} 
                        alt={selectedListing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 flex items-center gap-2">
                        <span>📊</span> Quantity:
                      </span>
                      <span className="text-white font-medium">
                        {selectedListing.quantity} {selectedListing.quantity_unit}
                      </span>
                    </div>
                    
                    {selectedListing.food_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 flex items-center gap-2">
                          <span>🍽️</span> Type:
                        </span>
                        <span className="text-white font-medium capitalize">
                          {selectedListing.food_type.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    
                    {selectedListing.available_until && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 flex items-center gap-2">
                          <span>⏰</span> Available until:
                        </span>
                        <span className="text-white font-medium text-xs">
                          {new Date(selectedListing.available_until).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {selectedListing.description && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>📝</span> Description
                      </h4>
                      <p className="text-gray-400 text-sm bg-gray-800/30 p-3 rounded-lg border border-gray-600">
                        {selectedListing.description}
                      </p>
                    </div>
                  )}
                  
                  {selectedListing.address && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>📍</span> Pickup Location
                      </h4>
                      <p className="text-gray-400 text-sm bg-gray-800/30 p-3 rounded-lg border border-gray-600">
                        {selectedListing.address}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button
                      onClick={() => claimListing(selectedListing.id)}
                      className="btn-primary w-full py-3 text-base font-semibold"
                    >
                      🎯 Claim This Food
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800/50 border border-gray-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Select a Location
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Click on a marker on the map to view food details and claim it
                  </p>
                </div>
              )}

              {/* Listings List */}
              <div className="glass-card">
                <div className="p-4 border-b border-gray-600">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📋</span> All Available Food
                  </h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {listings.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-4">📍</div>
                      <p className="text-gray-300 text-sm">
                        No food available with GPS coordinates
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-600">
                      {listings.map((listing) => (
                        <div 
                          key={listing.id}
                          className="p-4 hover:bg-white/5 cursor-pointer transition-all group"
                          onClick={() => setSelectedListing(listing)}
                        >
                          <h4 className="font-medium text-white group-hover:text-green-400 transition-colors text-sm mb-1">{listing.title}</h4>
                          <p className="text-xs text-gray-300">
                            📊 {listing.quantity} {listing.quantity_unit}
                            {listing.owner?.organization_name && (
                              <span className="text-gray-400"> • 🏪 {listing.owner.organization_name}</span>
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
