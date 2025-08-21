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
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">
            Stay updated with your food listings, pickups, and account activities
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {label} {count > 0 && `(${count})`}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' 
                  ? "You'll see updates about your listings and pickups here"
                  : `No ${filter} notifications to show`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-gray-800 rounded-lg p-6 border transition-all hover:bg-gray-750 ${
                  !notification.read 
                    ? 'border-green-600 shadow-lg shadow-green-600/20' 
                    : 'border-gray-700'
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
                <div className="flex justify-end mt-4 space-x-2">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notification.id)
                      }}
                      className="text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeNotification(notification.id)
                    }}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
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
      <div className="flex flex-col items-center space-y-1">
        <span className="text-2xl">{getCategoryIcon(notification.category)}</span>
        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
              {notification.title}
            </h3>
            <p className="text-gray-400 mt-1 leading-relaxed">
              {notification.message}
            </p>
          </div>
          
          {/* Unread Indicator */}
          {!notification.read && (
            <div className="w-3 h-3 bg-green-500 rounded-full ml-4 flex-shrink-0"></div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span className="bg-gray-700 px-2 py-1 rounded capitalize">
            {notification.category}
          </span>
          <span>{formatDateTime(notification.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}
