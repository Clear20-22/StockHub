import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Assuming you have a CSS file for styling

export default function Login() {
   console.log('Rendering Login Page')
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    // TODO: Replace with real API call
    if (email === 'sojib@gmail.com' && password === 'sojib') {
      localStorage.setItem('token', 'demo-jwt-token');
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
  <div className="login-page">
    <div className="login-container">
      <h2 className="login-title">Login to StockHub</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="login-field">
          <label htmlFor="email" className="login-label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
        </div>
        <div className="login-field">
          <label htmlFor="password" className="login-label">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <p className="login-footer">
        Don’t have an account? <a href="/register" className="login-link">Register</a>
      </p>
    </div>
  </div>
);
}