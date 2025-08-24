import Link from 'next/link'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the Food Sharing Movement
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Connect with your campus community to reduce food waste and help those in need
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 hover:bg-gray-800/40 transition-all duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">New to AnnMitra?</h3>
            <p className="text-gray-300 mb-6">
              Create an account and choose your role to start making a difference
            </p>
            <Link 
              href="/auth/sign-up"
              className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 text-center hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 hover:bg-gray-800/40 transition-all duration-300">
            <h3 className="text-2xl font-semibold text-white mb-4">Already have an account?</h3>
            <p className="text-gray-300 mb-6">
              Sign in to continue your food sharing journey
            </p>
            <Link 
              href="/auth/sign-in"
              className="inline-block w-full border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 text-center hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-md border border-green-500/30 rounded-2xl p-8">
          <h3 className="text-3xl font-semibold text-white mb-6 text-center">Why Join AnnMitra?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h4 className="text-xl font-semibold text-white mb-3">Environmental Impact</h4>
              <p className="text-gray-300">
                Reduce food waste and your carbon footprint
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h4 className="text-xl font-semibold text-white mb-3">Community Building</h4>
              <p className="text-gray-300">
                Connect with others who care about sustainability
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h4 className="text-xl font-semibold text-white mb-3">Save Money</h4>
              <p className="text-gray-300">
                Access free or low-cost meals from local businesses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
