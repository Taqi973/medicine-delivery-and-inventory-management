import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // RESTORED: Your original state (No broken 'role' dropdown interfering with your SQL)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const navigate = useNavigate();

  // RESTORED: Your exact original submit logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const loadingToast = toast.loading(isLogin ? "Authenticating..." : "Creating Account...");

    try {
      const response = await axios.post(`http://localhost:8080${endpoint}`, formData);
      toast.dismiss(loadingToast);
      
      if (isLogin) {
        toast.success("Welcome back!");
        
        // RESTORED: Your exact token storage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user || { name: 'User', role: response.data.role })); 
        
        // RESTORED: Your original smart routing 
        if (response.data.role === 'admin') {
          navigate('/admin');
          window.location.reload(); // Ensures the Navbar updates instantly
        } else {
          navigate('/');
          window.location.reload();
        }
      } else {
        // --- UPGRADED PART: Redirect to OTP screen instead of just clearing the form ---
        toast.success("Account created! Check your email for the code.");
        
        // We navigate to the new /verify page and securely pass the user's ID
        navigate('/verify', { state: { userId: response.data.userId } });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || "Authentication failed. Please try again.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
      
      {/* LEFT SIDE: Premium Branding */}
      <div style={{ 
        flex: 1.2, 
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 58, 138, 0.8) 100%), url(https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white'
      }}>
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '600px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '50px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.2rem' }}>⚕️</span>
            <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>CURELINK PHARMACY</span>
          </div>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px', letterSpacing: '-1px' }}>
            Healthcare, <br/><span style={{ color: '#60a5fa' }}>redefined.</span>
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '40px' }}>
            Experience Pakistan's most advanced medicine delivery and inventory management system. Secure, intelligent, and built for the future.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '40px',
        backgroundColor: 'white',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.03)'
      }}>
        
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2.2rem', color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Join CURELINK to start ordering medicines.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!isLogin && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Syed Taqi" 
                    required={!isLogin}
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#2563eb', fontSize: '1rem', backgroundColor: '#f8fafc' }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="0300 1234567" 
                    required={!isLogin}
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#2563eb', fontSize: '1rem', backgroundColor: '#f8fafc' }} 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>Delivery Address</label>
                  <textarea 
                    placeholder="House #, Street, City" 
                    required={!isLogin}
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#2563eb', fontSize: '1rem', backgroundColor: '#f8fafc', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} 
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#2563eb', fontSize: '1rem', backgroundColor: '#f8fafc' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#334155' }}>Password</label>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                style={{ padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outlineColor: '#2563eb', fontSize: '1rem', backgroundColor: '#f8fafc' }} 
              />
            </div>

            <button 
              type="submit" 
              style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' }}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '30px', color: '#64748b', fontSize: '0.95rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setFormData({ name: '', email: '', password: '', phone: '', address: '' }); }}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', padding: 0 }}
            >
              {isLogin ? 'Sign up for free' : 'Sign in here'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthPage;