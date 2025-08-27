'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotificationContext } from '@/contexts/NotificationContext'
import Link from 'next/link'

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

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useNotificationContext()

  // Position dropdown relative to button and viewport
  useEffect(() => {
    if (isOpen && dropdownRef.current && buttonRef.current) {
      const dropdown = dropdownRef.current
      const button = buttonRef.current
      const buttonRect = button.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Reset position styles to get natural dimensions
      dropdown.style.position = 'fixed'
      dropdown.style.visibility = 'hidden'
      dropdown.style.display = 'block'
      
      const dropdownRect = dropdown.getBoundingClientRect()
      
      // Calculate optimal position
      let left = buttonRect.right - dropdownRect.width
      let top = buttonRect.bottom + 8
      
      // Ensure dropdown doesn't go off screen horizontally
      if (left < 8) {
        left = 8
      } else if (left + dropdownRect.width > viewportWidth - 8) {
        left = viewportWidth - dropdownRect.width - 8
      }
      
      // Ensure dropdown doesn't go off screen vertically
      if (top + dropdownRect.height > viewportHeight - 16) {
        // Position above button if not enough space below
        top = buttonRect.top - dropdownRect.height - 8
        
        // If still not enough space, adjust height and position at top
        if (top < 16) {
          top = 16
          dropdown.style.maxHeight = `${viewportHeight - 32}px`
        }
      }
      
      // Apply calculated position
      dropdown.style.left = `${left}px`
      dropdown.style.top = `${top}px`
      dropdown.style.right = 'auto'
      dropdown.style.visibility = 'visible'
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      setIsOpen(false)
    }
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
  }

  const handleClearAll = () => {
    clearAll()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-400 hover:text-green-400 hover:bg-white/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-xl border border-gray-600/30 glass"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="notification-dropdown"
          style={{
            position: 'fixed',
            zIndex: 9999,
            visibility: 'hidden'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-600 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-green-400 hover:text-green-300 transition-colors font-medium"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  You&apos;ll see updates about your listings and pickups here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-600">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${
                      !notification.read ? 'bg-green-500/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.actionUrl ? (
                      <Link href={notification.actionUrl} className="block">
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <NotificationContent notification={notification} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-600 bg-gray-800/30">
              <Link
                href="/notifications"
                className="block text-center text-sm text-green-400 hover:text-green-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NotificationContent({ notification }: { notification: any }) {
  return (
    <div className="flex items-start space-x-3">
      {/* Category & Type Icons */}
      <div className="flex flex-col items-center">
        <span className="text-lg">{getCategoryIcon(notification.category)}</span>
        <span className="text-xs">{getNotificationIcon(notification.type)}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className={`text-sm font-medium group-hover:text-green-400 transition-colors ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
              {notification.title}
            </h4>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>
          
          {/* Unread Indicator */}
          {!notification.read && (
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 ml-2 flex-shrink-0"></div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-2">
          {formatTimeAgo(notification.timestamp)}
        </p>
      </div>
    </div>
  )
}
