'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { LatLngExpression } from 'leaflet'

// Dynamically import the map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-brand-700 rounded-lg flex items-center justify-center">
      <div className="text-brand-300">Loading map...</div>
    </div>
  )
}) as React.ComponentType<{
  center: LatLngExpression
  zoom?: number
  onMapClick?: (lat: number, lng: number) => void
  className?: string
  markers?: Array<{
    position: LatLngExpression
    popup?: string
    title?: string
  }>
  interactive?: boolean
}>

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
  initialAddress?: string
  className?: string
}

export default function LocationPicker({
  onLocationChange,
  initialLat,
  initialLng,
  initialAddress,
  className = ""
}: LocationPickerProps) {
  const [position, setPosition] = useState<LatLngExpression | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  )
  const [address, setAddress] = useState(initialAddress || '')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

  // Get current GPS location
  const getCurrentLocation = useCallback(() => {
    setIsLoadingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setPosition([lat, lng])
        
        // Try to get address from coordinates
        try {
          const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
          const result = await response.json()
          
          if (result.success && result.address) {
            setAddress(result.address)
            onLocationChange(lat, lng, result.address)
          } else {
            const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            setAddress(fallbackAddress)
            onLocationChange(lat, lng, fallbackAddress)
          }
        } catch (error) {
          console.error('Error getting address:', error)
          const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          setAddress(fallbackAddress)
          onLocationChange(lat, lng, fallbackAddress)
        }
        
        setIsLoadingLocation(false)
      },
      (error) => {
        let errorMessage = 'Unable to get your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        setLocationError(errorMessage)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [onLocationChange])

  // Search for address using our geocoding API
  const searchAddress = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`)
      const result = await response.json()
      
      if (result.success && result.results && result.results.length > 0) {
        const location = result.results[0]
        const lat = parseFloat(location.lat)
        const lng = parseFloat(location.lon)
        setPosition([lat, lng])
        setAddress(location.display_name)
        onLocationChange(lat, lng, location.display_name)
        setShowMap(true)
      }
    } catch (error) {
      console.error('Error searching address:', error)
    }
  }, [onLocationChange])

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setPosition([lat, lng])
    
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
      const result = await response.json()
      
      if (result.success && result.address) {
        setAddress(result.address)
        onLocationChange(lat, lng, result.address)
      } else {
        const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setAddress(fallbackAddress)
        onLocationChange(lat, lng, fallbackAddress)
      }
    } catch (error) {
      console.error('Error getting address:', error)
      const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(fallbackAddress)
      onLocationChange(lat, lng, fallbackAddress)
    }
  }, [onLocationChange])

  // Handle address input change with debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (address && address !== initialAddress) {
        searchAddress(address)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [address, searchAddress, initialAddress])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Pickup Location
        </label>
        <div className="space-y-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address or search location..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          {/* GPS Button */}
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoadingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Getting location...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Use Current Location (GPS)
              </>
            )}
          </button>
        </div>

        {locationError && (
          <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-800">
            {locationError}
          </div>
        )}
      </div>

      {/* Map Toggle */}
      {position && (
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="text-gray-300 hover:text-white text-sm flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
          </svg>
          {showMap ? 'Hide Map' : 'Show Map & Pin Location'}
        </button>
      )}

      {/* Map Component */}
      {showMap && position && (
        <div className="border border-gray-600 rounded-lg overflow-hidden">
          <MapComponent
            center={position}
            zoom={15}
            onMapClick={handleMapClick}
            className="h-64 w-full"
          />
        </div>
      )}

      {/* Location Info */}
      {position && (
        <div className="text-sm text-gray-300 bg-gray-700/50 p-3 rounded-lg">
          <div className="font-medium mb-1">Selected Location:</div>
          <div>Coordinates: {Array.isArray(position) ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}` : ''}</div>
          {address && <div>Address: {address}</div>}
        </div>
      )}
    </div>
  )
}
