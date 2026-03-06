import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Grab the hidden security codes from the URL
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Send the new password + security codes back to Django
      await axios.post(`http://127.0.0.1:8000/api/accounts/password-reset-confirm/${uid}/${token}/`, {
        password: password
      });
      
      setMessage("Password successfully reset! Redirecting to login...");
      
      // Teleport them to the login screen after a few seconds
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      setError(err.response?.data?.error || "This reset link is invalid or has expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Create New Password</h2>
        
        {message ? (
            <div style={{ color: 'green', marginBottom: '15px', fontWeight: 'bold' }}>{message}</div>
        ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
              
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="New Password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Confirm New Password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save New Password'}
              </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;