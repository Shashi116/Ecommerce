import React from 'react';

const FooterInfo = () => {
  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h2 className="section-title">Saha Traditions Information</h2>
          <p className="subtle-text">Quick access to company, support, and policy details.</p>
        </div>
      </div>

      <div className="product-grid">
        <div className="product-card" style={{ padding: '24px' }}>
          <h3>About</h3>
          <p className="subtle-text">Contact Us, About Us, Careers, Stories, Press, Corporate Information.</p>
        </div>
        <div className="product-card" style={{ padding: '24px' }}>
          <h3>Help</h3>
          <p className="subtle-text">Payments, Shipping, Cancellation & Returns, FAQ.</p>
        </div>
        <div className="product-card" style={{ padding: '24px' }}>
          <h3>Consumer Policy</h3>
          <p className="subtle-text">Terms of Use, Privacy, Security, Sitemap, Grievance Redressal, EPR Compliance.</p>
        </div>
        <div className="product-card" style={{ padding: '24px' }}>
          <h3>Mail Us</h3>
          <p className="subtle-text">Saha Traditions Pvt Ltd, 88 Market Road, Bhopal, India.</p>
        </div>
        <div className="product-card" style={{ padding: '24px' }}>
          <h3>Registered Office</h3>
          <p className="subtle-text">Saha Traditions Pvt Ltd, Bhopal, India. CIN: U12345MP2026PTC000000.</p>
        </div>
      </div>
    </div>
  );
};

export default FooterInfo;
