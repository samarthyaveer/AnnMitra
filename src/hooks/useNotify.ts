'use client'

import { useCallback } from 'react'
import { useNotificationContext } from '@/contexts/NotificationContext'

export function useNotify() {
  const { addNotification } = useNotificationContext()

  const success = useCallback((title: string, message: string, category: 'general' | 'listing' | 'pickup' | 'profile' | 'system' = 'general', actionUrl?: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      category,
      actionUrl
    })
  }, [addNotification])

  const error = useCallback((title: string, message: string, category: 'general' | 'listing' | 'pickup' | 'profile' | 'system' = 'general', actionUrl?: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      category,
      actionUrl
    })
  }, [addNotification])

  const info = useCallback((title: string, message: string, category: 'general' | 'listing' | 'pickup' | 'profile' | 'system' = 'general', actionUrl?: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      category,
      actionUrl
    })
  }, [addNotification])

  const warning = useCallback((title: string, message: string, category: 'general' | 'listing' | 'pickup' | 'profile' | 'system' = 'general', actionUrl?: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      category,
      actionUrl
    })
  }, [addNotification])

  const system = useCallback((title: string, message: string, actionUrl?: string) => {
    addNotification({
      type: 'system',
      title,
      message,
      category: 'system',
      actionUrl
    })
  }, [addNotification])

  // Specific notification types for common actions
  const listingCreated = useCallback((listingTitle: string, listingId: string) => {
    addNotification({
      type: 'success',
      title: '🍽️ Listing Created Successfully',
      message: `Your food listing "${listingTitle}" is now live and available for pickup!`,
      category: 'listing',
      actionUrl: `/listings/${listingId}`
    })
  }, [addNotification])

  const listingClaimed = useCallback((listingTitle: string, claimerName: string, listingId: string) => {
    addNotification({
      type: 'info',
      title: '📦 Food Claimed',
      message: `${claimerName} has claimed your listing "${listingTitle}". Please prepare for pickup!`,
      category: 'pickup',
      actionUrl: `/listings/${listingId}`
    })
  }, [addNotification])

  const pickupCompleted = useCallback((listingTitle: string) => {
    addNotification({
      type: 'success',
      title: '✅ Pickup Completed',
      message: `Food pickup for "${listingTitle}" has been completed successfully!`,
      category: 'pickup'
    })
  }, [addNotification])

  const profileUpdated = useCallback(() => {
    addNotification({
      type: 'success',
      title: '👤 Profile Updated',
      message: 'Your profile information has been updated successfully.',
      category: 'profile',
      actionUrl: '/profile'
    })
  }, [addNotification])

  const profileIncomplete = useCallback(() => {
    addNotification({
      type: 'warning',
      title: '⚠️ Complete Your Profile',
      message: 'Please complete your profile to start claiming food listings.',
      category: 'profile',
      actionUrl: '/profile'
    })
  }, [addNotification])

  return {
    success,
    error,
    info,
    warning,
    system,
    listingCreated,
    listingClaimed,
    pickupCompleted,
    profileUpdated,
    profileIncomplete
  }
}
