import React from 'react';
import { Link } from 'react-router-dom';

function HomeLandingPage() {
  // --- SUPER SMART AUTH CHECK ---
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user; // Checks if ANY user is logged in
  const isAdmin = user?.role === 'admin'; // Checks if they are an admin

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* --- UPGRADED PERFECT-FIT HERO SECTION --- */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 75px)',
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #1e293b 100%)', // Modern medical blue to sleek dark slate
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background blur elements for a modern glass effect */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(14, 165, 233, 0.15)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '850px', width: '100%' }}>
          
          <span className="animate-pop-in" style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            padding: '8px 24px', 
            borderRadius: '50px', 
            fontSize: '0.85rem', 
            fontWeight: '600', 
            letterSpacing: '1.5px', 
            textTransform: 'uppercase', 
            marginBottom: '32px', 
            display: 'inline-block', 
            backdropFilter: 'blur(8px)', 
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            100% Genuine Medicines
          </span>
          
          <h1 className="animate-slide-up" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: '800', margin: '0 0 24px 0', lineHeight: '1.1', letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Healthcare Delivery, <br/>
            <span style={{ color: '#38bdf8' }}>Simplified.</span>
          </h1>
          
          <p className="animate-slide-up" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', color: '#e2e8f0', marginBottom: '48px', lineHeight: '1.7', maxWidth: '680px', margin: '0 auto 48px auto', fontWeight: '400' }}>
            Skip the pharmacy lines. Get your prescriptions and daily health essentials delivered directly to your door with unmatched speed and reliability.
          </p>
          
          <div className="animate-slide-up" style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Everyone always sees this button */}
            <Link to="/medicines" className="btn-primary" style={{ 
              padding: '16px 40px', 
              fontSize: '1.1rem', 
              fontWeight: '600',
              backgroundColor: '#ffffff', 
              color: '#0ea5e9', 
              textDecoration: 'none',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', 
              borderRadius: '50px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              Shop Medicines Now
            </Link>
            
            {/* --- DYNAMIC BUTTON LOGIC --- */}
            {isAdmin ? (
              <Link to="/admin" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none', backgroundColor: '#10b981', color: 'white', border: 'none', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', borderRadius: '50px' }}>
                Go to Admin Dashboard
              </Link>
            ) : !isLoggedIn ? (
              <Link to="/auth" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', fontWeight: '600', textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', borderRadius: '50px' }}>
                Sign In / Register
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '70px' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>Why Choose CureLink?</h2>
          <p style={{ color: '#64748b', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>Built to provide a seamless and secure healthcare experience from order to delivery.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
          {/* Card 1 */}
          <div className="card" style={{ padding: '40px 30px', backgroundColor: 'white', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', borderTop: '6px solid #0ea5e9', transition: 'transform 0.3s ease' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🛡️</div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Verified Authenticity</h3>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>Every medicine is sourced directly from licensed manufacturers and verified pharmacies.</p>
          </div>
          
          {/* Card 2 */}
          <div className="card" style={{ padding: '40px 30px', backgroundColor: 'white', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', borderTop: '6px solid #10b981', transition: 'transform 0.3s ease' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>⚡</div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Express Delivery</h3>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>We prioritize your health. Get your orders delivered within hours, tracking included.</p>
          </div>
          
          {/* Card 3 */}
          <div className="card" style={{ padding: '40px 30px', backgroundColor: 'white', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', borderTop: '6px solid #f59e0b', transition: 'transform 0.3s ease' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🔒</div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Secure Payments</h3>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>Pay safely via Cash on Delivery, EasyPaisa, JazzCash, or secure Credit Card processing.</p>
          </div>
          
          {/* Card 4 */}
          <div className="card" style={{ padding: '40px 30px', backgroundColor: 'white', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', borderTop: '6px solid #8b5cf6', transition: 'transform 0.3s ease' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>👨‍⚕️</div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Prescription Review</h3>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>Upload your prescriptions securely for review by our licensed administrative pharmacists.</p>
          </div>
        </div>
      </div>

      {/* --- CALL TO ACTION --- */}
      <div style={{ backgroundColor: '#ffffff', padding: '80px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', backgroundColor: '#f0f9ff', padding: '50px', borderRadius: '32px' }}>
          <div style={{ flex: '1 1 450px' }}>
            <h2 style={{ fontSize: '2.4rem', color: '#0f172a', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>Ready to refill your stock?</h2>
            <p style={{ color: '#475569', fontSize: '1.15rem', marginBottom: '32px', lineHeight: '1.6' }}>
              Browse our catalog of thousands of over-the-counter and prescription medicines. Filter by formula to find the most cost-effective options.
            </p>
            <Link to="/medicines" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: '600', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '50px', display: 'inline-block', textDecoration: 'none', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)' }}>
              Explore the Catalog →
            </Link>
          </div>
          <div style={{ flex: '1 1 250px', textAlign: 'center' }}>
            <div style={{ width: '220px', height: '220px', backgroundColor: '#ffffff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto', border: '12px solid #bae6fd', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '6rem', transform: 'rotate(-15deg)' }}>💊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeLandingPage;