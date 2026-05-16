import React from 'react';
import Link from 'next/link';

const OrderSuccess = () => {
  const containerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '50px 30px',
    background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid rgba(217, 92, 71, 0.22)',
    boxShadow: '0 12px 30px rgba(43,43,43,0.10)',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#D95C47' }}>Payment Successful!</h2>
      <p style={{ color: '#6B6763', fontSize: '1.2rem', marginBottom: '40px' }}>
        Thank you for your order. We have securely received your payment and will process your shipment shortly.
      </p>
      <Link href="/" className="btn">Continue Shopping</Link>
    </div>
  );
};

export default OrderSuccess;
