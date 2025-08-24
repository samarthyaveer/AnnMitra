'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import LocationPicker from '@/components/LocationPicker'
import { useNotify } from '@/hooks/useNotify'

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser()
  const notify = useNotify()
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
        notify.profileUpdated()
      } else {
        const errorMessage = data?.error || `Server error: ${response.status} ${response.statusText}`
        notify.error('Profile Error', errorMessage, 'profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      notify.error('Save Failed', 'Error saving profile. Please try again.', 'profile')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-green-400 font-medium">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {profile ? 'Edit Profile 👤' : 'Complete Your Profile 🚀'}
          </h1>
          <p className="text-lg text-gray-300">
            {profile 
              ? 'Update your profile information to keep your account current' 
              : 'Tell us about yourself to get started with AnnMitra'
            }
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>📝</span> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> Role
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What describes you best?</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'student' | 'canteen' | 'ngo' }))}
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                  disabled={!!profile}
                >
                  <option value="student">🎓 Student</option>
                  <option value="canteen">🏢 Canteen/Restaurant Owner</option>
                  <option value="ngo">🤝 NGO/Organization</option>
                </select>
                {profile && (
                  <p className="text-xs text-yellow-400 mt-2 p-2 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                    ⚠️ Role cannot be changed after account creation
                  </p>
                )}
              </div>
            </div>

            {/* Contact & Organization */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>📞</span> Contact & Organization
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>

                {(formData.role === 'canteen' || formData.role === 'ngo') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {formData.role === 'canteen' ? 'Restaurant/Canteen Name' : 'Organization Name'}
                    </label>
                    <input
                      type="text"
                      value={formData.organization_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                      placeholder={formData.role === 'canteen' ? 'e.g., Campus Café' : 'e.g., Local Food Bank'}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>📍</span> Campus Location
              </h2>
              <div className="glass border border-gray-600 rounded-xl p-6">
                <LocationPicker
                  onLocationChange={handleLocationChange}
                  initialLat={formData.campus_location_lat || undefined}
                  initialLng={formData.campus_location_lng || undefined}
                  initialAddress={formData.campus_location}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 sm:flex-none min-w-48 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  profile ? '✅ Update Profile' : '🚀 Create Profile'
                )}
              </button>
              
              {profile && (
                <a
                  href="/dashboard"
                  className="btn-secondary flex-1 sm:flex-none min-w-48 py-3 text-base font-semibold text-center"
                >
                  ❌ Cancel
                </a>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
