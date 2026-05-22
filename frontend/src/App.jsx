import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminDashboard from './pages/AdminDashboard';
import CustomerStore from './pages/CustomerStore';
import AdminLogin from './pages/AdminLogin';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import VerifyOTP from './components/VerifyOTP';
import HomeLandingPage from './pages/HomeLandingPage';
import UploadPrescription from './components/UploadPrescription';
import HelpCenter from './pages/HelpCenter';
import CustomerDashboard from './pages/CustomerDashboard';
import MedicineDetailPage from './pages/MedicineDetailPage';

// The Security Guard Component (Untouched - Works perfectly)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); 
  const user = JSON.parse(localStorage.getItem('user') || 'null'); 

  // If there is no token, OR the user is not an admin, kick them back to auth
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/auth" replace />; 
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* Upgraded Toast Styling to match our new theme */}
      <Toaster 
        position="bottom-right" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: 'var(--bg-surface)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            fontWeight: '600'
          },
        }}
      />

      {/* THE MASTER WRAPPER: Uses the new App.css class for smooth fading and sticky footer */}
      <div className="page-container" style={{ backgroundColor: 'var(--bg-body)' }}>
        
        {/* NEW SLEEK, INTELLIGENT NAVIGATION BAR */}
        <Navbar />

        {/* THE MAIN PAGE CONTENT */}
        <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
         <Routes>
            <Route path="/verify" element={<VerifyOTP />} />
            
            {/* The main URL now goes to the beautiful landing page */}
            <Route path="/" element={<HomeLandingPage />} />
            
            {/* The store catalog lives here now */}
            <Route path="/medicines" element={<CustomerStore />} />
            <Route path="/medicine/:id" element={<MedicineDetailPage />} />
            <Route path="/upload-prescription" element={<UploadPrescription />} />
            <Route path="/upload-prescription" element={<UploadPrescription />} />
        {/* ADD THE HELP CENTER ROUTE HERE 👇 */}
        <Route path="/help" element={<HelpCenter />} />
        {/* ADD THE DASHBOARD ROUTE HERE 👇 */}
        <Route path="/dashboard" element={<CustomerDashboard />} />
            
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        {/* --- THE MASSIVE GLOBAL FOOTER --- */}
        <footer style={{ backgroundColor: '#0f172a', color: '#cbd5e1', padding: '70px 40px 30px 40px', marginTop: 'auto', borderTop: '4px solid var(--primary)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '50px', borderBottom: '1px solid #1e293b', paddingBottom: '50px' }}>
            
            {/* Column 1: Brand Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 10h-5V5c0-1.1-.9-2-2-2s-2 .9-2 2v5H5c-1.1 0-2 .9-2 2s.9 2 2 2h5v5c0 1.1.9 2 2 2s2-.9 2-2v-5h5c1.1 0 2-.9 2-2s-.9-2-2-2z"/></svg>
                </div>
                <h3 style={{ color: 'white', fontSize: '1.6rem', margin: '0', letterSpacing: '-0.5px', fontWeight: '800' }}>Cure<span style={{ color: 'var(--primary)' }}>Link</span></h3>
              </div>
              <p style={{ lineHeight: '1.7', fontSize: '0.95rem', color: '#94a3b8' }}>
                Your trusted digital pharmacy. We deliver genuine medicines directly to your doorstep with speed and reliability. Built for the future of healthcare.
              </p>
            </div>

           {/* Column 2: Quick Links */}
            <div>
              <h4 style={{ color: 'white', fontSize: '1.2rem', margin: '0 0 20px 0', fontWeight: '600' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li><Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Home / Store</Link></li>
                <li><Link to="/upload-prescription" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Upload Prescription</Link></li>
                <li><Link to="/help" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Help Center & FAQ</Link></li>
                <li><Link to="/auth" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '500' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='#94a3b8'}>Pharmacist Portal</Link></li>
              </ul>
            </div>
            {/* Column 3: Contact Info */}
            <div>
              <h4 style={{ color: 'white', fontSize: '1.2rem', margin: '0 0 20px 0', fontWeight: '600' }}>Contact Us</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem', color: '#94a3b8' }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '1.2rem' }}>📍</span> University of Gujrat, Main Campus</p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '1.2rem' }}>📞</span> +92 300 1234567</p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '1.2rem' }}>✉️</span> support@curelink.com</p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ fontSize: '1.2rem' }}>⏰</span> Mon - Sat, 9:00 AM - 10:00 PM</p>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Banner */}
          <div style={{ textAlign: 'center', paddingTop: '30px', fontSize: '0.95rem', color: '#64748b' }}>
            <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} CureLink Pharmacy. All rights reserved.</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>BS Computer Science Final Year Project</p>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;