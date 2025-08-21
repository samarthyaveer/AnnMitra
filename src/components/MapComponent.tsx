'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icon with AnnMitra branding
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#1f7a5a"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      <circle cx="12.5" cy="12.5" r="3" fill="#1f7a5a"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41]
})

interface MapComponentProps {
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
}

// Component to handle map events
function MapEvents({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

export default function MapComponent({
  center,
  zoom = 13,
  onMapClick,
  className = "h-64 w-full",
  markers = [],
  interactive = true
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)

  // Update map view when center changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom])

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        ref={mapRef}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        style={{
          backgroundColor: '#1f2937',
          filter: 'hue-rotate(120deg) saturate(0.8) brightness(0.9)'
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {/* Map click events */}
        {onMapClick && <MapEvents onMapClick={onMapClick} />}
        
        {/* Main marker (center position) */}
        <Marker position={center} icon={customIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-medium text-gray-900">Selected Location</div>
              <div className="text-gray-600">
                {Array.isArray(center) 
                  ? `${center[0].toFixed(6)}, ${center[1].toFixed(6)}`
                  : 'Current position'
                }
              </div>
              {onMapClick && (
                <div className="text-xs text-gray-500 mt-1">
                  Click anywhere on the map to move this marker
                </div>
              )}
            </div>
          </Popup>
        </Marker>
        
        {/* Additional markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={customIcon}
          >
            {marker.popup && (
              <Popup>
                <div className="text-sm">
                  {marker.title && (
                    <div className="font-medium text-gray-900 mb-1">{marker.title}</div>
                  )}
                  <div>{marker.popup}</div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      {/* Map instructions */}
      {onMapClick && (
        <div className="mt-2 text-xs text-gray-300 bg-gray-700/30 p-2 rounded">
          💡 <strong>Tip:</strong> Click anywhere on the map to set a precise pickup location
        </div>
      )}
    </div>
  )
}
