import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Search, MapPin, Star, Clock, ChevronRight, X, Plus, Minus,
  Truck, CheckCircle, ArrowRight, Briefcase, Bell, Heart, Home, User,
  Package, Filter, Phone, Menu, FileText, UploadCloud, CreditCard
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';

// ─── DATA ────────────────────────────────────────────────
const RESTAURANTS = [
  { id: 1, name: 'Pizza Palace', cuisine: 'Italian · Pizza', rating: 4.8, deliveryTime: '20-30', deliveryFee: 50, image: '🍕', category: 'Pizza', minOrder: 200, distance: '1.2 km', tag: 'Popular' },
  { id: 2, name: 'Burger Galaxy', cuisine: 'American · Burgers', rating: 4.6, deliveryTime: '15-25', deliveryFee: 40, image: '🍔', category: 'Burgers', minOrder: 150, distance: '0.8 km', tag: 'Fast' },
  { id: 3, name: 'Sushi World', cuisine: 'Japanese · Sushi', rating: 4.9, deliveryTime: '30-45', deliveryFee: 80, image: '🍱', category: 'Sushi', minOrder: 500, distance: '2.5 km', tag: 'Premium' },
  { id: 4, name: 'Desi Corner', cuisine: 'Pakistani · Biryani', rating: 4.7, deliveryTime: '25-35', deliveryFee: 30, image: '🍛', category: 'Desi', minOrder: 250, distance: '1.8 km', tag: 'Trending' },
  { id: 5, name: 'Taco Fiesta', cuisine: 'Mexican · Tacos', rating: 4.5, deliveryTime: '20-30', deliveryFee: 45, image: '🌮', category: 'Mexican', minOrder: 200, distance: '3.0 km', tag: null },
  { id: 6, name: 'Crispy Chicken', cuisine: 'Fast Food · Fried', rating: 4.4, deliveryTime: '15-20', deliveryFee: 35, image: '🍗', category: 'Fast Food', minOrder: 180, distance: '0.5 km', tag: 'Nearby' },
];

const MENU_ITEMS = {
  1: [
    { id: 'p1', name: 'Margherita Pizza', price: 850, category: 'Pizza' },
    { id: 'p2', name: 'Pepperoni Blast', price: 1100, category: 'Pizza' },
    { id: 'p3', name: 'Garlic Bread', price: 250, category: 'Sides' },
    { id: 'p4', name: 'Coca-Cola 500ml', price: 120, category: 'Drinks' },
  ],
  2: [
    { id: 'b1', name: 'Galaxy Burger', price: 650, category: 'Burgers' },
    { id: 'b2', name: 'Double Smash', price: 850, category: 'Burgers' },
    { id: 'b3', name: 'Crispy Fries', price: 280, category: 'Sides' },
    { id: 'b4', name: 'Vanilla Shake', price: 350, category: 'Drinks' },
  ],
};

const CATS = ['All', 'Pizza', 'Burgers', 'Sushi', 'Desi', 'Mexican', 'Fast Food'];

// ─── ORDER TRACKER ────────────────────────────────────────
function OrderTracker({ order, onClose }) {
  const [step, setStep] = useState(0);
  const steps = ['Order Received', 'Being Prepared', 'Out for Delivery', 'Delivered'];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 2000),
      setTimeout(() => setStep(2), 5000),
      setTimeout(() => setStep(3), 9000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: 'var(--cust-card)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 420,
        border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Order Tracking</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cust-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 3 + 'rem', marginBottom: 8 }}>{['📋', '👨‍🍳', '🛵', '✅'][step]}</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{steps[step]}</div>
          <div style={{ color: 'var(--cust-muted)', fontSize: '0.88rem' }}>
            {['Your order has been confirmed!', 'Kitchen is preparing your food...', 'Your rider is on the way!', 'Enjoy your meal! 🎉'][step]}
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i <= step ? '#8de02c' : 'rgba(255,255,255,0.1)',
                color: i <= step ? '#000' : 'rgba(255,255,255,0.4)',
                fontWeight: 700, fontSize: '0.85rem',
                transition: 'all 0.5s ease'
              }}>{i < step ? '✓' : i + 1}</div>
              <div style={{ fontSize: '0.65rem', color: i <= step ? '#8de02c' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                {s.split(' ')[s.split(' ').length - 1]}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(141,224,44,0.08)', border: '1px solid rgba(141,224,44,0.2)',
          borderRadius: 12, padding: '12px 16px', marginTop: 20,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <Phone size={16} color="#8de02c" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Rider: Ahmed Khan</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--cust-muted)' }}>+92 300 1234567 · ETA 18 min</div>
          </div>
        </div>

        {step === 3 && (
          <button style={{
            width: '100%', marginTop: 16, padding: '13px',
            background: 'linear-gradient(135deg,#8de02c,#6bb81f)',
            border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem',
            cursor: 'pointer', color: '#000'
          }} onClick={onClose}>
            Rate Your Experience ⭐
          </button>
        )}
      </div>
    </div>
  );
}

