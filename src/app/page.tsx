export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            Reduce Food Waste,
            <br />
            Feed Your Community
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Connect surplus food from campus canteens with students and NGOs. 
            Turn waste into meals, build community, and create positive environmental impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors w-full sm:w-auto">
              Get Started
            </button>
            <button className="border border-border hover:bg-muted text-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors w-full sm:w-auto">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">2.5K+</div>
              <div className="text-muted-foreground">Meals Shared</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Campus Partners</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1.2T</div>
              <div className="text-muted-foreground">CO₂ Saved (kg)</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Canteens Share</h3>
            <p className="text-muted-foreground">
              Campus canteens and restaurants post surplus food with pickup details
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Claims</h3>
            <p className="text-muted-foreground">
              Students and NGOs browse and claim food that would otherwise go to waste
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Impact Created</h3>
            <p className="text-muted-foreground">
              Track environmental savings and community impact in real-time
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the movement to reduce food waste and strengthen campus community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              I'm a Canteen Owner
            </button>
            <button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              I'm a Student/NGO
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
