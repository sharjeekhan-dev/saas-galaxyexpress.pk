import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import gsap from 'gsap';
import { Search, Plus, Minus, Receipt, LogOut } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';
const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Neon Burger', category: 'Fast Food', price: 12.99 },
  { id: 'p2', name: 'Cyber Fries', category: 'Fast Food', price: 5.99 },
  { id: 'p3', name: 'Quantum Cola', category: 'Drinks', price: 3.50 },
  { id: 'p4', name: 'Plasma Pizza', category: 'Main Course', price: 16.00 },
  { id: 'p5', name: 'Holo Salad', category: 'Starters', price: 8.50 },
  { id: 'p6', name: 'Galactic Shake', category: 'Desserts', price: 6.50 },
  { id: 'p7', name: 'Nebula Wings', category: 'Starters', price: 10.99 },
  { id: 'p8', name: 'Solar Wrap', category: 'Main Course', price: 13.50 },
];
const CATEGORIES = ['All', 'Starters', 'Fast Food', 'Main Course', 'Drinks', 'Desserts'];

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
    
    // UI DEMO BYPASS
    setTimeout(() => {
      const mockUser = { id: 'pos_cashier', name: 'Terminal Cashier', role: 'CASHIER', email: email };
      localStorage.setItem('erp_token', 'mock_token_123');
      localStorage.setItem('erp_user', JSON.stringify(mockUser));
      onLogin({ user: mockUser });
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand"><div className="login-brand-icon">💳</div><h1>POS Terminal</h1><p>Point of Sale Login</p></div>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input className="form-input" type="email" placeholder="cashier@store.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Password</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Start Shift'}</button>
        </form>
      </div>
    </div>
  );
}

// ============ RECEIPT MODAL ============
function ReceiptModal({ invoice, onClose }) {
  useEffect(() => {
    gsap.fromTo('.receipt-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo('.receipt-card', { scale: 0.9, y: 30 }, { scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' });
  }, []);

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-card" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-color)', paddingBottom: 16, marginBottom: 16 }}>
          <h2>{invoice.company}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{invoice.outlet}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{invoice.invoiceNumber}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(invoice.date).toLocaleString()}</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          {invoice.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>{item.qty}x {item.name}</span>
              <span>${item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: 16 }}>
          <div className="total-row"><span>Subtotal</span><span>${invoice.subtotal.toFixed(2)}</span></div>
          <div className="total-row"><span>Tax</span><span>${invoice.tax.toFixed(2)}</span></div>
          {invoice.discount > 0 && <div className="total-row"><span>Discount</span><span>-${invoice.discount.toFixed(2)}</span></div>}
          <div className="total-row grand-total"><span>TOTAL</span><span>${invoice.total.toFixed(2)}</span></div>
          <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Payment: {invoice.payments.map(p => p.method).join(', ')}
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 20 }}>
          <button className="btn-outline" onClick={() => window.print()} style={{ padding: '8px', fontSize: '0.9rem' }}>🖨️ Thermal Print</button>
          <button className="btn-outline" onClick={() => window.print()} style={{ padding: '8px', fontSize: '0.9rem' }}>📄 PDF Invoice</button>
          <button className="btn-outline" onClick={() => alert('Exporting to Excel...')} style={{ padding: '8px', fontSize: '0.9rem', gridColumn: 'span 2' }}>📊 Export to Excel</button>
        </div>
        
        <button className="btn-primary checkout-btn" onClick={onClose} style={{ marginTop: 12 }}>Close Receipt & Next Order</button>
      </div>
    </div>
  );
}

