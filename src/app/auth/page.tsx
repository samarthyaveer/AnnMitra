export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Join the Food Sharing Movement</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Connect with your campus community to reduce food waste and help those in need
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">New to AnnMitra?</h3>
            <p className="text-muted-foreground mb-4">
              Create an account and choose your role to start making a difference
            </p>
            <a 
              href="/auth/sign-up"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors"
            >
              Sign Up
            </a>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Already have an account?</h3>
            <p className="text-muted-foreground mb-4">
              Sign in to continue your food sharing journey
            </p>
            <a 
              href="/auth/sign-in"
              className="inline-block border border-border hover:bg-muted text-foreground px-6 py-3 rounded-lg transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-8">
          <h3 className="text-2xl font-semibold mb-4">Why Join AnnMitra?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-3xl mb-2">🌱</div>
              <h4 className="font-semibold mb-2">Environmental Impact</h4>
              <p className="text-sm text-muted-foreground">
                Reduce food waste and your carbon footprint
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🤝</div>
              <h4 className="font-semibold mb-2">Community Building</h4>
              <p className="text-sm text-muted-foreground">
                Connect with others who care about sustainability
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold mb-2">Save Money</h4>
              <p className="text-sm text-muted-foreground">
                Access free or low-cost meals from local businesses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
