import { Suspense } from 'react';
import Script from 'next/script';
import Providers from './providers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/global.css';
import '../styles/admin.css';
import '../styles/auth.css';
import '../styles/cart.css';
import '../styles/footer.css';
import '../styles/navbar.css';
import '../styles/pages.css';
import '../styles/product.css';

export const metadata = {
  title: 'Saha Traditions | E-commerce Platform | Varun Likhitkar',
  description: 'Saha Traditions | E-commerce Platform'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <main className="main-content">{children}</main>
          <Footer />
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
