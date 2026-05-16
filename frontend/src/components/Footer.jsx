import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>About</h4>
            <Link href="/footer-info">Contact Us</Link>
            <Link href="/about">About Us</Link>
            <Link href="/footer-info">Careers</Link>
            <Link href="/footer-info">Stories</Link>
            <Link href="/footer-info">Press</Link>
            <Link href="/footer-info">Corporate Information</Link>
          </div>

          <div className="footer-column">
            <h4>Group Companies</h4>
            <Link href="/footer-info">Myntra</Link>
            <Link href="/footer-info">Cleartrip</Link>
            <Link href="/footer-info">Shopsy</Link>
          </div>

          <div className="footer-column">
            <h4>Help</h4>
            <Link href="/footer-info">Payments</Link>
            <Link href="/footer-info">Shipping</Link>
            <Link href="/footer-info">Cancellation & Returns</Link>
            <Link href="/footer-info">FAQ</Link>
          </div>

          <div className="footer-column">
            <h4>Consumer Policy</h4>
            <Link href="/footer-info">Terms Of Use</Link>
            <Link href="/footer-info">Privacy</Link>
            <Link href="/footer-info">Security</Link>
            <Link href="/footer-info">Sitemap</Link>
            <Link href="/footer-info">Grievance Redressal</Link>
            <Link href="/footer-info">EPR Compliance</Link>
          </div>

          <div className="footer-column footer-address">
            <h4>Mail Us</h4>
            <p>Saha Traditions Pvt Ltd, 88 Market Road, Bhopal, India.</p>
          </div>

          <div className="footer-column footer-address">
            <h4>Registered Office Address</h4>
            <p>Saha Traditions Pvt Ltd, Bhopal, India.</p>
            <p>CIN: U12345MP2026PTC000000</p>
            <p>Telephone: 044-12345678</p>
          </div>
        </div>

        <div className="footer-meta">
          &copy; {new Date().getFullYear()} Saha Traditions. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
