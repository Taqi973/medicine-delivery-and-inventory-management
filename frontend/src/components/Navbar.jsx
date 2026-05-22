import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Navbar({ cartItemCount = 0 }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  // --- NEW: DARK MODE STATE (PERSISTENT VIA LOCALSTORAGE) ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Check if a user/admin is logged in
  const isLoggedIn = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Listen for scrolling to trigger the Glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- NEW: DARK MODE TRIGGER EFFECT ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(`${!isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'} Enabled`, {
      id: 'theme-toggle', // Prevents toast spamming if clicked fast
      duration: 1500
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsProfileOpen(false);
    toast.success("Logged out securely.");
    navigate('/');
    window.location.reload();
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '16px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'var(--bg-surface)',
      backdropFilter: isScrolled ? 'blur(10px)' : 'none',
      borderBottom: '1px solid var(--border)',
      boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none'
    }}>
      
      {/* LEFT: Premium Brand Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          padding: '8px', 
          borderRadius: 'var(--radius-sm)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 10h-5V5c0-1.1-.9-2-2-2s-2 .9-2 2v5H5c-1.1 0-2 .9-2 2s.9 2 2 2h5v5c0 1.1.9 2 2 2s2-.9 2-2v-5h5c1.1 0 2-.9 2-2s-.9-2-2-2z"/>
          </svg>
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Cure<span style={{ color: 'var(--primary)' }}>Link</span>
        </span>
      </Link>

      {/* MIDDLE: Navigation Links */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', transition: 'color 0.2s' }} 
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
          Home
        </Link>
        <Link to="/medicines" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
          Medicines
        </Link>
        <Link to="/upload-prescription" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
          <span>📄</span> Upload Prescription
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--secondary)', fontWeight: '600', padding: '6px 12px', backgroundColor: 'rgba(13, 148, 136, 0.1)', borderRadius: 'var(--radius-sm)' }}>
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* RIGHT: Actions (Theme Toggle, Cart & Profile) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* --- NEW: THEME SWITCH BUTTON --- */}
        <button 
          onClick={toggleDarkMode}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.3rem',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
            color: 'var(--text-main)'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        {/* Dynamic Cart Icon */}
        <div 
        onClick={() => window.dispatchEvent(new Event('openCartDrawer'))}
         style={{ position: 'relative', cursor: 'pointer', padding: '4px' }}>
          <svg width="24" height="24" fill="none" stroke="var(--text-main)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartItemCount > 0 && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-8px', 
              backgroundColor: 'var(--danger)', color: 'white',
              fontSize: '0.75rem', fontWeight: 'bold', 
              height: '20px', width: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              borderRadius: '50%',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {cartItemCount}
            </span>
          )}
        </div>

        {/* Auth / Profile Area */}
        {isLoggedIn ? (
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
                padding: '6px 14px', border: `1px solid var(--border)`, 
                borderRadius: '50px', backgroundColor: 'var(--bg-body)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ 
                width: '24px', height: '24px', backgroundColor: 'var(--primary)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' 
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>

            {isProfileOpen && (
              <div style={{ 
                position: 'absolute', top: '120%', right: 0, width: '180px', 
                backgroundColor: 'var(--bg-surface)', border: `1px solid var(--border)`, 
                borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', 
                overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 100 
              }}>
                {user?.role !== 'admin' && (
                  <Link to="/dashboard" onClick={() => setIsProfileOpen(false)} style={{ 
                    padding: '12px 16px', textDecoration: 'none', color: 'var(--text-main)', 
                    fontSize: '0.95rem', fontWeight: '600', borderBottom: '1px solid var(--border)',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-body)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                    👤 My Dashboard
                  </Link>
                )}

                <button onClick={handleLogout} style={{ 
                  padding: '12px 16px', textAlign: 'left', border: 'none', 
                  backgroundColor: 'transparent', color: 'var(--danger)', 
                  fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--danger-bg)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  🚪 Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/auth" className="btn-primary" style={{ textDecoration: 'none' }}>
            Sign In / Register
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;