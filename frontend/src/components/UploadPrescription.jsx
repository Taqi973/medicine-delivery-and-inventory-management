import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function UploadPrescription() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if a regular user (or admin) is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a preview URL so the user can see what they are uploading
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append('prescription', file);
    // Append customer details from local storage so the backend knows who uploaded it
    formData.append('customer_name', user.name || 'User');
    formData.append('phone', user.phone || 'N/A');
    formData.append('address', user.address || 'N/A');

    setIsSubmitting(true);
    const loadingToast = toast.loading("Securely uploading prescription...");

    try {
      // Assuming this is your existing backend endpoint for prescriptions
      await axios.post('http://localhost:8080/api/prescriptions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.dismiss(loadingToast);
      toast.success("Prescription uploaded successfully! Our pharmacists will review it shortly.", { duration: 5000 });
      setFile(null);
      setPreview(null);
      
      // Optional: Redirect them back to the store after a successful upload
      setTimeout(() => navigate('/medicines'), 2000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to upload. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-body)', minHeight: 'calc(100vh - 80px)', paddingBottom: '60px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ backgroundColor: 'var(--primary)', padding: '60px 20px', textAlign: 'center', color: 'white', backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #0f172a 100%)' }}>
        <h1 style={{ fontSize: '2.8rem', margin: '0 0 15px 0', fontWeight: '800', letterSpacing: '-0.02em' }}>Upload Your Prescription</h1>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', color: '#cbd5e1', lineHeight: '1.6' }}>
          Have a valid prescription from your doctor? Upload it securely here. Our licensed pharmacists will review it and prepare your order.
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* IF USER IS NOT LOGGED IN */}
        {!isLoggedIn ? (
          <div className="card" style={{ padding: '50px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '15px' }}>Authentication Required</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1.1rem' }}>
              For your privacy and security, you must be logged into your CureLink account to upload medical documents.
            </p>
            <Link to="/auth" className="btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-block' }}>
              Sign In or Register
            </Link>
          </div>
        ) : (
          /* IF USER IS LOGGED IN */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            
            {/* INSTRUCTIONS PANEL */}
            <div className="card" style={{ padding: '30px', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📋 Upload Guidelines
              </h3>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '0.95rem' }}>
                <li style={{ marginBottom: '10px' }}>Ensure the image is well-lit and not blurry.</li>
                <li style={{ marginBottom: '10px' }}>The patient's name and doctor's signature must be clearly visible.</li>
                <li style={{ marginBottom: '10px' }}>Date of prescription must not be older than 6 months.</li>
                <li style={{ marginBottom: '10px' }}>Accepted formats: JPG, PNG, PDF.</li>
              </ul>
              <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#166534', fontSize: '1rem' }}>Privacy Guaranteed</h4>
                <p style={{ margin: 0, color: '#15803d', fontSize: '0.85rem' }}>Your medical data is encrypted and only visible to our licensed pharmacists.</p>
              </div>
            </div>

            {/* UPLOAD FORM PANEL */}
            <div className="card" style={{ padding: '30px', backgroundColor: 'var(--bg-surface)' }}>
              <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--primary)', borderRadius: '12px', padding: '30px', cursor: 'pointer', backgroundColor: '#f0f9ff', transition: 'all 0.2s', marginBottom: '20px' }}>
                  {!preview ? (
                    <>
                      <span style={{ fontSize: '3rem', marginBottom: '10px' }}>📄</span>
                      <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.1rem' }}>Click to select an image</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>or drag and drop here</span>
                    </>
                  ) : (
                    <img src={preview} alt="Prescription Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'contain' }} />
                  )}
                  <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>

                {preview && (
                  <button type="button" onClick={() => { setFile(null); setPreview(null); }} style={{ backgroundColor: 'transparent', color: 'var(--danger)', border: 'none', marginBottom: '15px', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                    Remove Image
                  </button>
                )}

                <button type="submit" disabled={isSubmitting || !file} className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', backgroundColor: (!file || isSubmitting) ? 'var(--text-muted)' : 'var(--primary)', cursor: (!file || isSubmitting) ? 'not-allowed' : 'pointer', marginTop: 'auto' }}>
                  {isSubmitting ? 'Uploading...' : 'Submit Prescription'}
                </button>
              </form>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadPrescription;