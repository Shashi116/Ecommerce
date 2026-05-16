'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const Home = ({ searchQuery = '' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('all');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return undefined;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % products.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [products.length]);

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (category !== 'all') {
      result = result.filter((product) => product.category === category);
    }

    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);
    if (min !== null && !Number.isNaN(min)) {
      result = result.filter((product) => product.price >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      result = result.filter((product) => product.price <= max);
    }

    if (minRating !== 'all') {
      const ratingThreshold = Number(minRating);
      result = result.filter((product) => (product.ratings || 0) >= ratingThreshold);
    }

    if (sortBy === 'price-low') {
      result = result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = result.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
    }

    return result;
  }, [products, searchQuery, category, minPrice, maxPrice, minRating, sortBy]);

  const activeSlide = products[carouselIndex];

  return (
    <div className="page">
      {activeSlide && (
        <section className="top-carousel" aria-label="Featured products">
          <button
            className="carousel-image"
            type="button"
            onClick={() => router.push(`/product/${activeSlide._id}`)}
          >
            <img src={activeSlide.imageUrl} alt={activeSlide.name} />
            <div className="carousel-caption">
              <span>Featured</span>
              <strong>{activeSlide.name}</strong>
            </div>
          </button>
        </section>
      )}
      <section className="section" id="products">
        <div className="section-header">
          <div>
            <h2 className="section-title">All Products</h2>
            <p className="subtle-text">Browse everything available in the store.</p>
          </div>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="minPrice">Min Price</label>
            <input
              id="minPrice"
              type="number"
              className="search-bar"
              placeholder="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              min="0"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price</label>
            <input
              id="maxPrice"
              type="number"
              className="search-bar"
              placeholder="9999"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              min="0"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              className="form-select"
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="4">4★ & above</option>
              <option value="3">3★ & above</option>
              <option value="2">2★ & above</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              className="form-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="product-card">
                <Skeleton style={{ height: '220px', width: '100%' }} />
                <div style={{ padding: '20px' }}>
                  <Skeleton style={{ height: '18px', width: '80%', marginBottom: '12px' }} />
                  <Skeleton style={{ height: '16px', width: '40%', marginBottom: '18px' }} />
                  <Skeleton style={{ height: '38px', width: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Why shop with us</h2>
            <p className="subtle-text">Premium experience from browsing to delivery.</p>
          </div>
        </div>
        <div className="product-grid">
          {[
            { title: 'Fast Delivery', description: 'Track orders and get updates with every shipment.' },
            { title: 'Secure Payments', description: 'Trusted payment providers and encrypted checkout.' },
            { title: 'Curated Products', description: 'Quality-checked items from vetted sellers.' },
            { title: '24/7 Support', description: 'We are here when you need help.' }
          ].map((item) => (
            <div key={item.title} className="product-card" style={{ padding: '24px' }}>
              <h3>{item.title}</h3>
              <p className="subtle-text">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
