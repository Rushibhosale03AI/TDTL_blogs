import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import PostForm from './components/PostForm'; // <-- 1. Import the new form
import { AuthProvider, useAuth } from './context/AuthContext';

import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Allows only logged-out users (hides login/register from active users)
function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
}

// NEW: Allows only logged-in users (protects the create/edit pages)
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Public Home Page */}
          <Route path="/" element={<Home />} />
          
          {/* Auth Pages (Hidden if logged in) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          {/* Forgot Password Page */}
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } 
          />

          {/* Reset Password Page (Notice the :uid and :token parameters!) */}
          <Route 
            path="/reset-password/:uid/:token" 
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } 
          />

          {/* NEW: Protected Blog Pages (Hidden if logged out) */}
          <Route 
            path="/create" 
            element={
              <PrivateRoute>
                <PostForm />
              </PrivateRoute>
            } 
          />
          {/* Notice the :id parameter so React knows which post to edit */}
          <Route 
            path="/edit/:id" 
            element={
              <PrivateRoute>
                <PostForm />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 