import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { Store, ShieldCheck, Truck, CreditCard, BarChart3, Users, ChefHat, MapPin, ExternalLink, Smartphone, Globe, Zap } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SERVICES = [
  { icon: <Store size={28}/>, bg: 'linear-gradient(135deg, #06b6d4, #0891b2)', title: 'Multi-Vendor Marketplace', desc: 'Onboard unlimited vendors with verification, commission tracking, and independent dashboards.' },
  { icon: <CreditCard size={28}/>, bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', title: 'POS Terminal', desc: 'Fast checkout with bill splitting, refunds, multi-payment, and real-time KDS integration.' },
  { icon: <Truck size={28}/>, bg: 'linear-gradient(135deg, #f59e0b, #d97706)', title: 'Delivery Management', desc: 'Rider assignment, GPS tracking, and delivery status updates in real-time.' },
  { icon: <BarChart3 size={28}/>, bg: 'linear-gradient(135deg, #10b981, #059669)', title: 'ERP & Reporting', desc: 'Inventory, HR, accounts, recipe production, daily closings, and advanced reports.' },
  { icon: <ShieldCheck size={28}/>, bg: 'linear-gradient(135deg, #ec4899, #db2777)', title: 'Multi-Tenant Platform', desc: 'Complete data isolation per business. Each tenant gets their own outlets, users, and settings.' },
  { icon: <Smartphone size={28}/>, bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', title: 'Customer Portal & Kiosk', desc: 'QR-based ordering, self-service kiosks, wallet payments, and loyalty points.' },
];

const MOCK_BANNERS = [
  { id: 1, title: '🎉 50% Off First Order', gradient: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' },
  { id: 2, title: '🚀 Free Delivery Weekend', gradient: 'linear-gradient(135deg, #f59e0b, #ec4899)' },
  { id: 3, title: '⚡ Flash Sale — 2 Hours', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  { id: 4, title: '🏪 New Vendors This Week', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { id: 5, title: '💳 Pay with Wallet & Save', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
  { id: 6, title: '🍕 Group Order Deals', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
];

const MOCK_BLOGS = [
  { id: 1, tag: 'Press Release', title: 'Platform Raises $5M in Series A Funding', excerpt: 'Our mission to digitize every restaurant in the region takes a leap forward.', date: 'Apr 2, 2026' },
  { id: 2, tag: 'Feature Update', title: 'Bill Splitting & Group Orders Now Live', excerpt: 'Split bills across multiple payments, handle group orders seamlessly.', date: 'Mar 28, 2026' },
  { id: 3, tag: 'Case Study', title: 'How Al-Madina Grill Grew 3x with Our POS', excerpt: 'A deep dive into how a single-outlet restaurant scaled to 5 locations.', date: 'Mar 15, 2026' },
];

export default function App() {
  const [vendors, setVendors] = useState([]);
  const [banners, setBanners] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [nearbyStores, setNearbyStores] = useState([]);

  useEffect(() => {
    // Animate hero
    gsap.fromTo('.hero-content', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 });
    gsap.fromTo('.nav', { y: -60 }, { y: 0, duration: 0.6, ease: 'power2.out' });

    // Load data from API
    fetch(`${API}/api/vendor/featured`).then(r => r.json()).then(v => { if (Array.isArray(v) && v.length > 0) setVendors(v); }).catch(() => {});
    fetch(`${API}/api/content/banners`).then(r => r.json()).then(b => { if (Array.isArray(b) && b.length > 0) setBanners(b); }).catch(() => {});
    fetch(`${API}/api/content/blog`).then(r => r.json()).then(p => { if (Array.isArray(p) && p.length > 0) setBlogs(p); }).catch(() => {});

    // Geolocation for nearby stores
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch(`${API}/api/outlets/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=20`)
            .then(r => r.json()).then(s => { if (Array.isArray(s)) setNearbyStores(s); }).catch(() => {});
        },
        () => {} // silently fail if denied
      );
    }
  }, []);

  // Animate sections on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) gsap.fromTo(e.target, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const displayBanners = banners.length > 0 ? banners : MOCK_BANNERS;
  const displayBlogs = blogs.length > 0 ? blogs : MOCK_BLOGS;
  const displayVendors = vendors.length > 0 ? vendors : [
    { id: 1, businessName: 'Al-Madina Grill', isVerified: true, user: { name: 'Ahmed Khan' } },
    { id: 2, businessName: 'Burger Galaxy', isVerified: true, user: { name: 'Fatima Ali' } },
    { id: 3, businessName: 'Spice Garden', isVerified: true, user: { name: 'Usman Ch' } },
    { id: 4, businessName: 'Fresh Bakes Co', isVerified: false, user: { name: 'Sara Malik' } },
    { id: 5, businessName: 'Pizza Nova', isVerified: true, user: { name: 'Ali Hassan' } },
    { id: 6, businessName: 'Desi Dhaba', isVerified: true, user: { name: 'Raj Kumar' } },
  ];

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-brand">⚡ SaaS ERP</div>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#vendors">Vendors</a>
          <a href="#blog">Blog</a>
          <a href="#nearby">Nearby</a>
          <button className="nav-cta" onClick={() => window.location.href = '/admin'}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <h1>Run Your Entire Business<br/>from <span>One Platform</span></h1>
          <p>Multi-tenant ERP, POS, marketplace, delivery — everything a modern food and retail business needs. Fully white-label, infinitely scalable.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => window.location.href = '/admin'}>Start Free Trial</button>
            <button className="btn-outline" onClick={() => document.getElementById('services').scrollIntoView()}>Explore Features</button>
          </div>
        </div>
      </section>

      {/* AD BANNERS CAROUSEL */}
      <div className="section banner-section" style={{ maxWidth: '100%', padding: '0 0 60px' }}>
        <div className="banner-track">
          {[...displayBanners, ...displayBanners].map((b, i) => (
            <div key={i} className="banner-card" style={{ background: b.gradient || 'var(--bg-card)' }}>
              {b.imageUrl ? <img src={b.imageUrl} alt={b.title} /> : <span style={{ fontWeight: 800, fontSize: '1.3rem', padding: 20, textAlign: 'center' }}>{b.title}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section className="section animate-on-scroll" id="services">
        <div className="section-label">What We Offer</div>
        <h2 className="section-title">All-in-One Business Platform</h2>
        <p className="section-desc">From POS to delivery, inventory to HR — every module you need under one roof.</p>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-card">
              <div className="service-icon" style={{ background: s.bg, color: 'white' }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED VENDORS */}
      <section className="section animate-on-scroll" id="vendors">
        <div className="section-label">Trusted Partners</div>
        <h2 className="section-title">Featured Vendors</h2>
        <p className="section-desc">Verified vendors on our marketplace. The blue tick means identity-verified and quality-audited.</p>
        <div className="vendors-grid">
          {displayVendors.map((v, i) => (
            <div key={v.id || i} className="vendor-card">
              <div className="vendor-avatar">{(v.businessName || 'V')[0]}</div>
              <div className="vendor-name">
                {v.businessName}
                {v.isVerified && <span className="blue-tick">✓</span>}
              </div>
              <div className="vendor-biz">{v.user?.name || 'Verified Vendor'}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEARBY STORES */}
      {nearbyStores.length > 0 && (
        <section className="section animate-on-scroll" id="nearby">
          <div className="section-label"><MapPin size={14} style={{ verticalAlign: '-2px' }}/> Near You</div>
          <h2 className="section-title">Stores Nearby</h2>
          <p className="section-desc">Discovered based on your current location.</p>
          <div className="nearby-grid">
            {nearbyStores.map((s, i) => (
              <div key={s.id || i} className="store-card">
                <div className="store-name">{s.tenantName || s.name}</div>
                <div className="store-dist">{s.distance ? `${Number(s.distance).toFixed(1)} km away` : 'Nearby'}</div>
                <div className="store-addr">{s.address}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BLOG / PRESS */}
      <section className="section animate-on-scroll" id="blog">
        <div className="section-label">Latest Updates</div>
        <h2 className="section-title">Press & Blog</h2>
        <p className="section-desc">News, feature launches, and success stories from our platform.</p>
        <div className="blog-grid">
          {displayBlogs.map((b, i) => (
            <div key={b.id || i} className="blog-card">
              <div className="blog-cover" style={{ background: b.coverImage ? `url(${b.coverImage}) center/cover` : `linear-gradient(135deg, #1e293b, #334155)` }}></div>
              <div className="blog-body">
                <div className="blog-tag">{b.tag || b.tags || 'Article'}</div>
                <h3>{b.title}</h3>
                <p>{b.excerpt || b.content?.slice(0, 120) || ''}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">⚡ SaaS ERP Platform</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 300 }}>Multi-tenant ERP + POS + Marketplace + Delivery. Built for food and retail businesses at any scale.</p>
          </div>
          <div>
            <h4>Products</h4>
            <a href="#">POS Terminal</a>
            <a href="#">Kitchen Display</a>
            <a href="#">Marketplace</a>
            <a href="#">Delivery App</a>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#blog">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div>
            <h4>Portals</h4>
            <a href="/admin">Admin Panel</a>
            <a href="/vendor">Vendor Dashboard</a>
            <a href="/rider">Rider App</a>
            <a href="/customer">Customer Portal</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 SaaS ERP Platform. All rights reserved.</div>
      </footer>
    </>
  );
}
