import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function CustomerStore() {
  const navigate = useNavigate();
  
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All'); 
  const [isCheckout, setIsCheckout] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [maxPrice, setMaxPrice] = useState(5000); 
  const [sortBy, setSortBy] = useState('default');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);

  const heroImages = [
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&q=80', 
    'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1200&q=80', 
    'https://mediq.com.pk/wp-content/uploads/2025/09/Image-13.jpg', 
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&q=80'  
  ];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const nextHeroImage = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevHeroImage = () => {
    setCurrentHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextHeroImage, 5000);
    return () => clearInterval(timer);
  }, []);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('medicine_reviews');
    return saved ? JSON.parse(saved) : {};
  });

  const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [customer, setCustomer] = useState({ 
    name: savedUser?.name || '', 
    phone: savedUser?.phone || '', 
    address: savedUser?.address || '', 
    paymentMethod: 'COD' 
  });
  
  const [walletNumber, setWalletNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; 

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('openCartDrawer', handleOpenCart);
    return () => window.removeEventListener('openCartDrawer', handleOpenCart);
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/api/medicines')
      .then(response => {
        setMedicines(response.data);
        if(response.data.length > 0) {
           const highestPrice = Math.max(...response.data.map(m => m.price));
           setMaxPrice(Math.ceil(highestPrice / 100) * 100); 
        }
      })
      .catch(error => console.error("Error fetching medicines", error));
  }, []);

  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('medicine_reviews', JSON.stringify(reviews)); }, [reviews]);

  const getMedicineImage = (med) => {
    const name = med.name.toLowerCase();
    const cat = med.category ? med.category.toLowerCase() : '';
    const id = med.id || 1; 

    if (name.includes('panadol') || name.includes('paracetamol')) return 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500&q=80'; 
    if (name.includes('syrup') || name.includes('suspension')) return 'https://images.unsplash.com/photo-1584308666744-24d5e47854e4?w=500&q=80'; 
    if (name.includes('cream') || name.includes('gel') || name.includes('ointment')) return 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80'; 

    const painImages = ['https://images.unsplash.com/photo-1584308666744-24d5e47854e4?w=500&q=80', 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&q=80', 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=500&q=80'];
    const antiImages = ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&q=80', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&q=80'];
    const vitaminImages = ['https://images.unsplash.com/photo-1550572017-edb3fbf46b15?w=500&q=80', 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&q=80'];

    if (cat.includes('pain') || cat.includes('fever') || cat.includes('headache')) return painImages[id % painImages.length];
    if (cat.includes('antibiotic') || cat.includes('infection') || cat.includes('bacteria')) return antiImages[id % antiImages.length];
    if (cat.includes('vitamin') || cat.includes('supplement')) return vitaminImages[id % vitaminImages.length];
    if (cat.includes('digestion') || cat.includes('acidity') || cat.includes('gastric')) return 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&q=80'; 
    if (cat.includes('allergy') || cat.includes('cold') || cat.includes('flu')) return 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&q=80'; 

    return 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&q=80'; 
  };

  const cleanCategory = (cat) => {
    if (!cat) return 'General';
    const lower = cat.toLowerCase();
    if (lower.includes('fever') || lower.includes('pain') || lower.includes('headache')) return 'Pain Relief';
    if (lower.includes('cold') || lower.includes('flu') || lower.includes('cough') || lower.includes('allergy')) return 'Cold & Allergy';
    if (lower.includes('acid') || lower.includes('gastric') || lower.includes('ulcer')) return 'Digestion';
    if (lower.includes('fungal') || lower.includes('skin') || lower.includes('acne') || lower.includes('eczema')) return 'Skin Care';
    if (lower.includes('infection') || lower.includes('bacterial')) return 'Antibiotics';
    if (lower.includes('vitamin') || lower.includes('calcium') || lower.includes('iron')) return 'Vitamins';
    if (lower.includes('hair') || lower.includes('bald')) return 'Hair Care';
    if (lower.includes('nausea') || lower.includes('vomit')) return 'Anti-Nausea';
    return 'General Health'; 
  };

  const categories = ['All', ...new Set(medicines.map(med => cleanCategory(med.category)))];

  const categoryImages = {
    'All': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80',
    'Pain Relief': 'https://images.unsplash.com/photo-1584308666744-24d5e47854e4?w=500&q=80',
    'Cold & Allergy': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&q=80',
    'Digestion': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&q=80',
    'Skin Care': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80',
    'Antibiotics': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&q=80',
    'Vitamins': 'https://images.unsplash.com/photo-1550572017-edb3fbf46b15?w=500&q=80',
    'Hair Care': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&q=80',
    'General Health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&q=80',
  };

  let processedMedicines = medicines.filter(med => {
    const search = searchTerm.toLowerCase().trim();
    const safeName = med.name ? med.name.toLowerCase() : '';
    const safeOrigCategory = med.category ? med.category.toLowerCase() : '';
    const safeDesc = med.description ? med.description.toLowerCase() : '';
    const safeCleanCategory = cleanCategory(med.category).toLowerCase();
    const matchesSearch = search === '' || safeName.includes(search) || safeOrigCategory.includes(search) || safeCleanCategory.includes(search) || safeDesc.includes(search);
    
    const medCleanCategory = cleanCategory(med.category);
    const matchesCategory = selectedCategory === 'All' || medCleanCategory === selectedCategory;
    const matchesPrice = med.price <= maxPrice;
    const matchesStock = hideOutOfStock ? med.stock_quantity > 0 : true;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  if (sortBy === 'price-low') {
    processedMedicines.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    processedMedicines.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'a-z') {
    processedMedicines.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'z-a') {
    processedMedicines.sort((a, b) => b.name.localeCompare(a.name));
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedicines = processedMedicines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedMedicines.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, maxPrice, sortBy, hideOutOfStock]);

  const addToCart = (medicine, e) => {
    if (e) e.stopPropagation(); 
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item));
      toast.success(`Increased quantity!`);
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
      toast.success(`Added to cart!`);
    }
    setIsCartOpen(true);
  };

  const decreaseQuantity = (id) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem.quantity === 1) {
      removeFromCart(id); 
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    toast.error(`Removed from cart`);
  };

  const toggleWishlist = (medicine, e) => {
    if (e) e.stopPropagation();
    const isSaved = wishlist.some(item => item.id === medicine.id);
    if (isSaved) {
      setWishlist(wishlist.filter(item => item.id !== medicine.id));
      toast.success("Removed from Wishlist", { icon: '💔' });
    } else {
      setWishlist([...wishlist, medicine]);
      toast.success("Saved to Wishlist", { icon: '❤️' });
    }
  };

  const getAverageRating = (medicineId) => {
    const medReviews = reviews[medicineId] || [];
    if (medReviews.length === 0) return 0;
    const sum = medReviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / medReviews.length).toFixed(1);
  };

  // --- FREE DELIVERY THRESHOLD ---
  const FREE_DELIVERY_THRESHOLD = 2000;
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const progressPercentage = Math.min((cartTotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  const submitOrder = (e) => {
    e.preventDefault(); 
    const orderData = { customer_name: customer.name, phone: customer.phone, address: customer.address, payment_method: customer.paymentMethod, total_amount: cartTotal, cart_items: cart };
    const loadingToast = toast.loading(customer.paymentMethod === 'COD' ? "Placing your order..." : "Processing payment...");
    setTimeout(() => {
      axios.post('http://localhost:8080/api/orders', orderData)
        .then(response => {
          toast.dismiss(loadingToast); 
          toast.success(`Order Placed! Your Tracking ID is: ${response.data.orderId}`, { duration: 8000, style: { border: '2px solid var(--success)', padding: '16px', color: 'var(--text-main)', fontWeight: 'bold' } });
          setCart([]); setIsCheckout(false); setIsCartOpen(false); setCustomer({ name: '', phone: '', address: '', paymentMethod: 'COD' }); 
        })
        .catch(error => { toast.dismiss(loadingToast); toast.error("Failed to place order."); });
    }, 2000); 
  };

  const handleTrackOrder = (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Locating order...");
    axios.get(`http://localhost:8080/api/orders/${trackingId}`)
      .then(response => {
        toast.dismiss(loadingToast);
        setTrackingData(response.data);
      })
      .catch(error => {
        toast.dismiss(loadingToast);
        setTrackingData(null);
        if (error.response && error.response.status === 404) {
          toast.error("Order ID not found.");
        } else {
          toast.error("Error fetching tracking info.");
        }
      });
  };

  return (
    <div className="animate-fade-in" style={{ 
      padding: '30px 20px', 
      minHeight: '100vh',
      maxWidth: '100vw',
      overflowX: 'hidden',
      backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1.5px, transparent 1.5px)',
      backgroundSize: '24px 24px',
      backgroundColor: 'var(--bg-body)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={{ 
          textAlign: 'center', marginBottom: '30px', padding: '60px 40px', 
          borderRadius: 'var(--radius-lg)', position: 'relative', 
          backgroundColor: 'var(--bg-surface)', 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${heroImages[currentHeroIndex]})`, 
          backgroundSize: 'cover', backgroundPosition: 'center', 
          boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.2)',
          transition: 'background-image 0.5s ease-in-out' 
        }}>
          
          <button 
            onClick={prevHeroImage} 
            style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.2rem', cursor: 'pointer', zIndex: 5, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.4)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.2)'}
          >
            ❮
          </button>
          
          <button 
            onClick={nextHeroImage} 
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.2rem', cursor: 'pointer', zIndex: 5, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.4)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.2)'}
          >
            ❯
          </button>

          <button onClick={() => setShowTrackModal(true)} style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background-color 0.2s', zIndex: 10 }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}>
            📍 Track Order
          </button>

          <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '12px', marginTop: '0', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Your Health, <span style={{ color: '#bae6fd' }}>Delivered Fast.</span></h1>
          <p style={{ color: '#f8fafc', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>Shop thousands of authentic medicines with guaranteed fast delivery directly to your door.</p>
          <input type="text" placeholder="Search our pharmacy catalog (e.g. Panadol, Antibiotics)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', maxWidth: '650px', padding: '16px 24px', fontSize: '1rem', borderRadius: '50px', border: 'none', outline: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)' }} />
          
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
            {heroImages.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setCurrentHeroIndex(idx)} 
                style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: currentHeroIndex === idx ? 'white' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'background-color 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} 
              />
            ))}
          </div>
        </div>

        <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '15px' }}>Shop by Health Condition</h3>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '30px', scrollbarWidth: 'thin' }}>
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category;
            const bgImg = categoryImages[category] || categoryImages['General Health'];
            return (
              <div 
                key={index} 
                onClick={() => setSelectedCategory(category)}
                style={{ 
                  minWidth: '150px', height: '90px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  backgroundImage: `linear-gradient(${isSelected ? 'rgba(2, 132, 199, 0.75), rgba(2, 132, 199, 0.9)' : 'rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6)'}), url(${bgImg})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'flex-end', padding: '12px',
                  border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                  boxShadow: isSelected ? '0 0 0 2px rgba(2, 132, 199, 0.3)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                  flexShrink: 0
                }}
                onMouseOver={e => { if(!isSelected) e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseOut={e => { if(!isSelected) e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ color: 'white', fontWeight: '700', fontSize: '0.95rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {category}
                </span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          
          <div className="card" style={{ width: '240px', flexShrink: 0, padding: '20px 16px', position: 'sticky', top: '90px', zIndex: 10 }}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', borderBottom: '2px solid var(--bg-body)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>Filters</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outlineColor: 'var(--primary)', backgroundColor: 'var(--bg-body)', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <option value="default">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="a-z">Name: A to Z</option>
                <option value="z-a">Name: Z to A</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}><span>Max Price</span><span style={{ color: 'var(--primary)' }}>Rs. {maxPrice}</span></label>
              <input type="range" min="0" max={Math.max(5000, ...medicines.map(m=>m.price))} step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
            </div>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="inStockOnly" checked={hideOutOfStock} onChange={(e) => setHideOutOfStock(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
              <label htmlFor="inStockOnly" style={{ fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer', userSelect: 'none' }}>Hide out of stock</label>
            </div>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSortBy('default'); setHideOutOfStock(false); setMaxPrice(Math.max(...medicines.map(m=>m.price))); }} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-body)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', fontSize: '0.9rem' }} onMouseOver={e=>e.target.style.backgroundColor='#e2e8f0'} onMouseOut={e=>e.target.style.backgroundColor='var(--bg-body)'}>Clear All Filters</button>
          </div>

          <div style={{ flex: '1', minWidth: 0 }}> 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', padding: '0 5px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.95rem', backgroundColor: 'var(--bg-surface)', padding: '4px 12px', borderRadius: '50px', border: '1px solid var(--border)' }}>Showing {processedMedicines.length} results</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {currentMedicines.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🔍</span>
                  <p style={{ fontSize: '1.1rem', margin: 0 }}>No medicines found matching your filters.</p>
                  <button onClick={() => {setSearchTerm(''); setSelectedCategory('All'); setMaxPrice(10000); setHideOutOfStock(false);}} style={{ marginTop: '15px', color: 'var(--primary)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}>Clear filters</button>
                </div>
              ) : (
                currentMedicines.map((med) => {
                  const avgRating = getAverageRating(med.id);
                  return (
                  <div key={med.id} onClick={() => navigate(`/medicine/${med.id}`)} className="card animate-pop-in" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                    
                    <button onClick={(e) => toggleWishlist(med, e)} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', fontSize: '1rem', color: wishlist.some(w => w.id === med.id) ? '#ef4444' : 'var(--text-muted)' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} title="Save to Wishlist">
                      {wishlist.some(w => w.id === med.id) ? '❤️' : '🤍'}
                    </button>

                    <div style={{ width: '100%', height: '140px', backgroundColor: 'var(--bg-body)', position: 'relative', padding: '15px', boxSizing: 'border-box', borderBottom: '1px solid var(--border)' }}>
                    <img src={med.image_url || getMedicineImage(med)} alt={med.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(255,255,255,0.95)', color: 'var(--primary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem', fontWeight: '700', boxShadow: 'var(--shadow-sm)' }}>{cleanCategory(med.category)}</span>
                    </div>

                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', backgroundColor: 'var(--bg-surface)' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', minHeight: '18px' }}>
                          <div style={{ color: '#eab308', fontSize: '0.8rem', fontWeight: '600' }}>{avgRating > 0 ? `★ ${avgRating}` : <span style={{ color: 'var(--text-muted)' }}>No reviews</span>}</div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {med.stock_quantity < 20 && med.stock_quantity > 0 && <span style={{ color: 'var(--danger)', fontSize: '0.65rem', fontWeight: 'bold', backgroundColor: 'var(--danger-bg)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>Low Stock</span>}
                            {med.stock_quantity <= 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 'bold', backgroundColor: 'var(--border)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>Out of Stock</span>}
                          </div>
                        </div>
                        <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.2' }}>{med.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, lineHeight: '1.4' }}>{med.description || "High-quality pharmaceutical product."}</p>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--success)' }}>Rs. {med.price}</span>
                        <button onClick={(e) => addToCart(med, e)} disabled={med.stock_quantity <= 0} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '50px', opacity: med.stock_quantity <= 0 ? 0.5 : 1, cursor: med.stock_quantity <= 0 ? 'not-allowed' : 'pointer', backgroundColor: med.stock_quantity <= 0 ? 'var(--text-muted)' : 'var(--primary)' }}>+ Add</button>
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }} disabled={currentPage === 1} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', backgroundColor: currentPage === 1 ? 'var(--bg-body)' : 'var(--bg-surface)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)', transition: 'all 0.2s' }}>← Prev</button>
                <span style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', backgroundColor: 'var(--bg-surface)', padding: '4px 12px', borderRadius: '50px', border: '1px solid var(--border)' }}>Page {currentPage} of {totalPages}</span>
                <button onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }} disabled={currentPage === totalPages} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: '600', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', border: '1px solid var(--border)', backgroundColor: currentPage === totalPages ? 'var(--bg-body)' : 'var(--bg-surface)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)', transition: 'all 0.2s' }}>Next →</button>
              </div>
            )}
          </div>
        </div>

        {/* FLOATING CART BOTTOM PILL */}
        {cart.length > 0 && !isCartOpen && (
          <div 
            onClick={() => setIsCartOpen(true)}
            className="animate-slide-up"
            style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--primary)', color: 'white', padding: '14px 30px', borderRadius: '50px', display: 'flex', gap: '20px', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-hover)', zIndex: 90, transition: 'transform 0.2s' }}
            onMouseOver={e=>e.currentTarget.style.transform='translateX(-50%) scale(1.05)'}
            onMouseOut={e=>e.currentTarget.style.transform='translateX(-50%) scale(1)'}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>🛒 {cart.length} Item{cart.length > 1 ? 's' : ''}</span>
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>Rs. {cartTotal.toLocaleString()}</span>
            <span style={{ backgroundColor: 'white', color: 'var(--primary)', padding: '6px 14px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', marginLeft: '10px' }}>View Cart →</span>
          </div>
        )}

        {/* SLIDE-OUT CART DRAWER WITH FREE DELIVERY PROGRESS */}
        {isCartOpen && (
          <div onClick={() => setIsCartOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 999, backdropFilter: 'blur(4px)' }} />
        )}
        <div style={{ position: 'fixed', top: 0, right: isCartOpen ? 0 : '-100%', width: '100%', maxWidth: '400px', height: '100vh', backgroundColor: 'var(--bg-surface)', zIndex: 1000, transition: 'right 0.3s ease', boxShadow: '-10px 0 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-body)' }}>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>🛒 Your Cart</h2>
            <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--danger)'} onMouseOut={e=>e.target.style.color='var(--text-muted)'}>✖</button>
          </div>
          
          {/* --- NEW: FREE DELIVERY PROGRESS BAR --- */}
          <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
            {cartTotal >= FREE_DELIVERY_THRESHOLD ? (
              <p className="animate-pop-in" style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎉 Congratulations! You get FREE Delivery!
              </p>
            ) : (
              <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '600' }}>
                Add <span style={{ color: 'var(--primary)' }}>Rs. {FREE_DELIVERY_THRESHOLD - cartTotal}</span> more to unlock <strong style={{ color: 'var(--success)' }}>FREE Delivery!</strong>
              </p>
            )}
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '50px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${progressPercentage}%`, 
                backgroundColor: cartTotal >= FREE_DELIVERY_THRESHOLD ? 'var(--success)' : 'var(--primary)', 
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s ease' 
              }} />
            </div>
          </div>
          
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.5 }}>🛍️</div>
                <p style={{ fontSize: '1rem', fontWeight: '500' }}>Your cart is empty.</p>
              </div>
            ) : (
              <div>
                {!isCheckout ? (
                  <>
                    {cart.map((item, index) => (
                      <div key={index} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.3', flex: 1, paddingRight: '8px' }}>{item.name}</strong>
                          <div style={{ fontWeight: '700', color: 'var(--success)', fontSize: '0.95rem' }}>Rs. {item.price * item.quantity}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <button onClick={() => decreaseQuantity(item.id)} style={{ border: 'none', background: 'none', padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '1rem', transition: 'background-color 0.2s' }} onMouseOver={e=>e.target.style.backgroundColor='#e2e8f0'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>-</button>
                            <span style={{ fontWeight: '600', width: '20px', textAlign: 'center', color: 'var(--text-main)', fontSize: '0.85rem' }}>{item.quantity}</span>
                            <button onClick={() => addToCart(item)} style={{ border: 'none', background: 'none', padding: '4px 10px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '1rem', transition: 'background-color 0.2s' }} onMouseOver={e=>e.target.style.backgroundColor='#e2e8f0'} onMouseOut={e=>e.target.style.backgroundColor='transparent'}>+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem', padding: '4px', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={e=>e.target.style.opacity=1} onMouseOut={e=>e.target.style.opacity=0.8}>🗑️</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ backgroundColor: 'var(--bg-body)', padding: '12px', borderRadius: 'var(--radius-sm)', marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        <span>Total:</span><span style={{ color: 'var(--success)' }}>Rs. {cartTotal.toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => setIsCheckout(true)} className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '16px', borderRadius: '50px' }}>Proceed to Checkout</button>
                  </>
                ) : (
                  <form onSubmit={submitOrder} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', borderBottom: '2px solid var(--bg-body)', paddingBottom: '6px', fontSize: '1rem' }}>Delivery Details</h3>
                    <input type="text" placeholder="Full Name" required value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outlineColor: 'var(--primary)', fontSize: '0.9rem', backgroundColor: 'var(--bg-body)' }} />
                    <input type="tel" placeholder="Phone Number" required value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outlineColor: 'var(--primary)', fontSize: '0.9rem', backgroundColor: 'var(--bg-body)' }} />
                    <textarea placeholder="Complete Address" required value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '60px', outlineColor: 'var(--primary)', fontSize: '0.9rem', resize: 'vertical', backgroundColor: 'var(--bg-body)' }} />
                    
                    <h3 style={{ margin: '10px 0 0 0', color: 'var(--text-main)', borderBottom: '2px solid var(--bg-body)', paddingBottom: '6px', fontSize: '1rem' }}>Payment Method</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', border: customer.paymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: customer.paymentMethod === 'COD' ? '#f0f9ff' : 'var(--bg-body)', fontSize: '0.9rem', fontWeight: customer.paymentMethod === 'COD' ? '600' : '400', transition: 'all 0.2s' }}><input type="radio" name="payment" value="COD" checked={customer.paymentMethod === 'COD'} onChange={(e) => setCustomer({...customer, paymentMethod: e.target.value})} />🚚 Cash on Delivery</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', border: customer.paymentMethod === 'JazzCash/EasyPaisa' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: customer.paymentMethod === 'JazzCash/EasyPaisa' ? '#f0f9ff' : 'var(--bg-body)', fontSize: '0.9rem', fontWeight: customer.paymentMethod === 'JazzCash/EasyPaisa' ? '600' : '400', transition: 'all 0.2s' }}><input type="radio" name="payment" value="JazzCash/EasyPaisa" checked={customer.paymentMethod === 'JazzCash/EasyPaisa'} onChange={(e) => setCustomer({...customer, paymentMethod: e.target.value})} />📱 EasyPaisa / JazzCash</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', border: customer.paymentMethod === 'Card' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: customer.paymentMethod === 'Card' ? '#f0f9ff' : 'var(--bg-body)', fontSize: '0.9rem', fontWeight: customer.paymentMethod === 'Card' ? '600' : '400', transition: 'all 0.2s' }}><input type="radio" name="payment" value="Card" checked={customer.paymentMethod === 'Card'} onChange={(e) => setCustomer({...customer, paymentMethod: e.target.value})} />💳 Credit / Debit Card</label>
                    </div>
                    {customer.paymentMethod === 'JazzCash/EasyPaisa' && (<input type="tel" placeholder="Enter 11-digit Mobile No." required value={walletNumber} onChange={e => setWalletNumber(e.target.value)} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-body)', outlineColor: 'var(--primary)', fontSize: '0.9rem' }} />)}
                    {customer.paymentMethod === 'Card' && (<input type="text" placeholder="Card No. (XXXX-XXXX-XXXX-XXXX)" required value={cardNumber} onChange={e => setCardNumber(e.target.value)} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-body)', outlineColor: 'var(--primary)', fontSize: '0.9rem' }} />)}

                    <button type="submit" style={{ backgroundColor: 'var(--success)', color: 'white', border: 'none', padding: '12px', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', marginTop: '10px', boxShadow: 'var(--shadow-sm)' }}>Pay Rs. {cartTotal.toLocaleString()}</button>
                    <button type="button" onClick={() => setIsCheckout(false)} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Cancel</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TRACK ORDER MODAL KEEPS RUNNING */}
        {showTrackModal && (
          <div onClick={() => { setShowTrackModal(false); setTrackingData(null); setTrackingId(''); }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(6px)', padding: '20px' }}>
            <div onClick={(e) => e.stopPropagation()} className="card animate-pop-in" style={{ maxWidth: '500px', width: '100%', padding: '40px', position: 'relative', cursor: 'default' }}>
              <button onClick={() => { setShowTrackModal(false); setTrackingData(null); setTrackingId(''); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✖</button>
              <h2 style={{ marginTop: 0, color: 'var(--text-main)', textAlign: 'center', fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Track Your Order</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1rem', lineHeight: '1.5' }}>Enter the Tracking ID provided at checkout to see your delivery status.</p>
              <form onSubmit={handleTrackOrder} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <input type="number" placeholder="Order ID (e.g., 15)" required value={trackingId} onChange={(e) => setTrackingId(e.target.value)} style={{ flex: '1', padding: '14px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', outlineColor: 'var(--primary)', fontSize: '1.05rem', backgroundColor: 'var(--bg-body)' }} />
                <button type="submit" className="btn-primary" style={{ padding: '0 24px', fontSize: '1.05rem', borderRadius: '50px' }}>Track</button>
              </form>
              {trackingData && (
                <div style={{ backgroundColor: 'var(--bg-body)', padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', textAlign: 'center', fontSize: '1.2rem' }}>Order #{trackingId} Status</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
                    <div style={{ position: 'absolute', top: '16px', left: '15%', right: '15%', height: '4px', backgroundColor: trackingData.status === 'Delivered' ? 'var(--success)' : 'var(--border)', zIndex: 1, transition: 'background-color 0.5s' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--success)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 0 0 5px var(--bg-body)' }}>✓</div>
                      <span style={{ marginTop: '10px', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>Placed</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: trackingData.status === 'Delivered' ? 'var(--success)' : 'var(--border)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 0 0 5px var(--bg-body)', transition: 'background-color 0.5s' }}>{trackingData.status === 'Delivered' ? '✓' : '📦'}</div>
                      <span style={{ marginTop: '10px', fontWeight: '700', color: trackingData.status === 'Delivered' ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.9rem' }}>Delivered</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '25px', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Ordered on: {new Date(trackingData.order_date).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerStore;