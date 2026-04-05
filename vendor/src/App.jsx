import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { LayoutDashboard, Package, ShoppingBag, DollarSign, LogOut } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      if (!['VENDOR', 'SUPER_ADMIN', 'TENANT_ADMIN'].includes(data.user.role)) { setError('Access denied. Vendor role required.'); setLoading(false); return; }
      localStorage.setItem('erp_token', data.token); localStorage.setItem('erp_user', JSON.stringify(data.user));
      onLogin(data);
    } catch { setError('Network error'); setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand"><div className="login-brand-icon">🏪</div><h1>Vendor Portal</h1><p>Marketplace dashboard</p></div>
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

// ============ VENDOR DASHBOARD ============
function VendorDashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    gsap.fromTo('.glass-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' });
  }, [page]);

  const PRODUCTS = [
    { id: 1, name: 'Organic Flour 50kg', price: 45.00, stock: 120, status: 'Active' },
    { id: 2, name: 'Premium Olive Oil 5L', price: 22.50, stock: 80, status: 'Active' },
    { id: 3, name: 'Fresh Tomatoes Box', price: 15.00, stock: 0, status: 'Out of Stock' },
  ];

  const ORDERS = [
    { id: 'VO-001', buyer: 'Al-Madina Grill', items: 3, total: 135.00, status: 'Delivered', date: '2026-04-03' },
    { id: 'VO-002', buyer: 'Burger Galaxy', items: 5, total: 225.00, status: 'Processing', date: '2026-04-04' },
  ];

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
    { id: 'products', label: 'Products', icon: <Package size={18}/> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={18}/> },
    { id: 'payouts', label: 'Payouts', icon: <DollarSign size={18}/> },
  ];

  return (
    <div className="vendor-layout">
      <aside className="sidebar">
        <div className="brand">🏪 Vendor Hub</div>
        {NAV.map(n => <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>{n.icon} {n.label}</div>)}
        <div style={{ marginTop: 'auto' }} className="nav-item" onClick={onLogout}><LogOut size={18}/> Logout</div>
      </aside>

      <main className="main-content">
        {page === 'dashboard' && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: 30 }}>Welcome, {user.name}</h1>
            <div className="stat-grid">
              <div className="glass-card"><div className="stat-label">Total Products</div><div className="stat-value">3</div></div>
              <div className="glass-card"><div className="stat-label">Total Orders</div><div className="stat-value">24</div></div>
              <div className="glass-card"><div className="stat-label">Revenue</div><div className="stat-value">$2,840</div></div>
              <div className="glass-card"><div className="stat-label">Commission (10%)</div><div className="stat-value">$284</div></div>
            </div>
          </>
        )}

        {page === 'products' && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: 30 }}>My Products</h1>
            <div className="table-container"><table><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead><tbody>
              {PRODUCTS.map(p => <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.name}</td><td>${p.price.toFixed(2)}</td><td>{p.stock}</td><td><span className="badge badge-green">{p.status}</span></td></tr>)}
            </tbody></table></div>
          </>
        )}

        {page === 'orders' && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: 30 }}>Orders Received</h1>
            <div className="table-container"><table><thead><tr><th>Order #</th><th>Buyer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>
              {ORDERS.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.buyer}</td><td>{o.items}</td><td>${o.total.toFixed(2)}</td><td><span className="badge badge-green">{o.status}</span></td><td style={{ color: 'var(--text-muted)' }}>{o.date}</td></tr>)}
            </tbody></table></div>
          </>
        )}

        {page === 'payouts' && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: 30 }}>Payouts</h1>
            <div className="glass-card" style={{ maxWidth: 500 }}>
              <div className="stat-label">Pending Payout</div>
              <div className="stat-value" style={{ marginBottom: 20 }}>$1,420.00</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Commission (10%): $142.00 auto-deducted</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Net Payout: $1,278.00</div>
            </div>
          </>
        )}
      </main>
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
    if (token && saved) { try { const p = JSON.parse(atob(token.split('.')[1])); if (p.exp * 1000 > Date.now()) { setUser(JSON.parse(saved)); setAuthed(true); } } catch {} }
  }, []);

  const logout = () => { localStorage.removeItem('erp_token'); localStorage.removeItem('erp_user'); setAuthed(false); setUser(null); };
  if (!authed) return <LoginScreen onLogin={d => { setUser(d.user); setAuthed(true); }} />;
  return <VendorDashboard user={user} onLogout={logout} />;
}
