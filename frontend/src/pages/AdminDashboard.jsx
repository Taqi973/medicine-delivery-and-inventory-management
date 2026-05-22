import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]); 
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [editingId, setEditingId] = useState(null); 
  
  const [formData, setFormData] = useState({
    name: '', category: '', description: '', price: '', stock_quantity: '', batch_number: '', expiry_date: '', formula: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; 

  useEffect(() => {
    fetchInventory();
    fetchOrders(); 
  }, []);

  const fetchInventory = () => {
    axios.get('http://localhost:8080/api/medicines')
      .then(response => setMedicines(response.data))
      .catch(error => console.error("Error fetching inventory", error));
  };

  const fetchOrders = () => {
    axios.get('http://localhost:8080/api/orders')
      .then(response => setOrders(response.data))
      .catch(error => console.error("Error fetching orders", error));
  };

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const totalOrders = orders.length;
  const lowStockCount = medicines.filter(med => med.stock_quantity < 50).length;

  const filteredMedicines = medicines.filter(med => 
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    med.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.formula?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedicines = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
  axios.get('http://localhost:8080/api/prescriptions')
    .then(response => setPrescriptions(response.data))
    .catch(error => console.error("Error fetching prescriptions:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const loadingToast = toast.loading("Updating medicine...");
      axios.put(`http://localhost:8080/api/medicines/${editingId}`, formData)
        .then(response => {
          toast.dismiss(loadingToast);
          toast.success("Medicine updated successfully!");
          fetchInventory();
          resetForm(); 
        })
        .catch(error => {
          toast.dismiss(loadingToast);
          toast.error("Failed to update medicine.");
        });
    } else {
      const loadingToast = toast.loading("Adding medicine...");
      axios.post('http://localhost:8080/api/medicines', formData)
        .then(response => {
          toast.dismiss(loadingToast);
          toast.success("Medicine added successfully!");
          fetchInventory();
          resetForm();
        })
        .catch(error => {
          toast.dismiss(loadingToast);
          toast.error("Failed to add medicine.");
        });
    }
  };

  const startEditing = (medicine) => {
    setEditingId(medicine.id);
    const formattedDate = medicine.expiry_date ? new Date(medicine.expiry_date).toISOString().split('T')[0] : '';
    
    setFormData({
      name: medicine.name, category: medicine.category, description: medicine.description || '',
      price: medicine.price, stock_quantity: medicine.stock_quantity, batch_number: medicine.batch_number, 
      expiry_date: formattedDate, formula: medicine.formula || '' 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', description: '', price: '', stock_quantity: '', batch_number: '', expiry_date: '', formula: '' });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    axios.put(`http://localhost:8080/api/orders/${orderId}/status`, { status: newStatus })
      .then(response => {
        toast.success(`Order #${orderId} marked as ${newStatus}!`);
        fetchOrders(); 
      })
      .catch(error => {
        toast.error("Failed to update status.");
      });
  };

  const deleteMedicine = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this medicine?")) {
      axios.delete(`http://localhost:8080/api/medicines/${id}`)
        .then(response => {
          toast.success("Medicine removed from inventory!");
          fetchInventory(); 
        })
        .catch(error => {
          if (error.response && error.response.status === 400) {
            const errorMsg = typeof error.response.data === 'object' ? (error.response.data.message || JSON.stringify(error.response.data)) : error.response.data;
            toast.error(errorMsg, { duration: 6000 });
          } else {
            toast.error("Failed to delete medicine.");
          }
        });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out securely.");
    window.location.href = '/';
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: 'var(--text-main)', margin: '0 0 5px 0', fontSize: '2rem', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage inventory, orders, and prescriptions.</p>
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e=>e.target.style.backgroundColor='#dc2626'} onMouseOut={e=>e.target.style.backgroundColor='var(--danger)'}>
          Log Out
        </button>
      </div>

      {/* --- BUSINESS ANALYTICS HUD --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ padding: '25px', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '8px', borderRadius: '8px' }}>💰</span>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Rs. {totalRevenue.toLocaleString()}
          </p>
        </div>
        
        <div className="card" style={{ padding: '25px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ backgroundColor: '#e0f2fe', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>📦</span>
            <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders Placed</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {totalOrders}
          </p>
        </div>
        
        <div className="card" style={{ padding: '25px', borderLeft: '4px solid var(--danger)', backgroundColor: lowStockCount > 0 ? 'var(--danger-bg)' : 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ backgroundColor: '#fecaca', color: 'var(--danger)', padding: '8px', borderRadius: '8px' }}>⚠️</span>
            <h3 style={{ margin: 0, color: lowStockCount > 0 ? 'var(--danger)' : 'var(--text-muted)', fontSize: '1.05rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock Items</h3>
          </div>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: lowStockCount > 0 ? '#991b1b' : 'var(--text-main)' }}>
            {lowStockCount} <span style={{ fontSize: '1rem', fontWeight: '600', color: lowStockCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>needs reorder</span>
          </p>
        </div>
      </div>

      {/* --- ORDER MANAGEMENT --- */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ color: 'var(--text-main)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          📋 Order Management
        </h2>
        <div className="card" style={{ overflowX: 'auto', minHeight: '300px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ width: '10%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ width: '25%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Customer Info</th>
                <th style={{ width: '25%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Items Ordered</th>
                <th style={{ width: '20%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Amount & Payment</th>
                <th style={{ width: '20%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase' }}>Status & Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--bg-body)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-main)' }}>#{order.id}</td>
                    <td style={{ padding: '16px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{order.customer_name}</strong><br/>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.address}</span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {Array.isArray(order.items) 
                        ? order.items.map(i => `${i.quantity || 1}x ${i.name || 'Item'}`).join(', ') 
                        : (typeof order.items === 'object' && order.items !== null 
                            ? JSON.stringify(order.items) 
                            : order.items)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '800', color: 'var(--success)', fontSize: '1.1rem', marginBottom: '8px' }}>Rs. {order.total_amount}</div>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700', backgroundColor: order.payment_method === 'COD' ? '#f1f5f9' : '#e0e7ff', color: order.payment_method === 'COD' ? '#475569' : '#4338ca', border: '1px solid var(--border)' }}>
                        {order.payment_method === 'COD' ? '🚚 COD' : `💳 ${order.payment_method}`}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700', backgroundColor: order.status === 'Delivered' ? 'var(--success-bg)' : '#fef08a', color: order.status === 'Delivered' ? '#166534' : '#854d0e', border: `1px solid ${order.status === 'Delivered' ? '#bbf7d0' : '#fde047'}` }}>
                          {order.status || 'Pending'}
                        </span>
                        {order.status !== 'Delivered' && (
                          <button onClick={() => updateOrderStatus(order.id, 'Delivered')} style={{ backgroundColor: 'var(--success)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e=>e.target.style.transform='translateY(-1px)'} onMouseOut={e=>e.target.style.transform='translateY(0)'}>✓ Mark Delivered</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NEW: PRESCRIPTIONS SECTION --- */}
      <div style={{ marginBottom: '50px' }}>
        <h2 style={{ color: 'var(--text-main)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>📄 Pending Prescriptions</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {prescriptions.map(rx => (
            <div key={rx.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '220px', backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                <img 
                  src={`http://localhost:8080${rx.file_path}`} 
                  alt="Prescription" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&q=80'; e.target.style.opacity = '0.5' }} 
                />
              </div>
              
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ backgroundColor: 'var(--bg-body)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', border: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '1rem' }}>👤 {rx.customer_name}</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>📞 {rx.phone}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>📍 {rx.address}</p>
                </div>

                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Uploaded: <strong style={{color: 'var(--text-main)'}}>{new Date(rx.upload_date).toLocaleDateString()}</strong>
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ 
                    backgroundColor: rx.status === 'Pending' ? '#fef08a' : rx.status === 'Reviewed' ? 'var(--success-bg)' : 'var(--danger-bg)', 
                    color: rx.status === 'Pending' ? '#854d0e' : rx.status === 'Reviewed' ? '#166534' : 'var(--danger)', 
                    padding: '6px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700', border: `1px solid ${rx.status === 'Pending' ? '#fde047' : rx.status === 'Reviewed' ? '#bbf7d0' : '#fecaca'}` 
                  }}>
                    {rx.status}
                  </span>
                  
                  {rx.status === 'Pending' && (
                    <button 
                      onClick={() => {
                        axios.put(`http://localhost:8080/api/prescriptions/${rx.id}/status`, { status: 'Reviewed' })
                          .then(() => {
                            toast.success("Marked as Reviewed");
                            setPrescriptions(prescriptions.map(p => p.id === rx.id ? {...p, status: 'Reviewed'} : p));
                          });
                      }}
                      style={{ backgroundColor: 'var(--success)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'transform 0.2s', boxShadow: 'var(--shadow-sm)' }}
                      onMouseOver={e=>e.target.style.transform='translateY(-1px)'} onMouseOut={e=>e.target.style.transform='translateY(0)'}
                    >
                      Mark Reviewed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {prescriptions.length === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px', opacity: '0.5' }}>📝</div>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>No prescriptions have been uploaded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD / EDIT FORM --- */}
      <div className="card animate-slide-up" style={{ padding: '30px', marginBottom: '50px', border: editingId ? '2px solid var(--secondary)' : '1px solid var(--border)', backgroundColor: editingId ? '#f0fdfa' : 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: editingId ? 'var(--secondary)' : 'var(--text-main)', fontSize: '1.4rem' }}>
            {editingId ? '✏️ Edit Existing Medicine' : '📦 Add New Medicine to Stock'}
          </h3>
          {editingId && (
            <button type="button" onClick={resetForm} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }}>Cancel Edit</button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <input type="text" placeholder="Medicine Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '0.95rem' }} />
          <input type="text" placeholder="Category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '0.95rem' }} />
          <input type="number" placeholder="Price (Rs)" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '0.95rem' }} />
          <input type="number" placeholder="Stock Quantity" required value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '0.95rem' }} />
          <input type="text" placeholder="Batch Number" required value={formData.batch_number} onChange={e => setFormData({...formData, batch_number: e.target.value})} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '0.95rem' }} />
          <input type="date" required value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '0.95rem', color: formData.expiry_date ? 'var(--text-main)' : 'var(--text-muted)' }} />
          
          <input type="text" placeholder="Active Formula (e.g., Paracetamol) *Required for Alternatives*" required value={formData.formula} onChange={e => setFormData({...formData, formula: e.target.value})} style={{ padding: '14px', border: '2px dashed var(--primary)', borderRadius: 'var(--radius-sm)', gridColumn: '1 / -1', outlineColor: 'var(--primary)', backgroundColor: '#f0f9ff', fontSize: '0.95rem' }} />

          <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', padding: '16px', fontSize: '1.1rem', backgroundColor: editingId ? 'var(--secondary)' : 'var(--text-main)', marginTop: '10px' }}>
            {editingId ? '💾 Save Changes' : '+ Add to Inventory'}
          </button>
        </form>
      </div>

      {/* --- INVENTORY TABLE WITH SEARCH (THE FIX IS HERE) --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          💊 Current Stock <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({filteredMedicines.length} items)</span>
        </h2>
        <input type="text" placeholder="🔍 Search by name, category, formula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', maxWidth: '400px', padding: '12px 20px', borderRadius: '50px', border: '1px solid var(--border)', outlineColor: 'var(--primary)', boxShadow: 'var(--shadow-sm)', fontSize: '0.95rem' }} />
      </div>

      {/* FIX: Added minHeight to the container and strict table layouts */}
      <div className="card" style={{ overflowX: 'auto', marginBottom: '30px', minHeight: '600px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-body)' }}>
              {/* FIX: Anchored widths on all columns to stop jumping */}
              <th style={{ width: '10%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Batch</th>
              <th style={{ width: '20%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Name</th>
              <th style={{ width: '15%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Category</th>
              <th style={{ width: '15%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Formula</th>
              <th style={{ width: '15%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Price</th>
              <th style={{ width: '10%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Stock</th>
              <th style={{ width: '15%', padding: '16px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentMedicines.length === 0 ? (
               <tr><td colSpan="7" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No items found matching your search.</td></tr>
            ) : (
              currentMedicines.map((med) => (
                <tr key={med.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='var(--bg-body)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', wordWrap: 'break-word' }}>{med.batch_number}</td>
                  <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-main)', wordWrap: 'break-word' }}>{med.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-main)', wordWrap: 'break-word' }}>{med.category}</td>
                  
                  <td style={{ padding: '16px', wordWrap: 'break-word' }}>
                    <span style={{ backgroundColor: '#e0f2fe', color: 'var(--primary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' }}>
                      {med.formula || 'General'}
                    </span>
                  </td>

                  <td style={{ padding: '16px', color: 'var(--success)', fontWeight: '800' }}>Rs. {med.price}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ color: med.stock_quantity < 50 ? 'var(--danger)' : 'var(--text-main)', fontWeight: med.stock_quantity < 50 ? '800' : '500', display: 'inline-block', backgroundColor: med.stock_quantity < 50 ? 'var(--danger-bg)' : 'transparent', padding: med.stock_quantity < 50 ? '2px 8px' : '0', borderRadius: '4px' }}>
                      {med.stock_quantity} units
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button onClick={() => startEditing(med)} style={{ backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', transition: 'all 0.2s' }} onMouseOver={e=>e.target.style.backgroundColor='#fef08a'} onMouseOut={e=>e.target.style.backgroundColor='#fef9c3'}>Edit</button>
                      <button onClick={() => deleteMedicine(med.id)} style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', transition: 'all 0.2s' }} onMouseOver={e=>e.target.style.backgroundColor='#fca5a5'} onMouseOut={e=>e.target.style.backgroundColor='var(--danger-bg)'}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', backgroundColor: currentPage === 1 ? 'var(--bg-body)' : 'var(--bg-surface)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)', transition: 'all 0.2s' }}>← Previous</button>
          <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', backgroundColor: currentPage === totalPages ? 'var(--bg-body)' : 'var(--bg-surface)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)', transition: 'all 0.2s' }}>Next →</button>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;