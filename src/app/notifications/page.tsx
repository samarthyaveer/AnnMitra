'use client'

import { useNotificationContext } from '@/contexts/NotificationContext'
import Link from 'next/link'
import { useState } from 'react'

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    case 'system':
      return '🔔'
    default:
      return '📢'
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'listing':
      return '🍽️'
    case 'pickup':
      return '📦'
    case 'profile':
      return '👤'
    case 'system':
      return '⚙️'
    default:
      return '📝'
  }
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export default function NotificationsPage() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount
  } = useNotificationContext()

  const [filter, setFilter] = useState<'all' | 'unread' | 'listing' | 'pickup' | 'profile' | 'system'>('all')

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.category === filter
  })

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Notifications 🔔
          </h1>
          <p className="text-lg text-gray-300">
            Stay updated with your food listings, pickups, and account activities
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'listing', label: '🍽️ Listings', count: notifications.filter(n => n.category === 'listing').length },
                { key: 'pickup', label: '📦 Pickups', count: notifications.filter(n => n.category === 'pickup').length },
                { key: 'profile', label: '👤 Profile', count: notifications.filter(n => n.category === 'profile').length },
                { key: 'system', label: '⚙️ System', count: notifications.filter(n => n.category === 'system').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === key
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-600'
                  }`}
                >
                  {label} {count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      filter === key ? 'bg-green-400/20' : 'bg-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl text-sm font-medium transition-all"
                >
                  ✅ Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl text-sm font-medium transition-all"
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-6">🔔</div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                {filter === 'all' 
                  ? "You'll see updates about your listings and pickups here"
                  : `No ${filter} notifications to show`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="btn-secondary"
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`glass-card p-6 transition-all cursor-pointer ${
                  !notification.read 
                    ? 'border-green-400/50 shadow-lg shadow-green-400/10 hover:border-green-400/70' 
                    : 'hover:border-gray-500/50'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {notification.actionUrl ? (
                  <Link href={notification.actionUrl} className="block">
                    <NotificationCard notification={notification} />
                  </Link>
                ) : (
                  <NotificationCard notification={notification} />
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end mt-6 space-x-3">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notification.id)
                      }}
                      className="text-sm text-green-400 hover:text-green-300 transition-colors px-3 py-1 rounded-lg hover:bg-green-500/10"
                    >
                      ✅ Mark as read
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNotification(notification.id)
                    }}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded-lg hover:bg-red-500/10"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function NotificationCard({ notification }: { notification: any }) {
  return (
    <div className="flex items-start space-x-4">
      {/* Icons */}
      <div className="flex flex-col items-center space-y-2 flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-600 flex items-center justify-center">
          <span className="text-2xl">{getCategoryIcon(notification.category)}</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-gray-700/50 border border-gray-600 flex items-center justify-center">
          <span className="text-sm">{getNotificationIcon(notification.type)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
              {notification.title}
            </h3>
            <p className="text-gray-400 mt-2 leading-relaxed">
              {notification.message}
            </p>
          </div>
          
          {/* Unread Indicator */}
          {!notification.read && (
            <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50 flex-shrink-0"></div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="bg-gray-700/50 border border-gray-600 px-3 py-1 rounded-lg capitalize text-gray-300">
            {notification.category}
          </span>
          <span className="text-gray-400">{formatDateTime(notification.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}
