import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    // We grab the userId that was passed over from the Signup page
    const location = useLocation();
    const userId = location.state?.userId;

    // If someone tries to visit this page without signing up first, kick them to login!
    if (!userId) {
        navigate('/auth');
        return null;
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Send the code to the new backend route we just made!
            const response = await axios.post('http://localhost:8080/api/auth/verify-otp', {
                userId: userId,
                otp: otp
            });

            toast.success("Account verified! You can now log in.");
            navigate('/auth'); // Send them back to the login screen
            
        } catch (error) {
            toast.error(error.response?.data?.error || "Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ color: '#0f172a', marginBottom: '10px' }}>Verify Your Email</h2>
                <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '0.95rem' }}>
                    We just sent a 6-digit verification code to your email. Please enter it below to activate your account.
                </p>

                <form onSubmit={handleVerify}>
                    <input 
                        type="text" 
                        placeholder="Enter 6-digit code" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        required
                        style={{ width: '100%', padding: '15px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '5px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={isLoading || otp.length < 6}
                        style={{ width: '100%', padding: '14px', backgroundColor: (isLoading || otp.length < 6) ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: (isLoading || otp.length < 6) ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
                    >
                        {isLoading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default VerifyOTP;