// ============ POS TERMINAL ============
function POSTerminal({ user, onLogout }) {
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('DINE_IN');
  const [socket, setSocket] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const cartRef = useRef();
  const token = localStorage.getItem('erp_token');

  useEffect(() => {
    gsap.fromTo('.pos-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    gsap.fromTo('.cart-sidebar', { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });

    // Try to load real products from API
    fetch(`${API}/api/pos/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data) && data.length > 0) setProducts(data); }).catch(() => {});

    // Socket
    const s = io(API);
    setSocket(s);
    s.on('connect', () => { s.emit('join_room', { tenantId: user.tenantId, outletId: 'OUTLET_1' }); });
    return () => s.close();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
    gsap.fromTo(cartRef.current, { scale: 1.02 }, { scale: 1, duration: 0.2 });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) { const n = item.qty + delta; return n > 0 ? { ...item, qty: n } : null; }
      return item;
    }).filter(Boolean));
  };

  const clearCart = () => setCart([]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    const orderPayload = {
      outletId: 'OUTLET_1',
      type: orderType,
      items: cart.map(i => ({ productId: i.id, quantity: i.qty, unitPrice: i.price, notes: '' })),
      payments: [{ method: 'CASH', amount: total, status: 'PAID' }],
      totalAmount: total,
      taxAmount: tax,
      discount: 0
    };

    try {
      // POST to API — this actually saves the order to the database
      const res = await fetch(`${API}/api/pos/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload)
      });
      const order = await res.json();

      if (res.ok && order.id) {
        // Fetch invoice data for receipt
        const invRes = await fetch(`${API}/api/pos/orders/${order.id}/invoice`, { headers: { Authorization: `Bearer ${token}` } });
        const invoice = await invRes.json();
        setReceipt(invoice);
      } else {
        // Fallback: show local receipt
        setReceipt({
          invoiceNumber: `INV-LOCAL-${Date.now()}`,
          date: new Date().toISOString(),
          company: 'SaaS ERP Store',
          outlet: 'Outlet 1',
          cashier: user.name,
          type: orderType,
          items: cart.map(i => ({ name: i.name, qty: i.qty, unitPrice: i.price, total: i.qty * i.price })),
          subtotal, tax, discount: 0, total,
          payments: [{ method: 'CASH', amount: total }]
        });
      }
    } catch {
      // Offline fallback
      setReceipt({
        invoiceNumber: `INV-OFFLINE-${Date.now()}`,
        date: new Date().toISOString(),
        company: 'SaaS ERP Store',
        outlet: 'Outlet 1',
        cashier: user.name,
        items: cart.map(i => ({ name: i.name, qty: i.qty, unitPrice: i.price, total: i.qty * i.price })),
        subtotal, tax, discount: 0, total,
        payments: [{ method: 'CASH', amount: total }]
      });
    }
    clearCart();
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  return (
    <>
      <div className="pos-layout">
        <div className="main-content">
          <header className="pos-header glass-panel" style={{ padding: 20 }}>
            <div>
              <h1 style={{ marginBottom: 4 }}>Terminal.</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.name} — {user.role}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="text" className="search-bar" placeholder="Search items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button className="btn-outline" onClick={onLogout} style={{ padding: '10px 14px' }}><LogOut size={18}/></button>
            </div>
          </header>

          <div className="category-list">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`category-chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>

          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card glass-panel" onClick={() => addToCart(product)}>
                <div className="product-name">{product.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>{product.category}</div>
                <div className="product-price">${product.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="cart-sidebar glass-panel" ref={cartRef}>
          <div className="cart-header">
            Current Order
            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={clearCart}>Clear</button>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['DINE_IN', 'TAKEAWAY', 'DELIVERY'].map(t => (
              <button key={t} className={`btn-outline ${orderType === t ? 'btn-primary' : ''}`} style={{ flex: 1, fontSize: '0.85rem', padding: '8px 6px' }} onClick={() => setOrderType(t)}>
                {t === 'DINE_IN' ? 'Dine-in' : t === 'TAKEAWAY' ? 'Takeaway' : 'Delivery'}
              </button>
            ))}
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>Cart is empty</div>
            ) : cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info"><span className="cart-item-title">{item.name}</span><span className="cart-item-price">${(item.price * item.qty).toFixed(2)}</span></div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={14}/></button>
                  <span style={{ width: 24, textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={14}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-totals">
            <div className="total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="total-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="total-row grand-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button className="btn-primary checkout-btn" onClick={handleCheckout}>
              <Receipt size={20} style={{ verticalAlign: 'middle', marginRight: 8 }}/> Checkout & Pay
            </button>
          </div>
        </aside>
      </div>

      {receipt && <ReceiptModal invoice={receipt} onClose={() => setReceipt(null)} />}
    </>
  );
}

// ============ APP ============
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

  const handleLogout = () => { localStorage.removeItem('erp_token'); localStorage.removeItem('erp_user'); setAuthed(false); setUser(null); };

  if (!authed) return <LoginScreen onLogin={d => { setUser(d.user); setAuthed(true); }} />;
  return <POSTerminal user={user} onLogout={handleLogout} />;
}
