import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-16 relative"
      style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 25%, #0a0a0a 50%, #1f1f1f 75%, #0d0d0d 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #00d4aa 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #4ade80 0%, transparent 50%),
                             radial-gradient(circle at 50% 50%, #0ea5e9 0%, transparent 50%)`
          }}
        />
      </div>
      
      <div 
        className="glass-card w-full max-w-lg mx-auto p-8 relative z-10"
        style={{
          backdropFilter: 'blur(25px) saturate(180%)',
          WebkitBackdropFilter: 'blur(25px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          transform: 'translateZ(0)',
          willChange: 'backdrop-filter',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Join AnnMitra</h1>
          <p className="text-gray-300">Create an account to start reducing food waste in your community</p>
        </div>
        
        {/* Role Selection */}
        <div 
          className="glass-card p-6 mb-6"
          style={{
            backdropFilter: 'blur(15px) saturate(180%)',
            WebkitBackdropFilter: 'blur(15px) saturate(180%)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px'
          }}
        >
          <h3 className="font-semibold mb-4 text-white">Choose your role:</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="border border-white/20 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-all backdrop-blur-sm">
              <div className="font-medium text-white">🏢 Canteen/Restaurant Owner</div>
              <div className="text-sm text-gray-300">Share surplus food from your establishment</div>
            </div>
            <div className="border border-white/20 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-all backdrop-blur-sm">
              <div className="font-medium text-white">🎓 Student</div>
              <div className="text-sm text-gray-300">Find and claim food from campus</div>
            </div>
            <div className="border border-white/20 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-all backdrop-blur-sm">
              <div className="font-medium text-white">🤝 NGO/Organization</div>
              <div className="text-sm text-gray-300">Collect food for community distribution</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "bg-transparent border-0 shadow-none w-full",
                headerTitle: "text-white text-xl font-semibold",
                headerSubtitle: "text-gray-300",
                formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white transition-all duration-300 rounded-xl",
                formFieldInput: "bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm",
                formFieldLabel: "text-white font-medium",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-green-400 hover:text-green-300",
                socialButtonsBlockButton: "bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all rounded-xl backdrop-blur-sm",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-white/20",
                dividerText: "text-gray-300",
                footerActionText: "text-gray-300",
                footerActionLink: "text-green-400 hover:text-green-300",
                formFieldErrorText: "text-red-400",
                alertText: "text-red-400",
                formFieldSuccessText: "text-green-400"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
