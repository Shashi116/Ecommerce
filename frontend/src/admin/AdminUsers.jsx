'use client';

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const AdminUsers = () => {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
      const res = await fetch('/api/auth/users', { credentials: 'same-origin' });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    };
    fetchUsers();
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#D95C47', marginBottom: '20px' }}>User Directory</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={rowStyle}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>NAME</th>
              <th style={thStyle}>EMAIL</th>
              <th style={thStyle}>ROLE</th>
              <th style={thStyle}>JOINED</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={rowStyle}>
                <td style={tdStyle}>{u._id.substring(0, 8)}...</td>
                <td style={tdStyle}>{u.name}</td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}>
                  <span style={{ background: u.role === 'admin' ? 'rgba(217,92,71,0.2)' : 'rgba(43,43,43,0.08)', color: u.role === 'admin' ? '#D95C47' : '#2B2B2B', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const containerStyle = { maxWidth: '1200px', margin: '40px auto', padding: '30px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(217, 92, 71, 0.22)', color: '#2B2B2B' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const rowStyle = { borderBottom: '1px solid rgba(217, 92, 71, 0.18)' };
const thStyle = { padding: '15px', textAlign: 'left', color: '#6B6763', fontSize: '0.9rem' };
const tdStyle = { padding: '15px', textAlign: 'left', color: '#2B2B2B' };

export default AdminUsers;
