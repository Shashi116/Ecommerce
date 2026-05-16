'use client';

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

const AdminDashboard = () => {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics', { credentials: 'same-origin' });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        } else {
          if (res.status === 401) {
            router.push('/login');
          }
          setStats({ totalOrders: 0, totalProducts: 0, totalUsers: 0, totalRevenue: 0 });
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <img src="/sahalogo.png" alt="Logo" />
        <div>
          <h2>Admin Dashboard</h2>
          <p className="subtle-text">Welcome back, <span style={{ color: '#2B2B2B' }}>{user?.name}</span></p>
        </div>
      </div>

      {stats ? (
        <div className="stat-grid">
          <div className="stat-card">
            <h4>Total Orders</h4>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div className="stat-card">
            <h4>Total Products</h4>
            <div className="stat-value">{stats.totalProducts}</div>
          </div>
          <div className="stat-card">
            <h4>Total Users</h4>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h4>Total Revenue</h4>
            <div className="stat-value">₹{stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <Loader label="Loading metrics" />
      )}

      <div className="section">
        <h3 style={{ marginBottom: '20px', color: '#D95C47' }}>Administrative Controls</h3>
        <div className="admin-actions">
          <Button onClick={() => router.push('/admin/add-product')}>+ Add Product</Button>
          <Button variant="secondary" onClick={() => router.push('/admin/products')}>📦 Manage Products</Button>
          <Button variant="secondary" onClick={() => router.push('/admin/orders')}>🚚 Manage Orders</Button>
          <Button variant="secondary" onClick={() => router.push('/admin/users')}>👥 Users Directory</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
