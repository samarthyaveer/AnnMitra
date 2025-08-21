'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeListings() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          owner:users(name, organization_name)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setListings(data)
      }
      setLoading(false)
    }

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel('listings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'listings'
          },
          (payload) => {
            console.log('Realtime listing change:', payload)
            
            if (payload.eventType === 'INSERT') {
              // Add new listing
              setListings(current => [payload.new as any, ...current])
            } else if (payload.eventType === 'UPDATE') {
              // Update existing listing
              setListings(current =>
                current.map(listing =>
                  listing.id === payload.new.id ? { ...listing, ...payload.new } : listing
                )
              )
            } else if (payload.eventType === 'DELETE') {
              // Remove deleted listing
              setListings(current =>
                current.filter(listing => listing.id !== payload.old.id)
              )
            }
          }
        )
        .subscribe()
    }

    fetchInitialData()
    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { listings, loading, setListings }
}

export function useRealtimePickups(userId?: string) {
  const [pickups, setPickups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    let channel: RealtimeChannel

    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('pickups')
        .select(`
          *,
          listing:listings(*, owner:users(name, organization_name)),
          claimer:users(name, organization_name)
        `)
        .or(`claimer_id.eq.${userId},listing.owner_id.eq.${userId}`)
        .order('claimed_at', { ascending: false })

      if (!error && data) {
        setPickups(data)
      }
      setLoading(false)
    }

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel(`pickups-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pickups'
          },
          (payload) => {
            console.log('Realtime pickup change:', payload)
            
            if (payload.eventType === 'INSERT') {
              setPickups(current => [payload.new as any, ...current])
            } else if (payload.eventType === 'UPDATE') {
              setPickups(current =>
                current.map(pickup =>
                  pickup.id === payload.new.id ? { ...pickup, ...payload.new } : pickup
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setPickups(current =>
                current.filter(pickup => pickup.id !== payload.old.id)
              )
            }
          }
        )
        .subscribe()
    }

    fetchInitialData()
    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  return { pickups, loading, setPickups }
}

export function useRealtimeNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    let channel: RealtimeChannel

    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.read).length)
      }
      setLoading(false)
    }

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel(`notifications-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Realtime notification change:', payload)
            
            if (payload.eventType === 'INSERT') {
              setNotifications(current => [payload.new as any, ...current])
              if (!(payload.new as any).read) {
                setUnreadCount(current => current + 1)
              }
            } else if (payload.eventType === 'UPDATE') {
              setNotifications(current =>
                current.map(notification =>
                  notification.id === payload.new.id ? { ...notification, ...payload.new } : notification
                )
              )
              // Recalculate unread count
              setNotifications(current => {
                const newUnreadCount = current.filter(n => !n.read).length
                setUnreadCount(newUnreadCount)
                return current
              })
            }
          }
        )
        .subscribe()
    }

    fetchInitialData()
    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true })
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  }
}