// ─── RESTAURANT DETAIL ─────────────────────────────────────
function RestaurantDetail({ restaurant, cart, onAdd, onRemove, onBack, onCheckout }) {
  const [activeTab, setActiveTab] = useState('All');
  const items = MENU_ITEMS[restaurant.id] || [];
  const categories = ['All', ...new Set(items.map(i => i.category))];
  const filtered = activeTab === 'All' ? items : items.filter(i => i.category === activeTab);
  const cartCount = cart.reduce((s, i) => s + (i.restaurantId === restaurant.id ? i.qty : 0), 0);
  const cartTotal = cart.reduce((s, i) => s + (i.restaurantId === restaurant.id ? i.price * i.qty : 0), 0);

  const getQty = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.qty : 0;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cust-bg)', paddingBottom: 100 }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, #1a2840 0%, #0d1b2e 100%)`,
        padding: '20px 20px 60px', position: 'relative'
      }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: '8px 12px', color: 'white', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 600 }}>
          ← Back
        </button>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>{restaurant.image}</div>
        <h1 style={{ fontWeight: 900, fontSize: '1.6rem', color: 'white', marginBottom: 6 }}>{restaurant.name}</h1>
        <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>{restaurant.cuisine}</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ color: '#8de02c', fontWeight: 700 }}>⭐ {restaurant.rating}</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}><Clock size={13} style={{ verticalAlign: '-2px' }} /> {restaurant.deliveryTime} min</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>🚴 PKR {restaurant.deliveryFee}</span>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -24 }}>
        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, scrollbarWidth: 'none' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveTab(c)} style={{
              padding: '8px 16px', borderRadius: 20, border: 'none', whiteSpace: 'nowrap', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
              background: activeTab === c ? '#8de02c' : 'var(--cust-card)',
              color: activeTab === c ? '#000' : 'var(--cust-muted)',
              transition: 'all 0.2s'
            }}>{c}</button>
          ))}
        </div>

        {/* Menu items */}
        {filtered.map(item => {
          const qty = getQty(item.id);
          return (
            <div key={item.id} style={{
              background: 'var(--cust-card)', borderRadius: 16, padding: 16, marginBottom: 12,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                <div style={{ color: '#8de02c', fontWeight: 800 }}>PKR {item.price}</div>
              </div>
              {qty === 0 ? (
                <button onClick={() => onAdd({ ...item, restaurantId: restaurant.id })} style={{
                  background: 'linear-gradient(135deg,#8de02c,#6bb81f)', border: 'none', borderRadius: 10,
                  padding: '8px 16px', fontWeight: 700, cursor: 'pointer', color: '#000'
                }}>Add +</button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => onRemove(item.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => onAdd({ ...item, restaurantId: restaurant.id })} style={{ width: 30, height: 30, borderRadius: 8, background: '#8de02c', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--cust-muted)' }}>No items in this category</div>
        )}
      </div>

      {/* Sticky Checkout Bar */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed', bottom: 20, left: 16, right: 16,
          background: 'linear-gradient(135deg,#8de02c,#6bb81f)',
          borderRadius: 16, padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', boxShadow: '0 8px 30px rgba(141,224,44,0.4)', zIndex: 100
        }} onClick={onCheckout}>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '6px 12px', fontWeight: 800, color: '#000' }}>{cartCount}</div>
          <div style={{ fontWeight: 800, color: '#000' }}>Proceed to Checkout</div>
          <div style={{ fontWeight: 900, color: '#000' }}>PKR {cartTotal.toLocaleString()} →</div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN CUSTOMER APP ────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('welcome'); // welcome | careers | application | home | restaurant | b2b | checkout
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showTracker, setShowTracker] = useState(false);
  const [favorites, setFavorites] = useState([1, 4]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyStep, setApplyStep] = useState(1); // 1: form, 2: payment, 3: success

  const JOBS = [
    { id: 'J1', title: 'Customer Support Executive', type: 'Remote', company: 'GalaxyExpress (Platform)', salary: 'PKR 45K - 60K' },
    { id: 'J2', title: 'Platform Operations Manager', type: 'Full-time', company: 'GalaxyExpress (Platform)', salary: 'PKR 80K - 120K' },
    { id: 'J3', title: 'Delivery Rider', type: 'Contract', company: 'GalaxyExpress Fleet', salary: 'Performance Based' },
    { id: 'J4', title: 'Assistant Chef', type: 'Full-time', company: 'Pizza Palace (Vendor)', salary: 'PKR 35K - 50K' },
    { id: 'J5', title: 'Counter Cashier', type: 'Part-time', company: 'Burger Galaxy (Vendor)', salary: 'PKR 25K' },
  ];

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  };

  const totalCartItems = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = RESTAURANTS.filter(r => {
    const matchCat = category === 'All' || r.category === category;
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const placeOrder = async () => {
    try {
      const orderPayload = {
        type: 'DELIVERY',
        items: cart.map(i => ({ productId: i.id, quantity: i.qty, unitPrice: i.price, name: i.name })),
        subtotal: cart.reduce((s, i) => s + (i.price * i.qty), 0),
        totalAmount: cart.reduce((s, i) => s + (i.price * i.qty), 0) + 99, // adding mock delivery fee
        deliveryAddress: "Mock User Address"
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk'}/v1/tenant/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'galaxy-demo' // Adjust based on your Auth setup
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) throw new Error("Order failed to connect to DB");
      
      const data = await response.json();
      console.log("REAL ORDER SAVED IN DB:", data);
      
      setCart([]);
      setScreen('home');
      setShowTracker(true);
    } catch (err) {
      console.error(err);
      alert("Error placing real order: " + err.message + "\n(Falling back to mock UI for now!)");
      // Fallback so UI doesn't break during tests
      setCart([]);
      setScreen('home');
      setShowTracker(true);
    }
  };

  const toggleFav = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  // ─── WELCOME SCREEN ───
  if (screen === 'welcome') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2e 0%, #1a2840 100%)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ animation: 'float 3s ease-in-out infinite', fontSize: '5rem', marginBottom: 20 }}>🚀</div>
        <h1 style={{ fontWeight: 900, fontSize: '2.4rem', marginBottom: 12, background: 'linear-gradient(135deg, #8de02c, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          GalaxyExpress
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', marginBottom: 40, maxWidth: 300, lineHeight: 1.5 }}>
          Your ultimate destination for lightning-fast food delivery.
        </p>

        <button style={{ width: '100%', maxWidth: 300, padding: 18, background: 'linear-gradient(135deg,#8de02c,#6bb81f)', border: 'none', borderRadius: 16, color: '#000', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', marginBottom: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 30px rgba(141,224,44,0.3)' }} onClick={() => setScreen('home')}>
          <ShoppingCart size={20} /> Order Food Now
        </button>

        <div style={{ marginTop: 20 }}>
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', textDecoration: 'underline', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setScreen('careers')}>
            Join our team • Careers
          </button>
        </div>
      </div>
    );
  }

  // ─── CAREERS SCREEN ───
  if (screen === 'careers') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cust-bg)', color: 'var(--cust-text)', padding: '24px 16px', paddingBottom: 80 }}>
        <button onClick={() => setScreen('welcome')} style={{ background: 'none', border: 'none', color: 'var(--cust-muted)', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>← Back to Welcome</button>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💼</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: 8 }}>Join The Galaxy Team</h1>
          <p style={{ color: 'var(--cust-muted)', fontSize: '0.9rem' }}>Apply for roles at the platform or our partner vendors.</p>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          {JOBS.map(j => (
            <div key={j.id} style={{ background: 'var(--cust-card)', borderRadius: 16, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 4 }}>{j.title}</div>
                  <div style={{ color: '#8de02c', fontSize: '0.85rem', fontWeight: 700 }}>{j.company}</div>
                </div>
                <span style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>{j.type}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--cust-muted)', marginBottom: 16 }}>💰 {j.salary}</div>
              <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(141,224,44,0.5)', borderRadius: 10, color: '#8de02c', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => { setSelectedJob(j); setApplyStep(1); setScreen('application'); }}>
                Apply for this Role
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── JOB APPLICATION & PAYMENT SCREEN ───
  if (screen === 'application' && selectedJob) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cust-bg)', color: 'var(--cust-text)', padding: '24px 16px', paddingBottom: 80 }}>
        <button onClick={() => setScreen('careers')} style={{ background: 'none', border: 'none', color: 'var(--cust-muted)', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>← Cancel Application</button>
        
        <div style={{ background: 'rgba(141,224,44,0.08)', border: '1px solid rgba(141,224,44,0.2)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--cust-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Applying For</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedJob.title}</div>
          <div style={{ color: '#8de02c', fontWeight: 700, fontSize: '0.85rem' }}>{selectedJob.company}</div>
        </div>

        {applyStep === 1 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Applicant Details</h2>
            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              <input type="text" placeholder="Full Name" style={{ width: '100%', padding: 14, background: 'var(--cust-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', boxSizing: 'border-box' }} />
              <input type="email" placeholder="Email Address" style={{ width: '100%', padding: 14, background: 'var(--cust-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', boxSizing: 'border-box' }} />
              <input type="tel" placeholder="Phone Number" style={{ width: '100%', padding: 14, background: 'var(--cust-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', boxSizing: 'border-box' }} />
              
              <div style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 12, padding: 24, textAlign: 'center', background: 'var(--cust-card)', cursor: 'pointer' }}>
                <UploadCloud size={24} color="#8de02c" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Upload Resume (PDF)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--cust-muted)' }}>Max file size 5MB</div>
              </div>

              <div style={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 12, padding: 24, textAlign: 'center', background: 'var(--cust-card)', cursor: 'pointer' }}>
                <Camera size={24} color="var(--cust-muted)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Upload Photo</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--cust-muted)' }}>Professional headshot</div>
              </div>

              <textarea placeholder="Cover Letter / Why should we hire you?" rows={4} style={{ width: '100%', padding: 14, background: 'var(--cust-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none' }}></textarea>
            </div>
            <button style={{ width: '100%', padding: 16, background: '#8de02c', border: 'none', borderRadius: 12, color: '#000', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }} onClick={() => setApplyStep(2)}>
              Continue to Payment →
            </button>
          </div>
        )}

        {applyStep === 2 && (
          <div style={{ animation: 'slideInRight 0.3s' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>Application Fee</h2>
            <p style={{ color: 'var(--cust-muted)', fontSize: '0.9rem', marginBottom: 20 }}>A non-refundable processing fee is required to submit your application to {selectedJob.company}.</p>
            
            <div style={{ background: 'var(--cust-card)', borderRadius: 16, padding: 24, textAlign: 'center', border: '1px solid rgba(141,224,44,0.3)', marginBottom: 24 }}>
               <div style={{ fontSize: '0.9rem', color: 'var(--cust-muted)', marginBottom: 4 }}>Total Due</div>
               <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#8de02c' }}>PKR 50</div>
            </div>

            <div style={{ background: 'var(--cust-card)', borderRadius: 16, padding: 16, marginBottom: 24 }}>
               <div style={{ fontWeight: 700, marginBottom: 16 }}>Pay securely via Credit Card</div>
               <div style={{ display: 'grid', gap: 12 }}>
                 <input type="text" placeholder="Cardholder Name" style={{ width: '100%', padding: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', boxSizing: 'border-box' }} />
                 <input type="text" placeholder="Card Number" style={{ width: '100%', padding: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', boxSizing: 'border-box' }} />
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                   <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', boxSizing: 'border-box' }} />
                   <input type="text" placeholder="CVC" style={{ width: '100%', padding: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', boxSizing: 'border-box' }} />
                 </div>
               </div>
            </div>

            <button style={{ width: '100%', padding: 16, background: '#8de02c', border: 'none', borderRadius: 12, color: '#000', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }} onClick={() => { setTimeout(() => setApplyStep(3), 1500); }}>
              <CreditCard size={18} /> Pay PKR 50 & Submit
            </button>
          </div>
        )}

        {applyStep === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 0', animation: 'scaleIn 0.3s' }}>
            <CheckCircle size={60} color="#8de02c" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 12 }}>Application Submitted!</h2>
            <p style={{ color: 'var(--cust-muted)', fontSize: '0.95rem', marginBottom: 30, maxWidth: 300, margin: '0 auto 30px' }}>
              Your application for <b>{selectedJob.title}</b> has been received. Our HR team will contact you soon.
            </p>
            <button style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, cursor: 'pointer' }} onClick={() => setScreen('welcome')}>
              Return to Welcome Screen
            </button>
          </div>
        )}
      </div>
    );
  }

  // Restaurant screen
  if (screen === 'restaurant' && activeRestaurant) {

    return (
      <>
        {showTracker && <OrderTracker order={{}} onClose={() => setShowTracker(false)} />}
        <RestaurantDetail
          restaurant={activeRestaurant} cart={cart}
          onAdd={addToCart} onRemove={removeFromCart}
          onBack={() => setScreen('home')}
          onCheckout={() => setScreen('checkout')}
        />
      </>
    );
  }

  // Checkout screen
  if (screen === 'checkout') {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = 50;
    const total = subtotal + delivery;
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cust-bg)', color: 'var(--cust-text)' }}>
        {showTracker && <OrderTracker order={{}} onClose={() => setShowTracker(false)} />}
        <div style={{ padding: '24px 16px' }}>
          <button onClick={() => setScreen('restaurant')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cust-muted)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem', fontWeight: 600 }}>
            ← Back to Menu
          </button>
          <h1 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 24 }}>Your Order</h1>

          {/* Cart Items */}
          {cart.map(item => (
            <div key={item.id} style={{ background: 'var(--cust-card)', borderRadius: 14, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.name}</div>
                <div style={{ color: 'var(--cust-muted)', fontSize: '0.85rem' }}>{item.qty} × PKR {item.price}</div>
              </div>
              <div style={{ fontWeight: 800, color: '#8de02c' }}>PKR {item.price * item.qty}</div>
            </div>
          ))}

          {/* Totals */}
          <div style={{ background: 'var(--cust-card)', borderRadius: 14, padding: 16, margin: '16px 0' }}>
            {[['Subtotal', `PKR ${subtotal.toLocaleString()}`], ['Delivery Fee', `PKR ${delivery}`], ['Total', `PKR ${total.toLocaleString()}`]].map(([l, v], i) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontWeight: i === 2 ? 800 : 400, fontSize: i === 2 ? '1.05rem' : '0.9rem', borderTop: i === 2 ? '1px solid rgba(255,255,255,0.08)' : undefined, marginTop: i === 2 ? 8 : undefined, paddingTop: i === 2 ? 12 : undefined }}>
                <span>{l}</span><span style={{ color: i === 2 ? '#8de02c' : undefined }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Payment */}
          <div style={{ background: 'var(--cust-card)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Payment Method</div>
            {['Cash on Delivery', 'JazzCash', 'Easypaisa'].map((m, i) => (
              <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', cursor: 'pointer', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                <input type="radio" name="payment" defaultChecked={i === 0} style={{ accentColor: '#8de02c' }} />
                <span style={{ fontWeight: 500 }}>{m}</span>
              </label>
            ))}
          </div>

          <button style={{
            width: '100%', padding: 16,
            background: 'linear-gradient(135deg,#8de02c,#6bb81f)',
            border: 'none', borderRadius: 14, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', color: '#000',
            boxShadow: '0 8px 24px rgba(141,224,44,0.3)'
          }} onClick={placeOrder}>
            Place Order · PKR {total.toLocaleString()}
          </button>
        </div>
      </div>
    );
  }

  // B2B Portal
  if (screen === 'b2b') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cust-bg)', color: 'var(--cust-text)', padding: '24px 16px', paddingBottom: 80 }}>
        <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', color: 'var(--cust-muted)', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>← Back</button>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🏢</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: 8 }}>B2B Wholesale Portal</h1>
          <p style={{ color: 'var(--cust-muted)', fontSize: '0.9rem' }}>Bulk ordering for businesses — minimum orders apply</p>
        </div>
        {RESTAURANTS.map(r => (
          <div key={r.id} style={{ background: 'var(--cust-card)', borderRadius: 16, padding: 18, marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: '1.8rem' }}>{r.image}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  <div style={{ color: 'var(--cust-muted)', fontSize: '0.8rem' }}>{r.cuisine}</div>
                </div>
              </div>
              <span style={{ background: 'rgba(141,224,44,0.12)', color: '#8de02c', borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>B2B</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', color: 'var(--cust-muted)', marginBottom: 12 }}>
              <span>Min. Order: PKR {r.minOrder * 5}</span>
              <span>⭐ {r.rating}</span>
            </div>
            <button style={{
              width: '100%', padding: '10px', background: 'transparent',
              border: '1px solid rgba(141,224,44,0.3)', borderRadius: 10,
              color: '#8de02c', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}>Request Bulk Quote →</button>
          </div>
        ))}
      </div>
    );
  }

  // ─── HOME SCREEN ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cust-bg)', color: 'var(--cust-text)', paddingBottom: 80 }}>
      {showTracker && <OrderTracker order={{}} onClose={() => setShowTracker(false)} />}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#0d1b2e 0%,#1a2840 100%)',
        padding: '20px 16px 28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 2 }}>Delivering to</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'white' }}>
              <MapPin size={14} color="#8de02c" />Gulshan-e-Iqbal, Karachi
            </div>
          </div>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowTracker(true)}>
            <Bell size={22} color="rgba(255,255,255,0.7)" />
            <div style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></div>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              placeholder="Search restaurants, food…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 36px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, color: 'white', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* ── B2B Banner ── */}
        <div
          onClick={() => setScreen('b2b')}
          style={{
            background: 'linear-gradient(135deg,#1e3a5f,#0d2640)',
            borderRadius: 16, padding: 16, margin: '16px 0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer', border: '1px solid rgba(14,165,233,0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><Briefcase size={20} color="white" /></div>
            <div>
              <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>B2B Wholesale Portal</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>Bulk orders for businesses</div>
            </div>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0 12px', scrollbarWidth: 'none' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '8px 16px', borderRadius: 20, border: 'none',
              background: category === c ? '#8de02c' : 'var(--cust-card)',
              color: category === c ? '#000' : 'var(--cust-muted)',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.18s'
            }}>{c}</button>
          ))}
        </div>

        {/* Featured restaurants */}
        <div style={{ marginBottom: 8, fontWeight: 800, fontSize: '1.1rem' }}>
          {search ? `Results for "${search}"` : category === 'All' ? '🔥 Popular Near You' : `${category} Restaurants`}
        </div>

        {filtered.map(r => (
          <div key={r.id}
            onClick={() => { setActiveRestaurant(r); setScreen('restaurant'); }}
            style={{
              background: 'var(--cust-card)', borderRadius: 18, marginBottom: 14,
              overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)',
              transition: 'transform 0.15s', boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Image area */}
            <div style={{
              height: 140,
              background: `linear-gradient(135deg, #1a2840, #0d1b2e)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '4rem', position: 'relative'
            }}>
              {r.image}
              {r.tag && (
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(141,224,44,0.9)', color: '#000',
                  borderRadius: 8, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 800
                }}>{r.tag}</div>
              )}
              <button
                onClick={e => { e.stopPropagation(); toggleFav(r.id); }}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 10,
                  padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Heart size={16} fill={favorites.includes(r.id) ? '#ef4444' : 'none'} color={favorites.includes(r.id) ? '#ef4444' : 'rgba(255,255,255,0.7)'} />
              </button>
            </div>

            {/* Info */}
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{r.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8de02c', fontWeight: 700, fontSize: '0.88rem' }}>
                  <Star size={13} fill="#8de02c" />  {r.rating}
                </div>
              </div>
              <div style={{ color: 'var(--cust-muted)', fontSize: '0.8rem', marginBottom: 10 }}>{r.cuisine}</div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--cust-muted)' }}>
                <span><Clock size={11} style={{ verticalAlign: '-1px' }} /> {r.deliveryTime} min</span>
                <span><Truck size={11} style={{ verticalAlign: '-1px' }} /> PKR {r.deliveryFee} delivery</span>
                <span><MapPin size={11} style={{ verticalAlign: '-1px' }} /> {r.distance}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--cust-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <div style={{ fontWeight: 700 }}>No restaurants found</div>
            <div style={{ fontSize: '0.85rem', marginTop: 6 }}>Try a different search term</div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,15,28,0.97)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-around', padding: '10px 0 6px',
        zIndex: 50
      }}>
        {[
          { icon: Home, label: 'Home', id: 'home' },
          { icon: Search, label: 'Search', id: 'search' },
          { icon: ShoppingCart, label: `Cart${totalCartItems > 0 ? ` (${totalCartItems})` : ''}`, id: 'cart' },
          { icon: Briefcase, label: 'Careers', id: 'careers' },
          { icon: User, label: 'Profile', id: 'profile' },
        ].map(nav => (
          <div key={nav.id} onClick={() => nav.id === 'careers' ? setScreen('careers') : null} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', minWidth: 50 }}>
            <nav.icon size={22} color={nav.id === 'home' ? '#8de02c' : 'rgba(255,255,255,0.4)'} />
            <div style={{ fontSize: '0.65rem', color: nav.id === 'home' ? '#8de02c' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{nav.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
