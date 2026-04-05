import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { Utensils, Bell, LogOut, X, ChefHat } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TABLES = [
  { id: 1, name: 'T1', seats: 4, status: 'FREE' },
  { id: 2, name: 'T2', seats: 2, status: 'OCCUPIED' },
  { id: 3, name: 'T3', seats: 6, status: 'FREE' },
  { id: 4, name: 'T4', seats: 4, status: 'FREE' },
  { id: 5, name: 'T5', seats: 2, status: 'OCCUPIED' },
  { id: 6, name: 'T6', seats: 8, status: 'FREE' },
  { id: 7, name: 'T7', seats: 4, status: 'FREE' },
  { id: 8, name: 'T8', seats: 2, status: 'OCCUPIED' },
];

const MENU = [
  { id: 1, name: 'Steak Frites', price: 25, category: 'Mains' },
  { id: 2, name: 'Caesar Salad', price: 12, category: 'Starters' },
  { id: 3, name: 'Craft Beer', price: 8, category: 'Drinks' },
  { id: 4, name: 'Latte', price: 5, category: 'Drinks' },
  { id: 5, name: 'Grilled Salmon', price: 28, category: 'Mains' },
  { id: 6, name: 'Bruschetta', price: 9, category: 'Starters' },
];

// ============ LOGIN ============
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo('.login-container', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'WAITER'].includes(data.user.role)) { setError('Access denied. Waiter role required.'); setLoading(false); return; }
      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      onLogin(data);
    } catch { setError('Network error'); setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand"><div className="login-brand-icon">🍽️</div><h1>WaiterPad</h1><p>Table service login</p></div>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Password</label><input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}

// ============ WAITER APP ============
function WaiterApp({ user, onLogout }) {
  const [activeTable, setActiveTable] = useState(null);
  const [order, setOrder] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    gsap.fromTo('.table-card', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(2)' });
  }, []);

  const openTable = (t) => {
    setActiveTable(t);
    setOrder([]);
    setShowPanel(true);
    // Animate AFTER setting showPanel=true so the element exists in DOM
    requestAnimationFrame(() => {
      gsap.fromTo('.order-panel', { y: '100%' }, { y: '0%', duration: 0.4, ease: 'power3.out' });
    });
  };

  const closeTable = () => {
    gsap.to('.order-panel', { y: '100%', duration: 0.3, ease: 'power3.in', onComplete: () => { setShowPanel(false); setActiveTable(null); } });
  };

  const addToOrder = (item) => {
    setOrder(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const sendToKitchen = async () => {
    const token = localStorage.getItem('erp_token');
    const total = order.reduce((s, i) => s + i.price * i.qty, 0);
    try {
      await fetch(`${API}/api/pos/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          outletId: 'OUTLET_1',
          type: 'DINE_IN',
          items: order.map(i => ({ productId: String(i.id), quantity: i.qty, unitPrice: i.price })),
          payments: [{ method: 'CASH', amount: total, status: 'PENDING' }],
          totalAmount: total,
          taxAmount: total * 0.10,
          discount: 0
        })
      });
    } catch {}
    closeTable();
  };

  const orderTotal = order.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="waiter-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem', fontWeight: 'bold' }}>
          <Utensils size={22}/> WaiterPad
          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--accent-color)' }}>— {user.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Bell color="var(--accent-color)" />
          <button className="close-btn" onClick={onLogout} style={{ padding: '6px 12px' }}><LogOut size={16}/></button>
        </div>
      </header>

      <main className="content">
        <h2 style={{ marginBottom: 20, color: 'var(--accent-color)' }}>Floor Plan</h2>
        <div className="table-grid">
          {TABLES.map(t => (
            <div key={t.id} className={`table-card ${t.status.toLowerCase()}`} onClick={() => openTable(t)}>
              <div className="table-name">{t.name}</div>
              <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: 8 }}>{t.seats} seats</div>
              <div className="table-status">{t.status}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Slide-up order panel — only rendered when showPanel is true (fixes GSAP bug) */}
      {showPanel && (
        <div className="order-panel" style={{ transform: 'translateY(100%)' }}>
          <div className="order-header">
            <h2><ChefHat size={20} style={{ verticalAlign: '-4px', marginRight: 8 }}/>{activeTable?.name} — New Order</h2>
            <button className="close-btn" onClick={closeTable}><X size={16}/> Cancel</button>
          </div>
          <div className="menu-grid">
            {MENU.map(item => (
              <div key={item.id} className="menu-item" onClick={() => addToOrder(item)}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.category}</div>
                </div>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>${item.price}</span>
              </div>
            ))}
          </div>
          {order.length > 0 && (
            <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {order.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
                  <span>{i.qty}x {i.name}</span><span>${(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                <span>Total</span><span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
          <button className="send-kitchen-btn" onClick={sendToKitchen}>
            🔥 SEND TO KITCHEN ({order.reduce((s, i) => s + i.qty, 0)} items — ${orderTotal.toFixed(2)})
          </button>
        </div>
      )}
    </div>
  );
}

// ============ MAIN ============
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const saved = localStorage.getItem('erp_user');
    if (token && saved) {
      try { const p = JSON.parse(atob(token.split('.')[1])); if (p.exp * 1000 > Date.now()) { setUser(JSON.parse(saved)); setAuthed(true); } } catch {}
    }
  }, []);

  const logout = () => { localStorage.removeItem('erp_token'); localStorage.removeItem('erp_user'); setAuthed(false); setUser(null); };

  if (!authed) return <LoginScreen onLogin={d => { setUser(d.user); setAuthed(true); }} />;
  return <WaiterApp user={user} onLogout={logout} />;
}
