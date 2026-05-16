'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error(error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      const validQty = Math.min(qty, product.stock);
      if (validQty === 0) {
        setNotice('Product out of stock!');
        setTimeout(() => setNotice(''), 2000);
        return;
      }
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: validQty,
        stock: product.stock
      }));
      setNotice('Added to cart!');
      setTimeout(() => setNotice(''), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      const validQty = Math.min(qty, product.stock);
      if (validQty === 0) {
        setNotice('Product out of stock!');
        setTimeout(() => setNotice(''), 2000);
        return;
      }
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        qty: validQty,
        stock: product.stock
      }));
      router.push('/checkout');
    }
  };

  if (loading) return <Loader label="Loading product" />;
  if (!product) return <EmptyState title="Product not found" description="Try browsing the shop for more items." />;

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link href="/">Home</Link> / {product.category} / <span>{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="detail-image-container">
          <img src={product.imageUrl} alt={product.name} className="detail-image" />
        </div>

        <div className="detail-info">
          <h2>{product.name}</h2>
          <div className="detail-badges">
            <Badge variant="info">{product.category}</Badge>
            <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Badge>
          </div>
          <p className="detail-price">₹{product.price.toFixed(2)}</p>
          <div>
            <h4>Product Description</h4>
            <p>{product.description}</p>
          </div>

          <div className="detail-actions">
            <div className="qty-selector" aria-label="Quantity selector">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">-</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(q + 1, product.stock))} aria-label="Increase quantity">+</button>
            </div>
            <Button onClick={handleAddToCart} size="lg">Add to Cart</Button>
            <Button onClick={handleBuyNow} size="lg" className="btn-buy-now">Buy Now</Button>
          </div>

          {notice && <p className="subtle-text" role="status" aria-live="polite">{notice}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
