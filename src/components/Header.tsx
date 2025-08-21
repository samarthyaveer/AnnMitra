'use client'

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'
import NotificationDropdown from './NotificationDropdown'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition-colors">
              AnnMitra
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/browse" className="text-gray-400 hover:text-white transition-colors">
              Browse Food
            </Link>
            <SignedIn>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/pickups" className="text-gray-400 hover:text-white transition-colors">
                Pickups
              </Link>
              <Link href="/listings" className="text-gray-400 hover:text-white transition-colors">
                My Listings
              </Link>
            </SignedIn>
            <Link href="/map" className="text-gray-400 hover:text-white transition-colors">
              Map
            </Link>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <Link href="/auth/sign-in" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                Sign In
              </Link>
            </SignedOut>
            
            <SignedIn>
              <NotificationDropdown />
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-gray-800 border border-gray-700",
                    userButtonPopoverActionButton: "text-white hover:bg-gray-700",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverFooter: "bg-gray-700",
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <SignedIn>
              <NotificationDropdown />
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-gray-800 border border-gray-700",
                    userButtonPopoverActionButton: "text-white hover:bg-gray-700",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverFooter: "bg-gray-700",
                  }
                }}
              />
            </SignedIn>
            
            <button
              onClick={toggleMobileMenu}
              className="text-gray-400 hover:text-white focus:outline-none focus:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link 
                href="/browse" 
                className="text-gray-400 hover:text-white transition-colors py-2 px-2 rounded hover:bg-gray-700"
                onClick={closeMobileMenu}
              >
                Browse Food
              </Link>
              
              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="text-gray-400 hover:text-white transition-colors py-2 px-2 rounded hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/pickups" 
                  className="text-gray-400 hover:text-white transition-colors py-2 px-2 rounded hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  Pickups
                </Link>
                <Link 
                  href="/listings" 
                  className="text-gray-400 hover:text-white transition-colors py-2 px-2 rounded hover:bg-gray-700"
                  onClick={closeMobileMenu}
                >
                  My Listings
                </Link>
              </SignedIn>
              
              <Link 
                href="/map" 
                className="text-gray-400 hover:text-white transition-colors py-2 px-2 rounded hover:bg-gray-700"
                onClick={closeMobileMenu}
              >
                Map
              </Link>

              <SignedOut>
                <div className="pt-2 border-t border-gray-700 mt-2">
                  <Link 
                    href="/auth/sign-in" 
                    className="block bg-green-600 hover:bg-green-700 text-white text-center px-4 py-2 rounded-lg transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                </div>
              </SignedOut>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
