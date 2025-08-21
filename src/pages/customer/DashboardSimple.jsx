import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CustomerDashboardSimple = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #3b82f6', 
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '18px' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #f9fafb, #dbeafe)',
      padding: '32px 16px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Profile Card */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
              padding: '16px',
              borderRadius: '50%',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              👤
            </div>
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#111827',
                marginBottom: '8px'
              }}>
                Welcome back, {user?.first_name || 'Customer'}!
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Manage your warehouse storage and track your goods
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>📧 {user?.email}</span>
                {user?.phone && <span style={{ color: '#6b7280' }}>📞 {user.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280', 
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Total Goods
                </p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>
                  12
                </p>
                <p style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                  📈 +12% from last month
                </p>
              </div>
              <div style={{
                backgroundColor: '#dbeafe',
                padding: '12px',
                borderRadius: '50%',
                fontSize: '24px'
              }}>
                📦
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280', 
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Active Orders
                </p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>
                  3
                </p>
                <p style={{ fontSize: '12px', color: '#ea580c', marginTop: '4px' }}>
                  🕒 In progress
                </p>
              </div>
              <div style={{
                backgroundColor: '#fed7aa',
                padding: '12px',
                borderRadius: '50%',
                fontSize: '24px'
              }}>
                ⏰
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280', 
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Completed Orders
                </p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>
                  18
                </p>
                <p style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                  ✅ All time
                </p>
              </div>
              <div style={{
                backgroundColor: '#dcfce7',
                padding: '12px',
                borderRadius: '50%',
                fontSize: '24px'
              }}>
                ✅
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#6b7280', 
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Warehouse Value
                </p>
                <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>
                  $15,420
                </p>
                <p style={{ fontSize: '12px', color: '#7c3aed', marginTop: '4px' }}>
                  📊 Current estimate
                </p>
              </div>
              <div style={{
                backgroundColor: '#e9d5ff',
                padding: '12px',
                borderRadius: '50%',
                fontSize: '24px'
              }}>
                📊
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '20px'
          }}>
            📊 Recent Activity
          </h2>
          <div style={{ color: '#6b7280' }}>
            <p>✅ New storage order created - Order #ORD-2024-001</p>
            <p style={{ marginTop: '12px' }}>📦 Goods delivered to warehouse - 5 items delivered</p>
            <p style={{ marginTop: '12px' }}>💰 Payment processed - Monthly storage fee of $250</p>
          </div>
        </div>

      </div>
      
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CustomerDashboardSimple;
