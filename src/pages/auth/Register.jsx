import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse the same CSS for glassmorphism effect

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    // Simple validation
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // TODO: Replace with real API call
    if (email && password) {
      // Simulate a successful registration
      localStorage.setItem('token', 'demo-jwt-token');
      navigate('/dashboard');
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Register for StockHub</h2>
        <form onSubmit={handleRegister} className="login-form">
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
          <div className="login-field">
            <label htmlFor="confirm-password" className="login-label">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <button type="submit" className="login-button">
            Register
          </button>
        </form>
        <p className="login-footer">
          Already have an account? <a href="/login" className="login-link">Login</a>
        </p>
      </div>
    </div>
  );
}