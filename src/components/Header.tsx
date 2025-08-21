import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <Link href="/" className="text-xl font-bold text-white hover:text-green-400 transition-colors">
            AnnMitra
          </Link>
        </div>
        
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
        
        <div className="flex items-center space-x-4">
          <SignedOut>
            <Link href="/auth/sign-in" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              Sign In
            </Link>
          </SignedOut>
          
          <SignedIn>
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
      </div>
    </header>
  )
}
