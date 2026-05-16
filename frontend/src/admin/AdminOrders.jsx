'use client';

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';

const AdminOrders = () => {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchOrders = async () => {
      const res = await fetch('/api/orders', { credentials: 'same-origin' });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchOrders();
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== 'admin') return null;

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setOrders(orders.map(order => order._id === id ? { ...order, status } : order));
    }
  };

  return (
    <div className="admin-page">
      <h2 className="section-title">Manage Orders</h2>

      {loading ? (
        <Loader label="Loading orders" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders will appear here once customers checkout." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}...</td>
                  <td>{order.userId?.name || 'Deleted User'}</td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="status-select"
                      aria-label="Update order status"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminOrders;
