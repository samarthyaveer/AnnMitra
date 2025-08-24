'use client'

import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PublicStats from '@/components/analytics/PublicStats'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }
  useEffect(() => {
    // Add scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animationDelay = '0.2s';
          entry.target.classList.add('fade-in');
        }
      });
    }, observerOptions);

    // Observe all elements that should animate
    const animatedElements = document.querySelectorAll('.stat-card, .process-card, .cta-card > *');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor: Element) => {
      anchor.addEventListener('click', function (this: HTMLElement, e: Event) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href') || '');
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Add subtle parallax effect to background circles
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const circles = document.querySelectorAll('.bg-circle');
      
      circles.forEach((circle, index) => {
        const speed = 0.5 + (index * 0.1);
        (circle as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Show custom landing page only for signed out users */}
      <SignedOut>
          {/* Landing Navigation */}
          <nav 
            className="glass landing-nav backdrop-blur-strong"
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%) translateZ(0)',
              zIndex: 1000,
              padding: '16px 32px',
              width: '95%',
              maxWidth: '1400px',
              minHeight: '70px',
              backdropFilter: 'blur(35px) saturate(180%)',
              WebkitBackdropFilter: 'blur(35px) saturate(180%)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              willChange: 'backdrop-filter',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="nav-content">
              <div className="logo">
                <div className="logo-icon">A</div>
                <span>AnnMitra</span>
              </div>
              <div className="nav-links">
                <Link href="/browse">Browse Food</Link>
                <Link href="/map">Map</Link>
                <Link href="/auth/sign-in" className="sign-in-btn">Sign In</Link>
              </div>
              
              {/* Mobile Menu Button */}
              <div className="mobile-menu-btn">
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
              <div className="mobile-nav-menu">
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
          </nav>

          {/* Hero Section */}
          <section className="hero">
            <h1 className="fade-in">Reduce Food Waste,<br />Feed Your Community</h1>
            <p className="fade-in">Connect surplus food from campus canteens with students and NGOs. Turn waste into meals, build community, and create positive environmental impact.</p>
            <div className="cta-buttons fade-in">
              <Link href="/auth/sign-in" className="btn-primary">Get Started</Link>
              <a href="#learn" className="btn-secondary">Learn More</a>
            </div>
          </section>

          {/* Stats Section */}
          <section className="stats" id="learn">
            <div className="stats-container glass">
              <div className="stat-card fade-in">
                <div className="stat-number">2.5K+</div>
                <div className="stat-label">Meals Shared</div>
              </div>
              <div className="stat-card fade-in">
                <div className="stat-number">50+</div>
                <div className="stat-label">Campus Partners</div>
              </div>
              <div className="stat-card fade-in">
                <div className="stat-number">1.2T</div>
                <div className="stat-label">CO₂ Saved (kg)</div>
              </div>
            </div>
          </section>

          {/* Analytics Section */}
          <PublicStats />

          {/* How It Works */}
          <section className="how-it-works">
            <h2 className="section-title fade-in">How It Works</h2>
            <div className="process-grid">
              <div className="process-card glass-card fade-in">
                <div className="process-icon">�</div>
                <h3 className="process-title">Canteens Share</h3>
                <p className="process-description">Campus canteens and restaurants post surplus food with pickup details</p>
              </div>
              <div className="process-card glass-card fade-in">
                <div className="process-icon">👥</div>
                <h3 className="process-title">Community Claims</h3>
                <p className="process-description">Students and NGOs browse and claim food that would otherwise go to waste</p>
              </div>
              <div className="process-card glass-card fade-in">
                <div className="process-icon">🌱</div>
                <h3 className="process-title">Impact Created</h3>
                <p className="process-description">Track environmental savings and community impact in real-time</p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="final-cta">
            <div className="cta-card glass">
              <h2 className="cta-title fade-in">Ready to Make a Difference?</h2>
              <p className="cta-subtitle fade-in">Join the movement to reduce food waste and strengthen campus community</p>
              <div className="role-buttons fade-in">
                <Link href="/auth/sign-in" className="role-btn">I&apos;m a Canteen Owner</Link>
                <Link href="/auth/sign-in" className="role-btn secondary">I&apos;m a Student/NGO</Link>
              </div>
            </div>
          </section>
      </SignedOut>

      {/* Show simple dashboard for signed in users */}
      <SignedIn>
        <div className="min-h-screen">
          {/* Analytics Section */}
          <PublicStats />

          {/* Stats Section */}
          <section className="stats">
            <div className="stats-container glass">
              <div className="stat-card">
                <div className="stat-number">2.5K+</div>
                <div className="stat-label">Meals Shared</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">50+</div>
                <div className="stat-label">Campus Partners</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">1.2T</div>
                <div className="stat-label">CO₂ Saved (kg)</div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="how-it-works">
            <h2 className="section-title">How It Works</h2>
            <div className="process-grid">
              <div className="process-card glass-card">
                <div className="process-icon">🏪</div>
                <h3 className="process-title">Canteens Share</h3>
                <p className="process-description">Campus canteens and restaurants post surplus food with pickup details</p>
              </div>
              <div className="process-card glass-card">
                <div className="process-icon">👥</div>
                <h3 className="process-title">Community Claims</h3>
                <p className="process-description">Students and NGOs browse and claim food that would otherwise go to waste</p>
              </div>
              <div className="process-card glass-card">
                <div className="process-icon">🌱</div>
                <h3 className="process-title">Impact Created</h3>
                <p className="process-description">Track environmental savings and community impact in real-time</p>
              </div>
            </div>
          </section>
        </div>
      </SignedIn>
    </>
  );
}
