import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate(); // Tool to redirect the user after login

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post('http://localhost:8080/api/login', credentials)
      .then(response => {
        // 1. Show success message
        toast.success("Welcome back, Admin!");
        // 2. Save the VIP pass (token) into the browser's local storage
        localStorage.setItem('adminToken', response.data.token);
        // 3. Teleport the user directly into the dashboard
        navigate('/admin');
      })
      .catch(error => {
        toast.error("Invalid username or password!");
        setCredentials({ ...credentials, password: '' }); // Clear the password field
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#0f172a', margin: '0 0 10px 0' }}>Admin Access</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Please enter your credentials to manage CURELINK Pharmacy.</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Username</label>
            <input 
              type="text" required 
              value={credentials.username} onChange={e => setCredentials({...credentials, username: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Password</label>
            <input 
              type="password" required 
              value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
            />
          </div>
          
          <button type="submit" style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' }}>
            Secure Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;