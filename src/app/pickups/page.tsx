'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Pickup, User } from '@/lib/types'

export default function Pickups() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'claimed' | 'created'>('claimed')

  useEffect(() => {
    if (isLoaded && user) {
      fetchProfile()
    }
  }, [isLoaded, user])

  useEffect(() => {
    if (profile) {
      fetchPickups()
    }
  }, [profile, activeTab])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setProfile(data.user)
      if (!data.user) {
        setLoading(false) // Stop loading if no profile found
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setLoading(false) // Stop loading on error
    }
  }

  const fetchPickups = async () => {
    try {
      const response = await fetch(`/api/pickups?type=${activeTab}`)
      const data = await response.json()
      setPickups(data.pickups || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pickups:', error)
      setLoading(false)
    }
  }

  const updatePickupStatus = async (pickupId: string, status: string, notes?: string) => {
    setUpdating(pickupId)
    try {
      const response = await fetch('/api/pickups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pickup_id: pickupId,
          status,
          notes
        })
      })

      if (response.ok) {
        alert(`Pickup ${status} successfully!`)
        fetchPickups()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to update pickup'}`)
      }
    } catch (error) {
      console.error('Error updating pickup:', error)
      alert('Error updating pickup')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900 text-yellow-400'
      case 'confirmed': return 'bg-blue-900 text-blue-400'
      case 'collected': return 'bg-green-900 text-green-400'
      case 'cancelled': return 'bg-red-900 text-red-400'
      default: return 'bg-gray-700 text-gray-400'
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400">Loading...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-green-400">Loading pickups...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h1>
          <p className="text-gray-400">Please complete your profile to view pickups.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Food Pickups</h1>
          <p className="text-gray-400">Manage your food claims and collections</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-1 inline-flex">
            <button
              onClick={() => setActiveTab('claimed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'claimed'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Food I Claimed
            </button>
            {profile.role === 'canteen' && (
              <button
                onClick={() => setActiveTab('created')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'created'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                My Listings' Pickups
              </button>
            )}
          </div>
        </div>

        {/* Pickups List */}
        {pickups.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-white mb-2">No pickups found</h2>
            <p className="text-gray-400">
              {activeTab === 'claimed' 
                ? 'Start browsing food to make your first claim!'
                : 'Create food listings to start receiving pickup requests.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pickups.map((pickup) => (
              <div key={pickup.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pickup Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {pickup.listing?.title}
                        </h3>
                        <p className="text-gray-400 mb-2">
                          {activeTab === 'claimed' 
                            ? `From: ${pickup.listing?.owner?.organization_name || pickup.listing?.owner?.name}`
                            : `Claimed by: ${pickup.claimer?.name}`
                          }
                        </p>
                        {pickup.listing?.description && (
                          <p className="text-gray-400 text-sm mb-2">
                            {pickup.listing.description}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pickup.status)}`}>
                        {pickup.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-gray-400">
                          <span className="text-white">Quantity:</span> {pickup.listing?.quantity} {pickup.listing?.quantity_unit}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-white">Claimed:</span> {new Date(pickup.claimed_at).toLocaleString()}
                        </p>
                        {pickup.confirmed_at && (
                          <p className="text-gray-400">
                            <span className="text-white">Confirmed:</span> {new Date(pickup.confirmed_at).toLocaleString()}
                          </p>
                        )}
                        {pickup.collected_at && (
                          <p className="text-gray-400">
                            <span className="text-white">Collected:</span> {new Date(pickup.collected_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        {pickup.pickup_code && (
                          <p className="text-gray-400">
                            <span className="text-white">Pickup Code:</span> 
                            <span className="font-mono text-green-400 ml-2">{pickup.pickup_code}</span>
                          </p>
                        )}
                        {pickup.listing?.address && (
                          <p className="text-gray-400">
                            <span className="text-white">Location:</span> {pickup.listing.address}
                          </p>
                        )}
                        {pickup.notes && (
                          <p className="text-gray-400">
                            <span className="text-white">Notes:</span> {pickup.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3">
                    {activeTab === 'claimed' && pickup.status === 'pending' && (
                      <button
                        onClick={() => updatePickupStatus(pickup.id, 'cancelled')}
                        disabled={updating === pickup.id}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        {updating === pickup.id ? 'Updating...' : 'Cancel Pickup'}
                      </button>
                    )}

                    {activeTab === 'created' && pickup.status === 'pending' && (
                      <button
                        onClick={() => updatePickupStatus(pickup.id, 'confirmed')}
                        disabled={updating === pickup.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        {updating === pickup.id ? 'Updating...' : 'Confirm Pickup'}
                      </button>
                    )}

                    {activeTab === 'created' && pickup.status === 'confirmed' && (
                      <button
                        onClick={() => updatePickupStatus(pickup.id, 'collected')}
                        disabled={updating === pickup.id}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        {updating === pickup.id ? 'Updating...' : 'Mark as Collected'}
                      </button>
                    )}

                    {pickup.status === 'collected' && (
                      <div className="text-center py-4">
                        <div className="text-green-400 text-2xl mb-2">✓</div>
                        <p className="text-green-400 text-sm">Completed</p>
                      </div>
                    )}

                    {pickup.status === 'cancelled' && (
                      <div className="text-center py-4">
                        <div className="text-red-400 text-2xl mb-2">✗</div>
                        <p className="text-red-400 text-sm">Cancelled</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
