'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const firstName = user?.name ? user.name.trim().split(' ')[0] : '';
  const displayName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
    : '';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    setMenuOpen(false);
  };

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [searchParams, pathname]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/?q=${encodeURIComponent(query)}` : '/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-actions">
        <div className="navbar-brand">
          <Link href="/" aria-label="Saha Traditions home">
            <img
              src="/sahalogo.png"
              alt="Saha Traditions"
              style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'cover', filter: 'drop-shadow(0 2px 8px rgba(217, 92, 71, 0.35))' }}
            />
            Saha Traditions
          </Link>
        </div>
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <form className="navbar-search" onSubmit={handleSearchSubmit} role="search">
        <input
          type="search"
          placeholder="Search products"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          aria-label="Search products"
        />
      </form>
      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li>
          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Cart <span className="navbar-badge">{cartItems.length}</span>
          </Link>
        </li>
        {user ? (
          <>
            <li><Link href="/profile" onClick={() => setMenuOpen(false)}>Hi, {displayName}</Link></li>
            {user.role === 'admin' && <li><Link href="/admin" onClick={() => setMenuOpen(false)}>Admin</Link></li>}
            <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
            <li><Link href="/register" className="btn-signup" onClick={() => setMenuOpen(false)}>Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
