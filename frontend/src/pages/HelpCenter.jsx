import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HelpCenter() {
  // State to track which FAQ accordion is open
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Realistic startup FAQ data
  const faqs = [
    {
      question: "How long does delivery usually take?",
      answer: "We prioritize your health. Local deliveries are fulfilled within 2-4 hours via our express rider network. Nationwide shipping typically takes 24-48 hours depending on your exact location."
    },
    {
      question: "Are your medicines 100% authentic?",
      answer: "Absolutely. We have a strict zero-tolerance policy for counterfeits. All our medicines are sourced directly from licensed manufacturers, verified distributors, and authorized pharmacy networks."
    },
    {
      question: "How do I upload my doctor's prescription?",
      answer: "Once logged in, click the 'Upload Prescription' button in the navigation bar. You can upload a clear image (JPG, PNG) or a PDF of your prescription. Our licensed pharmacists will review it within 30 minutes."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD), JazzCash, EasyPaisa, and all major Credit/Debit cards through our secure payment gateway."
    },
    {
      question: "What is your return and refund policy?",
      answer: "Due to health and safety regulations, we cannot accept returns on opened or temperature-sensitive medicines. However, if you receive a damaged product or the wrong item, please contact us within 24 hours for a full refund or replacement."
    },
    {
      question: "Can I track my order live?",
      answer: "Yes! Once you place an order, you will receive a unique Tracking ID. You can click 'Track Order' on our homepage and enter your ID to see exactly where your package is."
    }
  ];

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* --- HERO HEADER --- */}
      <div style={{ 
        backgroundColor: 'var(--primary)', 
        padding: '80px 20px 60px', 
        textAlign: 'center', 
        color: 'white', 
        backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #0f172a 100%)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <span style={{ fontSize: '3rem', marginBottom: '15px', display: 'block' }}>👋</span>
        <h1 style={{ fontSize: '3rem', margin: '0 0 15px 0', fontWeight: '800', letterSpacing: '-0.02em' }}>How can we help you?</h1>
        <p style={{ fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', color: '#cbd5e1', lineHeight: '1.6' }}>
          Search our knowledge base or browse our frequently asked questions below to find exactly what you need.
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '-40px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* --- QUICK CONTACT CARDS --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          <div className="card" style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📞</div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>Call Support</h3>
            <p style={{ margin: '0 0 15px 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Speak directly with our team.</p>
            <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>+92 300 1234567</strong>
          </div>

          <div className="card" style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>✉️</div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>Email Us</h3>
            <p style={{ margin: '0 0 15px 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Get a response within 2 hours.</p>
            <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>support@curelink.com</strong>
          </div>

          <div className="card" style={{ padding: '30px', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>👨‍⚕️</div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>Pharmacist Consult</h3>
            <p style={{ margin: '0 0 15px 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Need medical advice?</p>
            <Link to="/auth" style={{ color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none' }}>Login to Portal →</Link>
          </div>
        </div>

        {/* --- FAQ ACCORDION SECTION --- */}
        <div className="card" style={{ padding: '40px', backgroundColor: 'var(--bg-surface)' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', margin: '0 0 30px 0', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                style={{ 
                  border: `1px solid ${openIndex === index ? 'var(--primary)' : 'var(--border)'}`, 
                  borderRadius: 'var(--radius-sm)', 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Accordion Header (Clickable) */}
                <button 
                  onClick={() => toggleFAQ(index)}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '20px', 
                    backgroundColor: openIndex === index ? '#f0f9ff' : 'var(--bg-surface)', 
                    border: 'none', 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    color: openIndex === index ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: '600',
                    fontSize: '1.05rem',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {faq.question}
                  <span style={{ 
                    fontSize: '1.2rem', 
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.3s ease' 
                  }}>
                    ▼
                  </span>
                </button>

                {/* Accordion Body (Collapsible) */}
                {openIndex === index && (
                  <div className="animate-fade-in" style={{ padding: '0 20px 20px 20px', backgroundColor: '#f0f9ff', color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '15px' }}>
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default HelpCenter;