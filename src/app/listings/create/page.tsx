'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import LocationPicker from '@/components/LocationPicker'
import { useNotify } from '@/hooks/useNotify'

export default function CreateListing() {
  const { isLoaded } = useUser()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const notify = useNotify()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    food_type: '',
    quantity: '',
    quantity_unit: 'meals',
    safety_window_days: '0',
    safety_window_hours: '4',
    address: '',
    pickup_location_lat: null as number | null,
    pickup_location_lng: null as number | null
  })

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)

  // Calculate available until time based on safety window
  const getAvailableUntil = () => {
    const now = new Date()
    const days = parseInt(formData.safety_window_days) || 0
    const hours = parseInt(formData.safety_window_hours) || 0
    const totalHours = (days * 24) + hours
    
    const availableUntil = new Date(now.getTime() + (totalHours * 60 * 60 * 1000))
    return availableUntil.toISOString()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      pickup_location_lat: lat,
      pickup_location_lng: lng,
      address: address || prev.address
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', image)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      return data.imageUrl
    } catch (error) {
      console.error('Image upload error:', error)
      notify.error('Upload Failed', 'Failed to upload image. Please try again.', 'listing')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.quantity) {
      notify.warning('Missing Information', 'Please fill in all required fields to create your listing.', 'listing')
      return
    }

    // Validate safety window (must be at least 1 hour)
    const totalHours = (parseInt(formData.safety_window_days) * 24) + parseInt(formData.safety_window_hours)
    if (totalHours < 1) {
      notify.warning('Invalid Safety Window', 'Safety window must be at least 1 hour.', 'listing')
      return
    }

    // Require either address or GPS coordinates
    if (!formData.address && (!formData.pickup_location_lat || !formData.pickup_location_lng)) {
      notify.warning('Location Required', 'Please provide a pickup location using GPS or enter an address manually.', 'listing')
      return
    }

    setCreating(true)

    try {
      // Upload image first if selected
      let imageUrl = null
      if (image) {
        imageUrl = await uploadImage()
        if (image && !imageUrl) {
          // Image upload failed, stop here
          setCreating(false)
          return
        }
      }

      // Create listing
      const listingData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        safety_window_hours: parseInt(formData.safety_window_hours),
        safety_window_days: parseInt(formData.safety_window_days),
        available_until: getAvailableUntil(),
        pickup_location_lat: formData.pickup_location_lat,
        pickup_location_lng: formData.pickup_location_lng,
        image_url: imageUrl
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
      })

      if (response.ok) {
        const data = await response.json()
        const listingId = data.listing?.id || 'new'
        notify.listingCreated(formData.title, listingId)
        router.push('/dashboard')
      } else {
        const data = await response.json()
        notify.error('Creation Failed', data.error || 'Failed to create listing. Please try again.', 'listing')
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      notify.error('Creation Error', 'An unexpected error occurred while creating your listing.', 'listing')
    } finally {
      setCreating(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pt-20">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Create Food Listing</h1>
          <p className="text-gray-400">Share surplus food with your community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Food Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Fresh Sandwiches, Leftover Pizza"
                className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the food, ingredients, preparation time..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Food Type
                </label>
                <select
                  name="food_type"
                  value={formData.food_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                >
                  <option value="">Select type</option>
                  <option value="meals">Prepared Meals</option>
                  <option value="snacks">Snacks</option>
                  <option value="beverages">Beverages</option>
                  <option value="baked_goods">Baked Goods</option>
                  <option value="fruits">Fruits</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Safety Window */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Safety Window *
              </label>
              <p className="text-sm text-gray-400 mb-3">
                How long is this food safe to consume from now?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Days
                  </label>
                  <select
                    name="safety_window_days"
                    value={formData.safety_window_days}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  >
                    <option value="0">0 days</option>
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="4">4 days</option>
                    <option value="5">5 days</option>
                    <option value="6">6 days</option>
                    <option value="7">7 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Hours
                  </label>
                  <select
                    name="safety_window_hours"
                    value={formData.safety_window_hours}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  >
                    <option value="0">0 hours</option>
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                    <option value="6">6 hours</option>
                    <option value="8">8 hours</option>
                    <option value="10">10 hours</option>
                    <option value="12">12 hours</option>
                    <option value="18">18 hours</option>
                    <option value="23">23 hours</option>
                  </select>
                </div>
              </div>
              {/* Show calculated available until time */}
              <div className="mt-3 p-4 bg-green-600/10 backdrop-blur-sm rounded-xl border border-green-500/30">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Food will be available until:</span>{' '}
                  <span className="text-green-400">
                    {(() => {
                      const days = parseInt(formData.safety_window_days) || 0
                      const hours = parseInt(formData.safety_window_hours) || 0
                      if (days === 0 && hours === 0) return 'Please select a safety window'
                      
                      const now = new Date()
                      const totalHours = (days * 24) + hours
                      const availableUntil = new Date(now.getTime() + (totalHours * 60 * 60 * 1000))
                      return availableUntil.toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })
                    })()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Quantity</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  step="0.1"
                  placeholder="e.g., 10"
                  className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unit
                </label>
                <select
                  name="quantity_unit"
                  value={formData.quantity_unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                >
                  <option value="meals">meals</option>
                  <option value="portions">portions</option>
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                  <option value="pieces">pieces</option>
                  <option value="servings">servings</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Pickup Location</h2>
            
            <LocationPicker
              onLocationChange={handleLocationChange}
              initialLat={formData.pickup_location_lat || undefined}
              initialLng={formData.pickup_location_lng || undefined}
              initialAddress={formData.address}
            />
            
            {/* Manual address override */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Instructions (optional)
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Building name, room number, specific pickup instructions..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
              />
              <p className="text-sm text-gray-400 mt-1">
                This will be shown to people picking up the food
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Food Image (optional)</h2>
            
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-600/50 rounded-xl p-6 text-center hover:border-green-500 hover:bg-gray-700/20 transition-all duration-300"
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <Image 
                      src={imagePreview} 
                      alt="Preview" 
                      width={200}
                      height={150}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <p className="text-green-400">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-gray-400 text-lg">📷</div>
                    <p className="text-gray-400">Click to upload food image</p>
                    <p className="text-gray-500 text-sm">JPEG, PNG, WebP (max 5MB)</p>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={creating || uploading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 transform"
            >
              {creating ? 'Creating Listing...' : uploading ? 'Uploading Image...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
