import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ShoppingBag } from 'lucide-react';

const MOCK_MENU = [
  { id: 1, name: 'Double Smash Burger', price: 14.99, category: 'Burgers' },
  { id: 2, name: 'Spicy Chicken Sando', price: 12.99, category: 'Burgers' },
  { id: 3, name: 'Truffle Fries', price: 6.99, category: 'Sides' },
  { id: 4, name: 'Onion Rings', price: 5.99, category: 'Sides' },
  { id: 5, name: 'Vanilla Shake', price: 4.99, category: 'Drinks' },
  { id: 6, name: 'Iced Lemonade', price: 3.99, category: 'Drinks' },
];

export default function App() {
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Burgers');

  useEffect(() => {
    gsap.fromTo('.product-card', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' });
  }, [category]);

  // FIX: Group cart items instead of duplicating
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    const btn = document.querySelector('.btn-checkout');
    if (btn) gsap.fromTo(btn, { scale: 1.05 }, { scale: 1, duration: 0.2 });
  };

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="kiosk-layout">
      <header className="kiosk-header">🍔 ORDER HERE</header>

      <div className="kiosk-content">
        <div className="kiosk-categories">
          {['Burgers', 'Sides', 'Drinks'].map(c => (
            <button key={c} className={`cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>

        <div className="product-grid">
          {MOCK_MENU.filter(m => m.category === category).map(prod => (
            <div key={prod.id} className="product-card" onClick={() => addToCart(prod)}>
              <div style={{ width: '100%', height: '200px', background: '#222', borderRadius: '16px', marginBottom: '20px' }}></div>
              <div className="product-name">{prod.name}</div>
              <div className="product-price">${prod.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="kiosk-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ShoppingBag size={48} color="var(--neon-orange)" />
          <div>
            <div style={{ fontSize: '1.5rem', color: '#888' }}>{totalQty} ITEMS</div>
            <div className="cart-total">${total.toFixed(2)}</div>
          </div>
        </div>
        <button className="btn-checkout" onClick={() => { if (cart.length) { alert(`Order #${Math.floor(Math.random()*9000+1000)} — Proceed to Payment Terminal!`); setCart([]); } }}>
          PAY NOW 💳
        </button>
      </footer>
    </div>
  );
}
