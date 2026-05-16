'use client';

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';

const AdminProducts = () => {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchProducts = async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchProducts();
  }, [authLoading, user, router]);

  if (authLoading || !user || user.role !== 'admin') return null;

  const handleDelete = async (id) => {
    if (window.confirm('Are you strictly sure you want to delete this?')) {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="section-header">
        <h2 className="section-title">Manage Products</h2>
        <Button to="/admin/add-product">+ Add Product</Button>
      </div>

      {loading ? (
        <Loader label="Loading products" />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start selling."
          action={<Button to="/admin/add-product">Add Product</Button>}
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id.substring(0, 8)}...</td>
                  <td>{product.name}</td>
                  <td>₹{product.price.toFixed(2)}</td>
                  <td>{product.category}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="table-actions">
                      <Button to={`/admin/edit-product/${product._id}`} variant="secondary" size="sm">Edit</Button>
                      <button onClick={() => handleDelete(product._id)} className="btn btn-danger btn-sm">Delete</button>
                    </div>
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
export default AdminProducts;
