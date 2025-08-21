'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import LocationPicker from '@/components/LocationPicker'

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: 'student' as 'canteen' | 'student' | 'ngo',
    email: '',
    phone: '',
    organization_name: '',
    campus_location: '',
    campus_location_lat: null as number | null,
    campus_location_lng: null as number | null
  })

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchProfile()
      setFormData(prev => ({
        ...prev,
        name: clerkUser.fullName || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || ''
      }))
    }
  }, [isLoaded, clerkUser])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      if (data.user) {
        setProfile(data.user)
        setFormData({
          name: data.user.name || '',
          role: data.user.role,
          email: data.user.email || '',
          phone: data.user.phone || '',
          organization_name: data.user.organization_name || '',
          campus_location: data.user.campus_location || '',
          campus_location_lat: data.user.campus_location_lat || null,
          campus_location_lng: data.user.campus_location_lng || null
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({
      ...prev,
      campus_location_lat: lat,
      campus_location_lng: lng,
      campus_location: address || prev.campus_location
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = profile ? 'PUT' : 'POST'
      
      const response = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (response.ok) {
        setProfile(data.user)
        alert(profile ? 'Profile updated successfully!' : 'Profile created successfully!')
      } else {
        const errorMessage = data?.error || `Server error: ${response.status} ${response.statusText}`
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {profile ? 'Edit Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {profile 
              ? 'Update your profile information' 
              : 'Tell us about yourself to get started with AnnMitra'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-input border border-border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-input border border-border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'student' | 'canteen' | 'ngo' }))}
              className="w-full bg-input border border-border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              disabled={!!profile} // Can't change role after creation
            >
              <option value="student">🎓 Student</option>
              <option value="canteen">🏢 Canteen/Restaurant Owner</option>
              <option value="ngo">🤝 NGO/Organization</option>
            </select>
            {profile && (
              <p className="text-xs text-muted-foreground mt-1">
                Role cannot be changed after account creation
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-input border border-border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            <div className="md:col-span-1">
              {/* Campus Location with GPS */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-foreground">Campus Location</h3>
                <LocationPicker
                  onLocationChange={handleLocationChange}
                  initialLat={formData.campus_location_lat || undefined}
                  initialLng={formData.campus_location_lng || undefined}
                  initialAddress={formData.campus_location}
                />
              </div>
            </div>
          </div>

          {(formData.role === 'canteen' || formData.role === 'ngo') && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.role === 'canteen' ? 'Restaurant/Canteen Name' : 'Organization Name'}
              </label>
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                placeholder={formData.role === 'canteen' ? 'e.g., Campus Café' : 'e.g., Local Food Bank'}
                className="w-full bg-input border border-border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
            </button>
            
            {profile && (
              <a
                href="/dashboard"
                className="border border-border hover:bg-muted text-foreground px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base text-center transition-colors"
              >
                Cancel
              </a>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
