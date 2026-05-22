import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  // --- NEW: FETCH WISHLIST FROM LOCAL STORAGE ---
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to view your dashboard.");
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:8080/api/orders')
        .then(response => {
          const myOrders = response.data.filter(
            order => order.customer_name === user.name || order.phone === user.phone
          );
          setOrders(myOrders.sort((a, b) => b.id - a.id));
        })
        .catch(error => console.error("Error fetching user orders:", error));
    }
  }, [user]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify(user));
    toast.success("Profile settings updated successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out securely.");
    navigate('/');
    window.location.reload();
  };

  // --- NEW: REMOVE FROM WISHLIST ---
  const removeFromWishlist = (id) => {
    const updatedWishlist = wishlist.filter(item => item.id !== id);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    toast.success("Removed from Wishlist", { icon: '💔' });
  };

  if (!user) return null; 

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-body)', minHeight: 'calc(100vh - 80px)', paddingBottom: '60px' }}>
      
      {/* --- DASHBOARD HEADER --- */}
      <div style={{ backgroundColor: 'var(--primary)', padding: '50px 20px', color: 'white', backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #0f172a 100%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--bg-surface)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.5rem', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Welcome back, {user.name.split(' ')[0]}!</h1>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '1.1rem' }}>Manage your orders, profile, and wishlist.</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '30px auto 0', padding: '0 20px', display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* --- SIDEBAR NAVIGATION --- */}
        <div className="card" style={{ flex: '1 1 250px', padding: '20px', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{ padding: '12px 16px', textAlign: 'left', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '600', backgroundColor: activeTab === 'orders' ? '#f0f9ff' : 'transparent', color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-main)', transition: 'all 0.2s' }}
            >
              📦 My Orders
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')}
              style={{ padding: '12px 16px', textAlign: 'left', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '600', backgroundColor: activeTab === 'wishlist' ? '#fef2f2' : 'transparent', color: activeTab === 'wishlist' ? 'var(--danger)' : 'var(--text-main)', transition: 'all 0.2s' }}
            >
              ❤️ My Wishlist ({wishlist.length})
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{ padding: '12px 16px', textAlign: 'left', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '600', backgroundColor: activeTab === 'profile' ? '#f0f9ff' : 'transparent', color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-main)', transition: 'all 0.2s' }}
            >
              ⚙️ Profile Settings
            </button>
            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '10px 0' }}></div>
            <button 
              onClick={handleLogout}
              style={{ padding: '12px 16px', textAlign: 'left', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '600', backgroundColor: 'transparent', color: 'var(--danger)', transition: 'background-color 0.2s' }}
              onMouseOver={e=>e.target.style.backgroundColor='var(--danger-bg)'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}
            >
              🚪 Log Out
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div style={{ flex: '2 1 600px' }}>
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="card animate-pop-in" style={{ padding: '30px', backgroundColor: 'var(--bg-surface)' }}>
              <h2 style={{ margin: '0 0 25px 0', color: 'var(--text-main)', fontSize: '1.5rem', borderBottom: '2px solid var(--bg-body)', paddingBottom: '10px' }}>Order History</h2>
              
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.5 }}>🛍️</div>
                  <p style={{ fontSize: '1.1rem' }}>You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/medicines')} className="btn-primary" style={{ marginTop: '15px' }}>Start Shopping</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', transition: 'box-shadow 0.2s' }} onMouseOver={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'} onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>ORDER ID:</span>
                          <strong style={{ marginLeft: '8px', color: 'var(--text-main)', fontSize: '1.1rem' }}>#{order.id}</strong>
                        </div>
                        <span style={{ padding: '6px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700', backgroundColor: order.status === 'Delivered' ? 'var(--success-bg)' : '#fef08a', color: order.status === 'Delivered' ? '#166534' : '#854d0e', border: `1px solid ${order.status === 'Delivered' ? '#bbf7d0' : '#fde047'}` }}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div style={{ backgroundColor: 'var(--bg-body)', padding: '15px', borderRadius: 'var(--radius-sm)', marginBottom: '15px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        <strong>Items:</strong> <span style={{ color: 'var(--primary)' }}>
                          {Array.isArray(order.items) ? order.items.map(i => `${i.quantity || 1}x ${i.name || 'Item'}`).join(', ') : (typeof order.items === 'object' && order.items !== null ? JSON.stringify(order.items) : order.items)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Amount:</span>
                          <div style={{ fontWeight: '800', color: 'var(--success)', fontSize: '1.2rem' }}>Rs. {order.total_amount}</div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                          {order.payment_method === 'COD' ? '🚚 Cash on Delivery' : `💳 ${order.payment_method}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- NEW: WISHLIST TAB --- */}
          {activeTab === 'wishlist' && (
            <div className="card animate-pop-in" style={{ padding: '30px', backgroundColor: 'var(--bg-surface)' }}>
              <h2 style={{ margin: '0 0 25px 0', color: 'var(--text-main)', fontSize: '1.5rem', borderBottom: '2px solid var(--bg-body)', paddingBottom: '10px' }}>My Saved Medicines</h2>
              
              {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px', opacity: 0.5 }}>❤️</div>
                  <p style={{ fontSize: '1.1rem' }}>Your wishlist is empty.</p>
                  <button onClick={() => navigate('/medicines')} className="btn-primary" style={{ marginTop: '15px' }}>Explore the Store</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {wishlist.map(item => (
                    <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{ width: '100%', height: '140px', backgroundColor: 'var(--bg-body)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px', position: 'relative' }}>
                        {/* Remove from Wishlist Button */}
                        <button 
                          onClick={() => removeFromWishlist(item.id)}
                          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)', fontSize: '1.2rem', boxShadow: 'var(--shadow-sm)' }}
                          title="Remove from Wishlist"
                        >
                          ✖
                        </button>
                        <img src={item.image_url || 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80'} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '1rem', lineHeight: '1.2' }}>{item.name}</h4>
                        <span style={{ color: 'var(--success)', fontWeight: '800', fontSize: '1.1rem', marginTop: 'auto', marginBottom: '15px' }}>Rs. {item.price}</span>
                        <Link to="/medicines" className="btn-primary" style={{ textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', padding: '8px' }}>
                          View in Store
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="card animate-pop-in" style={{ padding: '30px', backgroundColor: 'var(--bg-surface)' }}>
              <h2 style={{ margin: '0 0 25px 0', color: 'var(--text-main)', fontSize: '1.5rem', borderBottom: '2px solid var(--bg-body)', paddingBottom: '10px' }}>Profile Settings</h2>
              
              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '8px', fontSize: '0.95rem' }}>Full Name</label>
                  <input type="text" value={user.name || ''} onChange={(e) => setUser({...user, name: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '8px', fontSize: '0.95rem' }}>Email Address</label>
                  <input type="email" value={user.email || ''} disabled style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: '#e2e8f0', color: '#64748b', cursor: 'not-allowed', fontSize: '1rem' }} title="Email cannot be changed" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '8px', fontSize: '0.95rem' }}>Phone Number</label>
                  <input type="tel" value={user.phone || ''} onChange={(e) => setUser({...user, phone: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: '600', marginBottom: '8px', fontSize: '0.95rem' }}>Default Delivery Address</label>
                  <textarea value={user.address || ''} onChange={(e) => setUser({...user, address: e.target.value})} required style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '100px', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '1rem', resize: 'vertical' }} />
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>This address will be auto-filled during checkout.</p>
                </div>
                
                <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', marginTop: '10px' }}>💾 Save Changes</button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;