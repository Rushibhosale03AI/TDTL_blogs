import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../components/App.css';

const Navbar = () => {
  // 1. Pull the 'user' variable from our updated context
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/" style={{ fontSize: '1.2rem' }}>TechBlogs</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        
        {/* 2. If 'user' exists, show their name and the logged-in buttons */}
        {user ? (
          <>
            <span style={{ marginRight: '20px', fontWeight: 'bold', color: '#f1c40f' }}>
              Welcome, {user}!
            </span>
            <Link to="/create" className="btn btn-primary" style={{ marginRight: '10px' }}>
              Write a Post
            </Link>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </>
        ) : (
          <>
            {/* If 'user' is null, show login/register */}
            <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;