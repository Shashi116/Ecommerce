'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { removeFromCart, addToCart } from '../redux/cartSlice';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQty = (item, qty) => {
    if (qty > 0 && qty <= item.stock) {
      dispatch(addToCart({ ...item, qty }));
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="page cart-container">
      <div className="section-header">
        <div>
          <h2 className="section-title">Shopping Cart</h2>
          <p className="subtle-text">Review items before checkout.</p>
        </div>
        <Button to="/" variant="secondary">Continue Shopping</Button>
      </div>

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Browse our catalog and add items you love."
          action={<Button to="/">Go Shopping</Button>}
        />
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.productId} className="cart-item">
                <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <p className="subtle-text">₹{item.price}</p>
                  <div className="qty-controls" aria-label="Quantity controls">
                    <button onClick={() => handleUpdateQty(item, item.qty - 1)} aria-label="Decrease quantity">-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => handleUpdateQty(item, item.qty + 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <button onClick={() => handleRemove(item.productId)} className="btn-remove">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
            <Button onClick={() => router.push('/checkout')} className="btn-checkout" size="lg">
              Proceed to Checkout
            </Button>
            <p className="subtle-text" style={{ marginTop: '16px' }}>
              Taxes and shipping calculated at checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
