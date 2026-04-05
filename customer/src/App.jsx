import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ShoppingBag, ChevronRight, Star, Clock, MapPin } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';

const MENU = [
  { id: 1, name: 'Neon Burger', desc: 'Double patty, glowing secret sauce, brioche bun.', price: 12.99, cat: 'Burgers' },
  { id: 2, name: 'Cyber Fries', desc: 'Crispy fries with digital dust seasoning.', price: 5.99, cat: 'Sides' },
  { id: 3, name: 'Plasma Shake', desc: 'Electrifying berry blast.', price: 6.99, cat: 'Drinks' },
  { id: 4, name: 'Nebula Wings', desc: 'Smoky charcoal-grilled wings.', price: 10.99, cat: 'Starters' },
  { id: 5, name: 'Galaxy Bowl', desc: 'Acai, granola, fresh fruits.', price: 9.50, cat: 'Desserts' },
  { id: 6, name: 'Quantum Cola', desc: 'Zero sugar sparkling.', price: 3.50, cat: 'Drinks' },
];

const CATS = ['All', 'Starters', 'Burgers', 'Sides', 'Drinks', 'Desserts'];

export default function App() {
  const [active, setActive] = useState('All');
  const [cart, setCart] = useState([]);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    gsap.fromTo('.menu-item', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
  }, [active]);

  // FIX: Group items instead of duplicating
  const add = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    gsap.fromTo('.floating-cart', { scale: 0.95 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
  };

  const filtered = active === 'All' ? MENU : MENU.filter(m => m.cat === active);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const placeOrder = () => {
    setShowTracker(true);
    setCart([]);
    gsap.fromTo('.tracker-popup', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' });
  };

  return (
    <div className="mobile-app">
      <header className="hero-header">
        <div className="hero-title">Neon Bites</div>
        <div className="hero-subtitle"><MapPin size={14} style={{ verticalAlign: '-2px' }}/> Table 12 • Dine-in</div>
      </header>

      <div className="scroll-categories">
        {CATS.map(c => (
          <div key={c} className={`chip ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>{c}</div>
        ))}
      </div>

      <div className="menu-list">
        {filtered.map(item => (
          <div key={item.id} className="menu-item">
            <div className="img-placeholder"></div>
            <div className="item-details">
              <div className="item-title">{item.name}</div>
              <div className="item-desc">{item.desc}</div>
              <div className="item-price">${item.price.toFixed(2)}</div>
            </div>
            <button className="add-btn" onClick={() => add(item)}>+</button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="floating-cart" onClick={placeOrder}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: 12, fontWeight: 'bold' }}>{totalQty}</div>
            <div style={{ fontWeight: 'bold' }}>Place Order</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, fontSize: '1.2rem' }}>
            ${total.toFixed(2)} <ChevronRight />
          </div>
        </div>
      )}

      {/* Order Tracker Popup */}
      {showTracker && (
        <div className="floating-cart tracker-popup" style={{ flexDirection: 'column', gap: 12, alignItems: 'stretch' }} onClick={() => setShowTracker(false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>🎉 Order Placed!</div>
            <Clock size={18}/>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ opacity: 1 }}>✅ Received</span>
            <span style={{ opacity: 0.5 }}>👨‍🍳 Preparing</span>
            <span style={{ opacity: 0.3 }}>🍽️ Ready</span>
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Tap to dismiss</div>
        </div>
      )}
    </div>
  );
}
