import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function MedicineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [medicine, setMedicine] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PERSISTENT STATES ---
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('wishlist') || '[]'));
  const [reviews, setReviews] = useState(() => JSON.parse(localStorage.getItem('medicine_reviews') || '{}'));
  
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('medicine_reviews', JSON.stringify(reviews)); }, [reviews]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    axios.get('http://localhost:8080/api/medicines')
      .then(response => {
        const foundMedicine = response.data.find(m => m.id === parseInt(id));
        setMedicine(foundMedicine);
        
        if (foundMedicine && foundMedicine.formula) {
          axios.get(`http://localhost:8080/api/medicines/alternatives?formula=${foundMedicine.formula}&excludeId=${foundMedicine.id}`)
            .then(altRes => setAlternatives(altRes.data))
            .catch(err => console.error(err));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching medicine", error);
        setLoading(false);
      });
  }, [id]);

  const cleanCategory = (cat) => {
    if (!cat) return 'General';
    const lower = cat.toLowerCase();
    if (lower.includes('fever') || lower.includes('pain') || lower.includes('headache')) return 'Pain Relief';
    if (lower.includes('cold') || lower.includes('flu') || lower.includes('cough') || lower.includes('allergy')) return 'Cold & Allergy';
    if (lower.includes('acid') || lower.includes('gastric') || lower.includes('ulcer')) return 'Digestion';
    if (lower.includes('infection') || lower.includes('bacterial')) return 'Antibiotics';
    if (lower.includes('vitamin') || lower.includes('calcium')) return 'Vitamins';
    if (lower.includes('fungal') || lower.includes('skin') || lower.includes('acne')) return 'Skin Care';
    return 'General Health'; 
  };

  const getMedicineImage = (med) => {
    const name = med.name.toLowerCase();
    const cat = med.category ? med.category.toLowerCase() : '';
    const mid = med.id || 1; 
    if (name.includes('panadol') || name.includes('paracetamol')) return 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500&q=80'; 
    if (name.includes('syrup') || name.includes('suspension')) return 'https://images.unsplash.com/photo-1584308666744-24d5e47854e4?w=500&q=80'; 
    const painImages = ['https://images.unsplash.com/photo-1584308666744-24d5e47854e4?w=500&q=80', 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&q=80'];
    if (cat.includes('pain') || cat.includes('fever')) return painImages[mid % painImages.length];
    return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80'; 
  };

  // --- NEW: SMART CLINICAL DATA GENERATOR ---
  // This automatically generates realistic medical points based on the product category!
  const getClinicalDetails = (med) => {
    const cat = med.category ? med.category.toLowerCase() : '';
    let benefits = ["Provides fast and effective relief", "Clinically proven formula", "Trusted by healthcare professionals"];
    let howItWorks = "The active ingredients work by targeting the affected area to provide rapid relief and restore normal bodily functions.";
    let directions = "Take exactly as directed by your physician. Do not exceed the recommended dosage.";
    let precautions = "Keep out of reach of children. If you are pregnant, nursing, or have a medical condition, consult a doctor before use.";
    let storage = "Store below 30°C in a cool, dry place. Protect from direct sunlight and moisture.";

    if (cat.includes('pain') || cat.includes('fever') || cat.includes('headache')) {
      benefits = ["Fast-acting pain relief within 30 minutes", "Reduces fever quickly", "Gentle on the stomach when taken as directed"];
      howItWorks = "It works by blocking the production of certain chemical messengers in the brain that cause pain and inflammation.";
      directions = "Take 1-2 tablets every 4 to 6 hours as needed. Do not take more than 8 tablets in 24 hours.";
    } else if (cat.includes('cold') || cat.includes('allergy') || cat.includes('flu')) {
      benefits = ["Relieves sneezing and runny nose", "Clears severe nasal congestion", "Non-drowsy formulation (check label)"];
      howItWorks = "Acts as an antihistamine or decongestant to block allergic reactions and reduce swelling in nasal passages.";
      directions = "Take 1 dose daily with water. Best taken in the evening if it causes mild drowsiness.";
    } else if (cat.includes('antibiotic') || cat.includes('infection')) {
      benefits = ["Fights bacterial infections effectively", "Broad-spectrum bacterial coverage", "Helps prevent infection spread"];
      howItWorks = "Works by killing bacteria or preventing them from reproducing and growing in your body.";
      directions = "Complete the entire course of medication even if you feel better. Take with food to avoid stomach upset.";
      precautions = "Do not skip doses. Not effective for viral infections like the common cold. May cause mild nausea.";
    } else if (cat.includes('skin') || cat.includes('cream')) {
      benefits = ["Soothes skin irritation instantly", "Promotes rapid skin healing", "Dermatologist tested and approved"];
      howItWorks = "Penetrates the skin barrier to deliver active anti-inflammatory and healing agents directly to the affected tissue.";
      directions = "Wash and dry the affected area. Apply a thin layer 2-3 times daily and rub in gently.";
      precautions = "For external use only. Avoid contact with eyes. Discontinue use if severe rash or irritation occurs.";
      storage = "Store tightly closed at room temperature. Do not freeze.";
    } else if (cat.includes('digestion') || cat.includes('acid')) {
      benefits = ["Neutralizes stomach acid", "Relieves heartburn and indigestion", "Fast-acting cooling effect"];
      howItWorks = "Directly neutralizes excess stomach acid on contact and coats the stomach lining to prevent acid reflux.";
      directions = "Take 1-2 spoonfuls or tablets after meals and at bedtime, or as needed for relief.";
    }

    return { benefits, howItWorks, directions, precautions, storage };
  };

  const addToCart = () => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
    toast.success(`${medicine.name} added to cart!`);
    window.dispatchEvent(new Event('openCartDrawer'));
  };

  const toggleWishlist = () => {
    const isSaved = wishlist.some(item => item.id === medicine.id);
    if (isSaved) {
      setWishlist(wishlist.filter(item => item.id !== medicine.id));
      toast.success("Removed from Wishlist", { icon: '💔' });
    } else {
      setWishlist([...wishlist, medicine]);
      toast.success("Saved to Wishlist", { icon: '❤️' });
    }
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return toast.error("Please write a comment.");
    const review = { id: Date.now(), author: user?.name || 'Anonymous User', rating: newReviewRating, text: newReviewText, date: new Date().toLocaleDateString() };
    setReviews(prev => ({ ...prev, [medicine.id]: [review, ...(prev[medicine.id] || [])] }));
    setNewReviewText(''); setNewReviewRating(5);
    toast.success("Review submitted!", { icon: '⭐' });
  };

  const medReviews = reviews[id] || [];
  const avgRating = medReviews.length > 0 ? (medReviews.reduce((acc, rev) => acc + rev.rating, 0) / medReviews.length).toFixed(1) : 0;

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading medicine details...</div>;
  if (!medicine) return <div style={{ padding: '100px', textAlign: 'center', fontSize: '1.2rem', color: 'var(--danger)' }}>Medicine not found.</div>;

  const clinicalDetails = getClinicalDetails(medicine);

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 75px)', backgroundColor: 'var(--bg-body)' }}>
      
      {/* Breadcrumbs */}
      <div style={{ marginBottom: '20px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--text-main)'} onMouseOut={e=>e.target.style.color='var(--primary)'}>Home</Link> &nbsp; / &nbsp; 
        <Link to="/medicines" style={{ color: 'var(--primary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--text-main)'} onMouseOut={e=>e.target.style.color='var(--primary)'}>Store</Link> &nbsp; / &nbsp; 
        <span style={{ color: 'var(--text-main)' }}>{medicine.name}</span>
      </div>

      {/* --- TOP SECTION: Hero Product Summary Card --- */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '30px', boxShadow: 'var(--shadow-md)' }}>
        
        <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', borderRight: '1px solid var(--border)' }}>
          <button onClick={toggleWishlist} style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.4rem', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} title="Add to Wishlist">
            {wishlist.some(w => w.id === medicine.id) ? '❤️' : '🤍'}
          </button>
          <img src={medicine.image_url || getMedicineImage(medicine)} alt={medicine.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} />
        </div>

        <div style={{ flex: '1.5 1 500px', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <span style={{ backgroundColor: '#e0f2fe', color: 'var(--primary)', padding: '6px 14px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '700' }}>{cleanCategory(medicine.category)}</span>
            <div style={{ color: '#eab308', fontSize: '1.1rem', fontWeight: '600' }}>
              {avgRating > 0 ? `★ ${avgRating} (${medReviews.length} reviews)` : <span style={{ color: 'var(--text-muted)' }}>No reviews yet</span>}
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', borderLeft: '1px solid var(--border)', paddingLeft: '15px' }}>Batch: {medicine.batch_number}</span>
          </div>
          
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-main)', margin: '0 0 15px 0', lineHeight: '1.1', letterSpacing: '-0.02em' }}>{medicine.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--success)', letterSpacing: '-0.02em' }}>Rs. {medicine.price}</div>
            <div style={{ display: 'flex', alignItems: 'center', color: medicine.stock_quantity > 0 ? '#15803d' : 'var(--danger)', backgroundColor: medicine.stock_quantity > 0 ? '#dcfce7' : 'var(--danger-bg)', padding: '8px 16px', borderRadius: '50px', fontWeight: '700', fontSize: '0.95rem' }}>
              {medicine.stock_quantity > 0 ? `✓ In Stock (${medicine.stock_quantity})` : '✗ Out of Stock'}
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '35px' }}>
            {medicine.description || "A highly effective, medically approved treatment option sourced from verified pharmaceutical manufacturers."}
          </p>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={addToCart} disabled={medicine.stock_quantity <= 0} className="btn-primary" style={{ flex: 2, padding: '18px', fontSize: '1.15rem', borderRadius: '50px', backgroundColor: medicine.stock_quantity <= 0 ? 'var(--text-muted)' : 'var(--primary)', cursor: medicine.stock_quantity <= 0 ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow-md)' }}>
              {medicine.stock_quantity > 0 ? '🛒 Add to Cart' : 'Currently Unavailable'}
            </button>
            <button onClick={() => navigate('/medicines')} style={{ flex: 1, padding: '18px', fontSize: '1.05rem', backgroundColor: 'transparent', color: 'var(--text-main)', border: '2px solid var(--border)', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }} onMouseOver={e=>{e.target.style.borderColor='var(--primary)'; e.target.style.color='var(--primary)'}} onMouseOut={e=>{e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-main)'}}>
              Back to Store
            </button>
          </div>
        </div>
      </div>

      {/* --- NEW: COMPREHENSIVE CLINICAL DETAILS SECTION --- */}
      <div className="card animate-slide-up" style={{ padding: '40px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '40px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ margin: '0 0 30px 0', color: 'var(--text-main)', fontSize: '1.6rem', borderBottom: '2px solid var(--bg-body)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📑 Comprehensive Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          
          {/* Key Benefits */}
          <div>
            <h4 style={{ color: 'var(--primary)', fontSize: '1.15rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>✨ Key Benefits</h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
              {clinicalDetails.benefits.map((benefit, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{benefit}</li>
              ))}
            </ul>
          </div>

          {/* How It Works */}
          <div>
            <h4 style={{ color: 'var(--primary)', fontSize: '1.15rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚙️ How It Works</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
              {clinicalDetails.howItWorks}
            </p>
          </div>

          {/* Directions */}
          <div>
            <h4 style={{ color: 'var(--success)', fontSize: '1.15rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>📋 Directions for Use</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
              {clinicalDetails.directions}
            </p>
          </div>

          {/* Precautions */}
          <div>
            <h4 style={{ color: 'var(--danger)', fontSize: '1.15rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚠️ Safety Precautions</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
              {clinicalDetails.precautions}
            </p>
          </div>

          {/* Storage */}
          <div>
            <h4 style={{ color: '#8b5cf6', fontSize: '1.15rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>🌡️ Storage Instructions</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
              {clinicalDetails.storage}
            </p>
          </div>

        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
        <div className="card" style={{ width: '100%', padding: '40px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 25px 0', color: 'var(--text-main)', fontSize: '1.6rem', borderBottom: '2px solid var(--bg-body)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⭐ Customer Reviews
          </h3>
          
          <form onSubmit={submitReview} style={{ backgroundColor: 'var(--bg-body)', padding: '25px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '30px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Write a Review</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} onClick={() => setNewReviewRating(star)} style={{ cursor: 'pointer', fontSize: '2rem', color: star <= newReviewRating ? '#eab308' : 'var(--border)', transition: 'color 0.2s' }}>★</span>
              ))}
            </div>
            <textarea value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} placeholder="How was your experience?" required style={{ width: '100%', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '100px', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-surface)', fontSize: '1rem', resize: 'vertical', marginBottom: '15px' }}></textarea>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontSize: '1rem', borderRadius: '50px' }}>Submit Review</button>
          </form>

          {medReviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '30px 0' }}>No reviews yet. Be the first to share your experience!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {medReviews.map(rev => (
                <div key={rev.id} style={{ backgroundColor: 'var(--bg-body)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem' }}>{rev.author}</strong>
                    <span style={{ color: '#eab308', letterSpacing: '2px', fontSize: '1.2rem' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>{rev.text}</p>
                  <small style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{rev.date}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- HORIZONTAL ALTERNATIVES AT BOTTOM --- */}
      {alternatives.length > 0 && (
        <div style={{ padding: '0 20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            💡 Generic Alternatives
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Save money with these identical active formulas: <strong>{medicine.formula}</strong>
          </p>
          
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'thin' }}>
            {alternatives.map(alt => (
              <div 
                key={alt.id} 
                onClick={() => navigate(`/medicine/${alt.id}`)} 
                className="card" 
                style={{ minWidth: '220px', width: '220px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', flexShrink: 0 }} 
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}} 
                onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}
              >
                {/* Image Box */}
                <div style={{ width: '100%', height: '150px', backgroundColor: 'white', padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                   <img src={alt.image_url || getMedicineImage(alt)} alt={alt.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                
                {/* Text Box */}
                <div style={{ padding: '15px', textAlign: 'center', backgroundColor: 'var(--bg-body)' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={alt.name}>
                    {alt.name}
                  </h4>
                  <div style={{ color: 'var(--success)', fontWeight: '800', fontSize: '1.1rem', marginBottom: '12px' }}>
                    Rs. {alt.price}
                  </div>
                  <button style={{ width: '100%', padding: '8px', backgroundColor: '#f0f9ff', color: 'var(--primary)', border: '1px solid #bae6fd', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#e0f2fe'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#f0f9ff'}>
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        
    </div>
  );
}

export default MedicineDetailPage;