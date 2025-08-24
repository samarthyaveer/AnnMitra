'use client'

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import NotificationDropdown from './NotificationDropdown'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Hide header on landing page for signed out users
  const isLandingPage = pathname === '/'

  const navLinkClass = (href: string) => {
    const isActive = pathname === href
    return `text-sm font-medium transition-all duration-300 hover:text-white hover:text-shadow ${
      isActive 
        ? 'text-white border-b-2 border-green-400 pb-1' 
        : 'text-gray-300'
    }`
  }

  return (
    <>
      <SignedOut>
        {!isLandingPage && (
          <header className="glass-nav fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-6xl mx-auto">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="logo-icon">A</div>
                  <Link href="/" className="logo-text">
                    AnnMitra
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-8">
                  <Link href="/browse" className={navLinkClass('/browse')}>
                    Browse Food
                  </Link>
                  <Link href="/map" className={navLinkClass('/map')}>
                    Map
                  </Link>
                </nav>

                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/auth/sign-in" className="sign-in-btn">
                    Sign In
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center space-x-2">
                  <button
                    onClick={toggleMobileMenu}
                    className="mobile-menu-toggle"
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
                <div className="mobile-nav-menu md:hidden">
                  <Link 
                    href="/browse" 
                    className="mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Browse Food
                  </Link>
                  
                  <Link 
                    href="/map" 
                    className="mobile-nav-link"
                    onClick={closeMobileMenu}
                  >
                    Map
                  </Link>

                  <Link 
                    href="/auth/sign-in" 
                    className="mobile-nav-link mobile-signin-btn"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </header>
        )}
      </SignedOut>

      <SignedIn>
        <header className="glass-nav fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-6xl mx-auto">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="logo-icon">A</div>
                <Link href="/" className="logo-text">
                  AnnMitra
                </Link>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                <Link href="/browse" className={navLinkClass('/browse')}>
                  Browse Food
                </Link>
                <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link href="/pickups" className={navLinkClass('/pickups')}>
                  Pickups
                </Link>
                <Link href="/listings" className={navLinkClass('/listings')}>
                  My Listings
                </Link>
                <Link href="/map" className={navLinkClass('/map')}>
                  Map
                </Link>
              </nav>

              {/* Desktop User Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <NotificationDropdown />
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-green-400/30 hover:ring-green-400/50 transition-all",
                      userButtonPopoverCard: "glass border-gray-600 bg-gray-900/90 backdrop-blur-xl",
                      userButtonPopoverActionButton: "text-white hover:bg-gray-700/50 transition-all",
                      userButtonPopoverActionButtonText: "text-white font-medium",
                      userButtonPopoverFooter: "bg-gray-800/50 border-t border-gray-600",
                    }
                  }}
                />
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-3">
                <NotificationDropdown />
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-green-400/30",
                      userButtonPopoverCard: "glass border-gray-600 bg-gray-900/90 backdrop-blur-xl",
                      userButtonPopoverActionButton: "text-white hover:bg-gray-700/50",
                      userButtonPopoverActionButtonText: "text-white",
                      userButtonPopoverFooter: "bg-gray-800/50 border-t border-gray-600",
                    }
                  }}
                />
                
                <button
                  onClick={toggleMobileMenu}
                  className="mobile-menu-toggle"
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
              <div className="mobile-nav-menu md:hidden">
                <Link 
                  href="/browse" 
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Browse Food
                </Link>
                
                <Link 
                  href="/dashboard" 
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/pickups" 
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Pickups
                </Link>
                <Link 
                  href="/listings" 
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  My Listings
                </Link>
                
                <Link 
                  href="/map" 
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Map
                </Link>
              </div>
            )}
          </div>
        </header>
      </SignedIn>
    </>
  )
}
