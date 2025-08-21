'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import LocationPicker from '@/components/LocationPicker'

export default function CreateListing() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    food_type: '',
    quantity: '',
    quantity_unit: 'meals',
    safety_window_hours: '4',
    available_until: '',
    address: '',
    pickup_location_lat: null as number | null,
    pickup_location_lng: null as number | null
  })

  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)

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
      alert('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.quantity || !formData.available_until) {
      alert('Please fill in all required fields')
      return
    }

    // Require either address or GPS coordinates
    if (!formData.address && (!formData.pickup_location_lat || !formData.pickup_location_lng)) {
      alert('Please provide a pickup location using GPS or enter an address manually')
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
        alert('Listing created successfully!')
        router.push('/dashboard')
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to create listing'}`)
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('Error creating listing')
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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Food Listing</h1>
          <p className="text-gray-400">Share surplus food with your community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Safety Window (hours)
                </label>
                <select
                  name="safety_window_hours"
                  value={formData.safety_window_hours}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  <option value="2">2 hours</option>
                  <option value="4">4 hours</option>
                  <option value="8">8 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                </select>
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
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

          {/* Availability */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Availability</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Available Until *
              </label>
              <input
                type="datetime-local"
                name="available_until"
                value={formData.available_until}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                required
              />
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
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
                className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors"
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
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              {creating ? 'Creating Listing...' : uploading ? 'Uploading Image...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
