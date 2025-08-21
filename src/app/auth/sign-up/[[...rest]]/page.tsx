import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join AnnMitra</h1>
          <p className="text-muted-foreground">Create an account to start reducing food waste in your community</p>
        </div>
        
        {/* Role Selection */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Choose your role:</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="border border-border rounded p-3 hover:bg-muted cursor-pointer">
              <div className="font-medium">🏢 Canteen/Restaurant Owner</div>
              <div className="text-sm text-muted-foreground">Share surplus food from your establishment</div>
            </div>
            <div className="border border-border rounded p-3 hover:bg-muted cursor-pointer">
              <div className="font-medium">🎓 Student</div>
              <div className="text-sm text-muted-foreground">Find and claim food from campus</div>
            </div>
            <div className="border border-border rounded p-3 hover:bg-muted cursor-pointer">
              <div className="font-medium">🤝 NGO/Organization</div>
              <div className="text-sm text-muted-foreground">Collect food for community distribution</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-card border border-border shadow-lg",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                formFieldInput: "bg-input border border-border text-foreground",
                formFieldLabel: "text-foreground",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary",
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
