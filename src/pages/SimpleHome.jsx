import React from 'react';
import { Link } from 'react-router-dom';

const SimpleHome = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(to right, #2563eb, #1d4ed8)', 
        color: 'white', 
        padding: '80px 20px' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '24px' }}>
            Welcome to StockHub
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '32px', color: '#dbeafe' }}>
            Your trusted warehouse management solution
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/register"
              style={{
                backgroundColor: 'white',
                color: '#2563eb',
                padding: '12px 32px',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Get Started
            </Link>
            <Link
              to="/about"
              style={{
                border: '2px solid white',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
            Why Choose StockHub?
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '64px' }}>
            We provide comprehensive warehouse management solutions
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '32px' 
          }}>
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                📦
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                Inventory Management
              </h3>
              <p style={{ color: '#6b7280' }}>
                Comprehensive tracking and management of your warehouse inventory
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🛡️
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                Secure Storage
              </h3>
              <p style={{ color: '#6b7280' }}>
                State-of-the-art security systems to protect your valuable goods
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🕐
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                24/7 Access
              </h3>
              <p style={{ color: '#6b7280' }}>
                Round-the-clock access to your stored items and real-time updates
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                👥
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                Expert Team
              </h3>
              <p style={{ color: '#6b7280' }}>
                Professional staff dedicated to managing your warehouse needs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '80px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '32px' }}>
            Join thousands of businesses who trust StockHub with their warehouse management
          </p>
          <Link
            to="/register"
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '16px 40px',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '1.125rem',
              display: 'inline-block'
            }}
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
