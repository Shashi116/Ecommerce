'use client';

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { user, authLoading, logout } = useContext(AuthContext);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      router.push('/login');
      return;
    }
    const fetchMyOrders = async () => {
      try {
        const res = await fetch('/api/orders/myorders', { credentials: 'same-origin' });
        const data = await res.json();
        if (res.ok) {
          setOrders(Array.isArray(data) ? data : []);
        } else {
          // Token obsolete or 401: clear and bounce
          if (res.status === 401) {
             logout();
             router.push('/login');
          }
          setOrders([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [authLoading, user, logout, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const containerStyle = { maxWidth: '1000px', margin: '40px auto', padding: '30px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(217,92,71,0.22)', color: '#2B2B2B' };
  const badgeStyle = { background: 'rgba(217,92,71,0.1)', color: '#D95C47', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' };

  if (!user) return null;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(217,92,71,0.22)', paddingBottom: '30px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#2B2B2B', fontSize: '2.2rem', marginBottom: '10px' }}>My Profile</h2>
          <p style={{ color: '#6B6763', fontSize: '1.2rem', marginBottom: '5px' }}><strong>Name:</strong> {user.name}</p>
          <p style={{ color: '#6B6763', fontSize: '1.2rem', marginBottom: '15px' }}><strong>Email:</strong> {user.email}</p>
          <span style={badgeStyle}>Account Type: {user.role.toUpperCase()}</span>
        </div>
      </div>

      <h3 style={{ color: '#D95C47', marginBottom: '20px', fontSize: '1.5rem' }}>Order History</h3>
      {loading ? (
        <p style={{ color: '#6B6763' }}>Fetching your orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ background: '#FFF6F3', padding: '30px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(217,92,71,0.22)' }}>
          <p style={{ color: '#6B6763', marginBottom: '15px' }}>You haven't placed any orders yet.</p>
          <Link href="/" className="btn">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map(order => (
            <div key={order._id} style={{ background: '#FFF6F3', padding: '20px', borderRadius: '12px', border: '1px solid rgba(217,92,71,0.22)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
              <div>
                <p style={{ color: '#6B6763', fontSize: '0.9rem', marginBottom: '5px' }}>Order ID: <span style={{ color: '#2B2B2B' }}>{order._id}</span></p>
                <p style={{ color: '#6B6763', fontSize: '0.9rem', marginBottom: '5px' }}>Placed On: <span style={{ color: '#2B2B2B' }}>{new Date(order.createdAt).toLocaleDateString()}</span></p>
                <p style={{ color: '#6B6763', fontSize: '0.9rem' }}>Total: <strong style={{ color: '#D95C47' }}>₹{order.totalAmount.toFixed(2)}</strong></p>
              </div>
              <div>
                <span style={{ 
                  background: order.status === 'Delivered' ? 'rgba(196,78,58,0.12)' : order.status === 'Shipped' ? 'rgba(217,92,71,0.12)' : 'rgba(229,122,103,0.14)', 
                  color: order.status === 'Delivered' ? '#C44E3A' : order.status === 'Shipped' ? '#D95C47' : '#C44E3A',
                  padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' 
                }}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
