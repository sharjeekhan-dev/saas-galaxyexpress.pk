import React, { useState, useEffect } from 'react';
import {
  Store, Package, ShoppingCart, BarChart3, Settings, LogOut,
  Plus, Edit, Trash2, CheckCircle, Clock, Bell, DollarSign, Target, Menu, X, Star, MessageSquare,
  Users2, UserCheck, Calendar, Printer, Moon, Sun, Loader2, Workflow, BookOpen, Receipt, Building, Layers
} from 'lucide-react';

export default function App() {
  const [vendor, setVendor] = useState(() => {
    const saved = localStorage.getItem('vendor_auth');
    return saved ? JSON.parse(saved) : null;
  }); // { name: 'Pizza Palace', limited_b2b: false }

  const [activeTab, setActiveTab] = useState('orders');
  const [reportTab, setReportTab] = useState('overview');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [previewMode, setPreviewMode] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('vendor_dark') === 'true');
  const [isGenerating, setIsGenerating] = useState(false);
  const [subTab, setSubTab] = useState('coa');
  const [isMobile, setIsMobile] = useState(false);

  // Responsive listener
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Persist dark mode & toggle body class
  useEffect(() => {
    localStorage.setItem('vendor_dark', darkMode);
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const theme = {
    bg: darkMode ? '#020817' : '#f1f5f9',
    card: darkMode ? '#0f172a' : 'white',
    text: darkMode ? '#f8fafc' : '#0f172a',
    muted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#1e293b' : '#e2e8f0',
    navBg: darkMode ? '#020817' : 'white'
  };

  // Theme-aware style helpers
  const tabBtn = (isActive) => ({
    background: isActive ? '#8de02c' : theme.card,
    color: isActive ? '#000' : theme.muted,
    border: `1px solid ${theme.border}`,
    padding: '8px 20px', borderRadius: 20, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s'
  });
  const cardBg = { background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}` };
  const theadBg = { background: theme.bg, color: theme.muted, fontSize: '0.85rem' };
  const trBdr = { borderTop: `1px solid ${theme.border}` };
  const actBtn = { background: darkMode ? '#1e293b' : '#0f172a', color: darkMode ? '#f8fafc' : 'white', border: 'none', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600 };

  const handleGenerateLiveReport = (type) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewMode(type);
    }, 1500);
  };

  // Mock Data + Live Data
  const [orders, setOrders] = useState([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  // Sync vendor auth
  useEffect(() => {
    if (vendor) localStorage.setItem('vendor_auth', JSON.stringify(vendor));
    else localStorage.removeItem('vendor_auth');
  }, [vendor]);

  const DEMO_ORDERS = [
    { id: 'ORD-1021', customer: 'Ali R.', items: '2x Margherita Pizza, 1x Coke', total: 2550, status: 'new', time: '2 mins ago' },
    { id: 'ORD-1020', customer: 'Tariq M.', items: '1x Mighty Burger', total: 750, status: 'preparing', time: '12 mins ago' },
    { id: 'ORD-1019', customer: 'Sana K.', items: '1x Loaded Fries, 2x Pepsi', total: 900, status: 'new', time: '5 mins ago' }
  ];

  // Live Order Fetching with fallback
  useEffect(() => {
    if (!vendor) return;
    let alive = true;
    const fetchOrders = async () => {
      try {
        const res = await fetch(`https://api.galaxyexpress.pk/orders?tenantId=${vendor.id || 'default'}`);
        if (res.ok) {
          const data = await res.json();
          if (alive && data && Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(data.orders.map(o => ({
              id: `ORD-${o.id}`,
              customer: o.customerInfo?.name || 'Walk-in Customer',
              items: Array.isArray(o.items) ? o.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : '',
              total: o.totalAmount || 0,
              status: o.status === 'PENDING' ? 'new' : (o.status === 'PREPARING' ? 'preparing' : (o.status || '').toLowerCase()),
              time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : 'just now'
            })));
            return;
          }
        }
      } catch (e) { /* API unavailable, use demo */ }
      if (alive) setOrders(prev => prev.length ? prev : DEMO_ORDERS);
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => { alive = false; clearInterval(interval); };
  }, [vendor]);

  const [products, setProducts] = useState([
    { id: 'P1', name: 'Margherita Pizza', price: 1200, category: 'Pizza', stock: 'In Stock' },
    { id: 'P2', name: 'Mighty Burger', price: 750, category: 'Burger', stock: 'In Stock' },
    { id: 'P3', name: 'Loaded Fries', price: 450, category: 'Sides', stock: 'Low Stock' },
  ]);

  const [reviews, setReviews] = useState([
    { id: 'R1', customer: 'Fatima Ahmed', orderId: 'ORD-1010', rating: 5, comment: 'Best pizza in town!', date: '2026-04-05' },
    { id: 'R2', customer: 'Omar Khan', orderId: 'ORD-0995', rating: 3, comment: 'Burger was a bit cold.', date: '2026-04-02' },
  ]);

  const [applications, setApplications] = useState([
    { id: 'APP-103', applicant: 'Bilal Khan', email: 'bilal@email.com', role: 'Assistant Chef', date: '2026-04-04', status: 'Pending' },
    { id: 'APP-105', applicant: 'Zainab T.', email: 'zainab@email.com', role: 'Kitchen Helper', date: '2026-04-01', status: 'Interviewing' },
  ]);

  if (!vendor) {
    return (
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: theme.card, padding: 40, borderRadius: 20, width: '100%', maxWidth: 400, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <Store size={48} color="#8de02c" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ marginBottom: 10, color: theme.text }}>Vendor Portal</h2>
          <div style={{ color: theme.muted, marginBottom: 30 }}>Manage your cloud restaurant</div>

          <input className="form-input" style={{ width: '100%', padding: 12, marginBottom: 16, border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.bg, color: theme.text }} placeholder="Email Address" defaultValue="vendor@pizzapalace.com" />
          <input className="form-input" type="password" style={{ width: '100%', padding: 12, marginBottom: 24, border: `1px solid ${theme.border}`, borderRadius: 8, background: theme.bg, color: theme.text }} placeholder="Password" defaultValue="password123" />

          <button style={{ width: '100%', padding: 14, background: '#8de02c', color: '#000', fontWeight: 800, border: 'none', borderRadius: 8, cursor: 'pointer' }}
            onClick={() => setVendor({ name: 'Pizza Palace', id: 'V-001', revenue: 45000 })}>
            Login to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // --- REPORT PREVIEW MODAL (INVOICE / FAST PRINT) ---
  const renderPreviewBox = () => {
    if (!previewMode) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, overflowY: 'auto' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; padding: 0 !important;}
            @page { size: A4; margin: 20mm; }
          }
        `}</style>
        <div className="no-print" style={{ width: '100%', maxWidth: 850, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{previewMode === 'purchase' ? 'Purchase Report Preview' : 'Sales V/S Consumption Analysis'}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ background: 'white', color: 'black', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => window.print()}><Printer size={16} /> Print A4</button>
            <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }} onClick={() => setPreviewMode(null)}>Close Preview</button>
          </div>
        </div>

        {/* A4 Document Area */}
        <div className="print-area" style={{ background: 'white', width: '100%', maxWidth: 816, minHeight: 1056, padding: 40, borderRadius: 8, color: '#000', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontFamily: 'Arial, sans-serif' }}>

          <div style={{ borderBottom: '2px solid #000', paddingBottom: 16, marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase' }}>GALAXY EXPRESS (PRIVATE) LIMITED</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>VENDOR: {vendor?.name.toUpperCase()} (ID: {vendor?.id})</p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', background: '#f1f5f9', display: 'inline-block', padding: '6px 16px', border: '1px solid #000' }}>
              {previewMode === 'purchase' ? 'Party Wise Items Detailed Purchase Report' : 'Department Wise Sales V/S Consumption'}
            </h2>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 8 }}>FROM : 06/04/2026 TO: 06/04/2026</div>
          </div>

          {previewMode === 'purchase' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' }}>
                  <th style={{ padding: '8px 4px', textAlign: 'left' }}>ITEM DESCRIPTION</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>UOM</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>QTY</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>RATE</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={5} style={{ fontWeight: 800, padding: '12px 4px 4px' }}>HAFIZ TRADER</td></tr>
                <tr>
                  <td style={{ padding: '4px' }}>BEEF MINCE</td><td style={{ textAlign: 'center' }}>KG</td><td style={{ textAlign: 'right' }}>10.000</td><td style={{ textAlign: 'right' }}>1,350.00</td><td style={{ textAlign: 'right' }}>13,500.00</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px' }}>CHICKEN BONELESS</td><td style={{ textAlign: 'center' }}>KG</td><td style={{ textAlign: 'right' }}>30.000</td><td style={{ textAlign: 'right' }}>724.00</td><td style={{ textAlign: 'right' }}>21,720.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td colSpan={4} style={{ textAlign: 'right', fontWeight: 800, padding: '8px 4px' }}>HAFIZ TRADER TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 800, padding: '8px 4px' }}>35,220.00</td></tr>

                <tr><td colSpan={5} style={{ fontWeight: 800, padding: '12px 4px 4px' }}>NAZIR MILK SHOP</td></tr>
                <tr>
                  <td style={{ padding: '4px' }}>MILK, FRESH</td><td style={{ textAlign: 'center' }}>LTR</td><td style={{ textAlign: 'right' }}>56.000</td><td style={{ textAlign: 'right' }}>200.00</td><td style={{ textAlign: 'right' }}>11,200.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td colSpan={4} style={{ textAlign: 'right', fontWeight: 800, padding: '8px 4px' }}>NAZIR MILK SHOP TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 800, padding: '8px 4px' }}>11,200.00</td></tr>
              </tbody>
            </table>
          )}

          {previewMode === 'consumption' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' }}>
                  <th style={{ padding: '8px 4px', textAlign: 'left' }}>CODE</th>
                  <th style={{ padding: '8px 4px', textAlign: 'left' }}>DEPARTMENT NAME</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>SALES (RS)</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>CONSUMPTION (RS)</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>% VARIANCE</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '8px 4px' }}>603</td><td style={{ padding: '8px 4px' }}>B.B.Q & GRILL</td><td style={{ textAlign: 'right' }}>485,200</td><td style={{ textAlign: 'right' }}>352,726</td><td style={{ textAlign: 'right' }}>27.3%</td>
                </tr>
                <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '8px 4px' }}>607</td><td style={{ padding: '8px 4px' }}>DESSERT & SWEETS</td><td style={{ textAlign: 'right' }}>89,400</td><td style={{ textAlign: 'right' }}>39,648</td><td style={{ textAlign: 'right' }}>55.6%</td>
                </tr>
                <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '8px 4px' }}>601</td><td style={{ padding: '8px 4px' }}>FAST FOOD</td><td style={{ textAlign: 'right' }}>150,000</td><td style={{ textAlign: 'right' }}>90,000</td><td style={{ textAlign: 'right' }}>40.0%</td>
                </tr>
                <tr><td colSpan={5} style={{ padding: '20px 4px' }}></td></tr>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                  <td colSpan={2} style={{ textAlign: 'right', fontWeight: 900, padding: '10px 4px' }}>GRAND TOTAL :</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, padding: '10px 4px' }}>724,600</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, padding: '10px 4px' }}>482,374</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, padding: '10px 4px' }}>33.4%</td>
                </tr>
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <div>Printed on: {new Date().toLocaleString()}</div>
            <div>Generated by GalaxyERP Reporting Engine v2</div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: 'system-ui, sans-serif' }}>
      {renderPreviewBox()}
      {/* SIDEBAR (DESKTOP) */}
      {isMobile && mobileMenu && <div onClick={() => setMobileMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />}
      <aside style={{ width: 250, background: theme.navBg, borderRight: `1px solid ${theme.border}`, display: isMobile ? (mobileMenu ? 'flex' : 'none') : 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'relative', top: 0, left: 0, bottom: 0, zIndex: 50, boxShadow: isMobile ? '4px 0 20px rgba(0,0,0,0.3)' : 'none' }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 900, color: '#8de02c', fontSize: '1.2rem' }}>GalaxyERP</div>
            <div style={{ fontSize: '0.75rem', color: theme.muted, fontWeight: 700, textTransform: 'uppercase' }}>Vendor Panel</div>
          </div>
          {isMobile && <X onClick={() => setMobileMenu(false)} style={{ cursor: 'pointer' }} color={theme.text} />}
        </div>

        <div style={{ padding: 20, flex: 1 }}>
          {[
            { id: 'orders', icon: ShoppingCart, label: 'Live Orders' },
            { id: 'products', icon: Package, label: 'Menu & Stock' },
            { id: 'inventory', icon: Layers, label: 'Inventory & Notes' },
            { id: 'accounts', icon: BookOpen, label: 'Finance & Vouchers' },
            { id: 'reports', icon: BarChart3, label: 'ERP Reports' },
            { id: 'reviews', icon: Star, label: 'Reviews & Feedback' },
            { id: 'hr', icon: Users2, label: 'HR & Hiring' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(nav => (
            <div key={nav.id} onClick={() => { setActiveTab(nav.id); setMobileMenu(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                background: activeTab === nav.id ? '#8de02c' : 'transparent',
                color: activeTab === nav.id ? '#000' : '#64748b', fontWeight: 600
              }}>
              <nav.icon size={18} /> {nav.label}
            </div>
          ))}
        </div>

        <div style={{ padding: 20, borderTop: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#ef4444', fontWeight: 600 }} onClick={() => setVendor(null)}>
          <LogOut size={18} /> Logout
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden' }}>

        <header style={{ background: theme.navBg, padding: '16px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isMobile && <Menu onClick={() => setMobileMenu(true)} style={{ cursor: 'pointer' }} color={theme.text} />}
            <h1 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Store size={20} color="#8de02c" /> {vendor.name} <span style={{ fontSize: '0.75rem', background: theme.bg, padding: '4px 8px', borderRadius: 20 }}>ID: {vendor.id}</span>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: theme.text }}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color={theme.text} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>

          {/* ORDERS VIEW */}
          {activeTab === 'orders' && (
            <div>
              <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
              `}</style>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Live Orders Pipeline</h2>
                <div style={{ background: 'rgba(141,224,44,0.1)', color: '#65a30d', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8de02c' }}></div> Accepting Orders
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {/* Pending Column */}
                <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 20 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f97316', marginBottom: 16 }}><Bell size={18} /> New Requests</h3>
                  {orders.filter(o => o.status === 'new').map(o => (
                    <div key={o.id} style={{ background: theme.bg, border: `1px solid ${theme.border}`, padding: 16, borderRadius: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontWeight: 800, color: theme.text }}>{o.id}</span>
                        <span style={{ fontSize: '0.8rem', color: theme.muted }}>{o.time}</span>
                      </div>
                      <div style={{ marginBottom: 10, fontSize: '0.9rem', color: theme.text }}><b>{o.customer}</b><br />{o.items}</div>
                      <div style={{ fontWeight: 800, color: '#8de02c', marginBottom: 16 }}>Rs {o.total}</div>
                      <button style={{ width: '100%', padding: 10, background: darkMode ? '#8de02c' : '#0f172a', color: darkMode ? '#000' : 'white', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => setOrders(p => p.map(x => x.id === o.id ? { ...x, status: 'preparing' } : x))}>
                        Accept & Prep
                      </button>
                    </div>
                  ))}
                </div>

                {/* Preparing Column */}
                <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 20 }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', marginBottom: 16 }}><Clock size={18} /> Preparing</h3>
                  {orders.filter(o => o.status === 'preparing').map(o => (
                    <div key={o.id} style={{ background: theme.bg, border: `1px solid ${theme.border}`, padding: 16, borderRadius: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontWeight: 800, color: theme.text }}>{o.id}</span>
                        <span style={{ fontSize: '0.8rem', color: theme.muted }}>{o.time}</span>
                      </div>
                      <div style={{ marginBottom: 10, fontSize: '0.9rem', color: theme.text }}><b>{o.customer}</b><br />{o.items}</div>
                      <button style={{ width: '100%', padding: 10, background: '#8de02c', color: '#000', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700 }}
                        onClick={() => setOrders(p => p.filter(x => x.id !== o.id))}>
                        Mark Ready for Delivery
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS VIEW */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Menu Catalog</h2>
                <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <Plus size={16} /> Add Item
                </button>
              </div>

              <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ background: theme.bg, color: theme.muted, fontSize: '0.85rem' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Item Name</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Price</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Stock Status</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px 20px', fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: '16px 20px', color: '#64748b' }}>{p.category}</td>
                        <td style={{ padding: '16px 20px', fontWeight: 700 }}>Rs {p.price}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: p.stock === 'In Stock' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: p.stock === 'In Stock' ? '#16a34a' : '#ef4444', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                            {p.stock}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <Edit size={16} color="#64748b" cursor="pointer" />
                            <Trash2 size={16} color="#ef4444" cursor="pointer" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS VIEW */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
                <button onClick={() => setReportTab('overview')} style={tabBtn(reportTab === 'overview')}>Overview Dashboard</button>
                <button onClick={() => setReportTab('purchases')} style={tabBtn(reportTab === 'purchases')}>Purchase Reports</button>
                <button onClick={() => setReportTab('consumptions')} style={tabBtn(reportTab === 'consumptions')}>Consumptions & Prod.</button>
                <button onClick={() => setReportTab('invoices')} style={tabBtn(reportTab === 'invoices')}>Invoices & Vouchers</button>
              </div>

              {reportTab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
                    <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                      <div style={{ color: theme.muted, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.9rem' }}><DollarSign size={16} /> Today's Revenue</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: theme.text }}>Rs 14,500</div>
                    </div>
                    <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                      <div style={{ color: theme.muted, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.9rem' }}><Target size={16} /> Pending Payouts</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f97316' }}>Rs 4,200</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: 24, borderRadius: 16, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>Need more visibility?</h3>
                      <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0, marginBottom: 16 }}>Upgrade your B2B account to get detailed analytics and priority listing.</p>
                      <button style={{ background: '#8de02c', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, alignSelf: 'flex-start', cursor: 'pointer' }}>Upgrade Plan</button>
                    </div>
                  </div>
                </div>
              )}

              {reportTab === 'purchases' && (
                <div style={{ background: theme.card, padding: 30, borderRadius: 16, border: `1px solid ${theme.border}`, animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: `1px solid ${theme.border}`, paddingBottom: 20 }}>
                    <div>
                      <h2 style={{ margin: 0, color: theme.text }}>Advanced Purchase Reports</h2>
                      <p style={{ margin: '4px 0 0 0', color: theme.muted, fontSize: '0.9rem' }}>Generate detailed ERP metrics based on party, item, and date ranges.</p>
                    </div>
                    <button onClick={() => setPreviewMode('purchase')} style={{ background: '#8de02c', color: '#000', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(141,224,44,0.3)' }}>
                      <Printer size={18} /> Print Report
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
                    {/* Column 1 */}
                    <div style={{ flex: '1 1 300px' }}>
                      <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Selection Criteria</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 30 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>From Date</label>
                          <input type="date" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, boxSizing: 'border-box' }} defaultValue="2026-04-06" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>To Date</label>
                          <input type="date" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, boxSizing: 'border-box' }} defaultValue="2026-04-06" />
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Group Information</h3>
                      <div style={{ display: 'grid', gap: 12, marginBottom: 30 }}>
                        <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8 }}><option>All Departments</option><option>Kitchen Operations</option><option>Packaging</option></select>
                        <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8 }}><option>Select Group / Category</option><option>Raw Materials</option><option>Beverages</option></select>
                        <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8 }}><option>Sub Group (Optional)</option></select>
                        <input style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, boxSizing: 'border-box' }} placeholder="Title Account Search..." />
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div style={{ flex: '1 1 300px', background: theme.bg, padding: 24, borderRadius: 12, border: `1px solid ${theme.border}` }}>
                      <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Consolidated Reports</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="rptType" defaultChecked style={{ accentColor: '#8de02c' }} /> Party Wise Consolidated</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="rptType" style={{ accentColor: '#8de02c' }} /> Item Wise Consolidated</label>
                      </div>

                      <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Detailed Reports</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="rptType" style={{ accentColor: '#8de02c' }} /> Party Wise Items Detailed</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="rptType" style={{ accentColor: '#8de02c' }} /> Item Wise Partys Detailed</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="rptType" style={{ accentColor: '#8de02c' }} /> Item Detailed (Party & Voucher Wise)</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="rptType" style={{ accentColor: '#8de02c' }} /> Purchase Register / Ledger</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="rptType" style={{ accentColor: '#8de02c' }} /> Items Rate Update History</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportTab === 'consumptions' && (
                <div style={{ background: theme.card, padding: 30, borderRadius: 16, border: `1px solid ${theme.border}`, animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, borderBottom: `1px solid ${theme.border}`, paddingBottom: 20 }}>
                    <div>
                      <h2 style={{ margin: 0, color: theme.text }}>Consumptions & Productions</h2>
                      <p style={{ margin: '4px 0 0 0', color: theme.muted, fontSize: '0.9rem' }}>Track material usage, wastage, and compare against sales.</p>
                    </div>
                    <button onClick={() => handleGenerateLiveReport('consumption')} disabled={isGenerating} style={{ background: darkMode ? '#1e293b' : '#0f172a', color: darkMode ? '#f8fafc' : 'white', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 800, cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.2)', minWidth: 160, justifyContent: 'center' }}>
                      {isGenerating ? <><Loader2 size={18} className="spin" /> Fetching...</> : <><Printer size={18} /> Print Analysis</>}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
                    {/* Column 1 */}
                    <div style={{ flex: '1 1 300px' }}>
                      <h3 style={{ fontSize: '1rem', color: theme.text, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Selection Criteria</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, marginBottom: 6 }}>From Date</label>
                          <input type="date" style={{ width: '100%', padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} defaultValue="2026-04-06" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, marginBottom: 6 }}>To Date</label>
                          <input type="date" style={{ width: '100%', padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} defaultValue="2026-04-06" />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 30 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, marginBottom: 6 }}>B.Pro</label>
                          <select style={{ width: '100%', padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>ALL</option></select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.muted, marginBottom: 6 }}>B.Ind</label>
                          <select style={{ width: '100%', padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>ALL</option></select>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1rem', color: theme.text, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Group Information</h3>
                      <div style={{ display: 'grid', gap: 12, marginBottom: 30 }}>
                        <select style={{ width: '100%', padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>All Departments</option><option>B.B.Q</option><option>DESSERT</option></select>
                        <select style={{ width: '100%', padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>Group</option></select>
                        <select style={{ width: '100%', padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>Sub Group</option></select>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div style={{ flex: '1 1 300px', background: theme.bg, padding: 24, borderRadius: 12, border: `1px solid ${theme.border}` }}>
                      <h3 style={{ fontSize: '1rem', color: theme.text, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Consolidated Reports</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="conRpt" style={{ accentColor: '#0f172a' }} /> Department Wise Consolidated Report</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="conRpt" style={{ accentColor: '#0f172a' }} /> Item Wise Consolidated Report</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="conRpt" style={{ accentColor: '#0f172a' }} /> Item Wise Consolidated Waste Report</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="conRpt" style={{ accentColor: '#0f172a' }} /> Department Wise Items Group Consumption</label>
                      </div>

                      <h3 style={{ fontSize: '1rem', color: theme.text, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Detailed Reports</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="conRpt" style={{ accentColor: '#0f172a' }} /> Department Wise Items Detailed Report</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="conRpt" defaultChecked style={{ accentColor: '#0f172a' }} /> Sales V/s Consumption Analysis</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="conRpt" style={{ accentColor: '#0f172a' }} /> Difference from Standard Qty</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}><input type="radio" name="conRpt" style={{ accentColor: '#0f172a' }} /> Consumption Register</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportTab === 'invoices' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, color: theme.text }}>Invoices & Vouchers</h2>
                    <button style={actBtn}><Plus size={16} /> Create Voucher</button>
                  </div>

                  <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead style={{ background: theme.bg, color: theme.muted, fontSize: '0.85rem' }}>
                        <tr>
                          <th style={{ padding: '16px 20px', fontWeight: 600 }}>Voucher #</th>
                          <th style={{ padding: '16px 20px', fontWeight: 600 }}>Type</th>
                          <th style={{ padding: '16px 20px', fontWeight: 600 }}>Party / Supplier</th>
                          <th style={{ padding: '16px 20px', fontWeight: 600 }}>Amount</th>
                          <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderTop: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '16px 20px', fontWeight: 700, color: theme.text }}>PV-2026-001</td>
                          <td style={{ padding: '16px 20px', color: theme.muted }}>Purchase Invoice</td>
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: theme.text }}>Fresh Farms Supplies</td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#ef4444' }}>- Rs 4,500</td>
                          <td style={{ padding: '16px 20px' }}><span style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>Pending Approval</span></td>
                        </tr>
                        <tr style={{ borderTop: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '16px 20px', fontWeight: 700, color: theme.text }}>CP-2026-092</td>
                          <td style={{ padding: '16px 20px', color: theme.muted }}>Cash Payment Voucher</td>
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: theme.text }}>Local Dairy Co.</td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#ef4444' }}>- Rs 1,200</td>
                          <td style={{ padding: '16px 20px' }}><span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>Paid</span></td>
                        </tr>
                        <tr style={{ borderTop: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '16px 20px', fontWeight: 700, color: theme.text }}>BR-2026-004</td>
                          <td style={{ padding: '16px 20px', color: theme.muted }}>Bank Receipt Voucher</td>
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: theme.text }}>GalaxyExpress Settlement</td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#16a34a' }}>+ Rs 12,000</td>
                          <td style={{ padding: '16px 20px' }}><span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>Cleared</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REVIEWS & FEEDBACK VIEW */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Customer Feedback</h2>
                <div style={{ background: theme.card, padding: '8px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: theme.text }}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" /> 4.8 / 5.0 Average
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: theme.card, padding: 20, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: theme.text }}>{r.customer}</div>
                        <div style={{ color: theme.muted, fontSize: '0.85rem', marginTop: 2 }}>Order: {r.orderId} • {r.date}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} color={i < r.rating ? '#fbbf24' : '#e2e8f0'} fill={i < r.rating ? '#fbbf24' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: 0, color: theme.text, background: theme.bg, padding: 12, borderRadius: 8, borderLeft: '4px solid #8de02c' }}>
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR & HIRING VIEW */}
          {activeTab === 'hr' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: theme.text }}>Staff Applications</h2>
                <button style={actBtn}>
                  <Plus size={16} /> Post New Job
                </button>
              </div>

              <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24, marginBottom: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>Active Job Listings</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ background: theme.bg, padding: '8px 16px', borderRadius: 20, border: `1px solid ${theme.border}`, fontSize: '0.9rem', fontWeight: 600, color: theme.text }}>Assistant Chef</span>
                  <span style={{ background: theme.bg, padding: '8px 16px', borderRadius: 20, border: `1px solid ${theme.border}`, fontSize: '0.9rem', fontWeight: 600, color: theme.text }}>Pizza Maker</span>
                </div>
              </div>

              <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ background: theme.bg, color: theme.muted, fontSize: '0.85rem' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Applicant</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Applied Role</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((a, i) => (
                      <tr key={a.id} style={{ borderTop: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, color: theme.text }}>{a.applicant}</div>
                          <div style={{ fontSize: '0.8rem', color: theme.muted }}>{a.email}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: theme.text }}>{a.role}</td>
                        <td style={{ padding: '16px 20px', color: theme.muted }}><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{a.date}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: a.status === 'Pending' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: a.status === 'Pending' ? '#ef4444' : '#16a34a', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                            {a.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <button style={{ background: theme.bg, border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600, color: theme.text }}>
                            <UserCheck size={14} /> Interview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ACCOUNTS & VOUCHERS TAB */}
          {activeTab === 'accounts' && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                <button onClick={() => setSubTab('coa')} style={{ background: subTab === 'coa' ? '#8de02c' : theme.card, color: subTab === 'coa' ? '#000' : theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Chart of Accounts</button>
                <button onClick={() => setSubTab('daybook')} style={{ background: subTab === 'daybook' ? '#8de02c' : theme.card, color: subTab === 'daybook' ? '#000' : theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Daybook & Statements</button>
                <button onClick={() => setSubTab('ledgers')} style={{ background: subTab === 'ledgers' ? '#8de02c' : theme.card, color: subTab === 'ledgers' ? '#000' : theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Receivable & Payable Ledgers</button>
                <button onClick={() => setSubTab('vouchers')} style={{ background: subTab === 'vouchers' ? '#8de02c' : theme.card, color: subTab === 'vouchers' ? '#000' : theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Voucher Entry Portal</button>
              </div>

              <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>

                {subTab === 'coa' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h2 style={{ margin: 0, color: theme.text }}>Chart of Accounts Setup</h2>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}><Edit size={14} style={{ display: 'inline', marginRight: 6 }} /> Edit Account</button>
                        <button style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Duplicate</button>
                        <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}><Plus size={14} style={{ display: 'inline', marginRight: 6 }} /> New Account</button>
                      </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ background: theme.bg, color: theme.muted }}>
                        <tr><th style={{ padding: 12, textAlign: 'left' }}>A/C Code</th><th style={{ padding: 12, textAlign: 'left' }}>Account Name</th><th style={{ padding: 12, textAlign: 'left' }}>Type</th><th style={{ padding: 12, textAlign: 'right' }}>Current Balance</th></tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}><td style={{ padding: 12 }}>10-01-0001</td><td style={{ padding: 12 }}>Cash in Hand - Main</td><td style={{ padding: 12 }}>Asset</td><td style={{ padding: 12, textAlign: 'right', fontWeight: 700 }}>Rs 124,500 DR</td></tr>
                        <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}><td style={{ padding: 12 }}>20-05-0012</td><td style={{ padding: 12 }}>Nestle Suppliers A/C</td><td style={{ padding: 12 }}>Liability (Payable)</td><td style={{ padding: 12, textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>Rs 45,000 CR</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {subTab === 'daybook' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h2 style={{ margin: 0, color: theme.text }}>Daily Statement (Branch Wise)</h2>
                      <select style={{ padding: '8px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }}>
                        <option>DHA Branch</option><option>Gulberg Branch</option>
                      </select>
                    </div>
                    <div style={{ padding: 20, background: theme.bg, borderRadius: 12, border: `1px solid ${theme.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div>
                        <h3 style={{ marginTop: 0, color: theme.text }}>Receipts (IN)</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${theme.muted}`, color: theme.text }}><span>Cash Sales</span><span>Rs 85,000</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${theme.muted}`, color: theme.text }}><span>Bank / Credit Card</span><span>Rs 12,500</span></div>
                      </div>
                      <div>
                        <h3 style={{ marginTop: 0, color: theme.text }}>Payments (OUT)</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${theme.muted}`, color: theme.text }}><span>P/V Payment to Vendor</span><span>Rs 15,000</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px dashed ${theme.muted}`, color: theme.text }}><span>Utility Bills</span><span>Rs 5,000</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {subTab === 'ledgers' && (
                  <div>
                    <h2 style={{ margin: '0 0 20px 0', color: theme.text }}>Supplier & Customer Ledgers</h2>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                      <input className="form-input" style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }} placeholder="Search Supplier/Customer Name..." />
                      <button style={{ background: '#8de02c', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Run Ledger</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ background: theme.bg, color: theme.muted }}>
                        <tr><th style={{ padding: 12, textAlign: 'left' }}>Date</th><th style={{ padding: 12, textAlign: 'left' }}>Particulars (Voucher #)</th><th style={{ padding: 12, textAlign: 'right' }}>Debit (DR)</th><th style={{ padding: 12, textAlign: 'right' }}>Credit (CR)</th><th style={{ padding: 12, textAlign: 'right' }}>Balance</th></tr>
                      </thead>
                    </table>
                  </div>
                )}

                {subTab === 'vouchers' && (
                  <div>
                    <h2 style={{ margin: '0 0 20px 0', color: theme.text }}>Voucher Entry Portal (Multiple Entries)</h2>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                      <select style={{ padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }}><option>Cash Payment (CPV)</option><option>Cash Receipt (CRV)</option><option>Bank Payment (BPV)</option><option>Bank Receipt (BRV)</option><option>Journal Voucher (JV)</option></select>
                      <input type="date" style={{ padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }} />
                      <input type="text" placeholder="Ref/Cheque No" style={{ padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, flex: 1 }} />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: 20 }}>
                      <thead style={{ background: theme.bg, color: theme.muted }}>
                        <tr><th style={{ padding: 8, textAlign: 'left' }}>A/C Title</th><th style={{ padding: 8, textAlign: 'left' }}>Narration</th><th style={{ padding: 8, width: 100 }}>Debit</th><th style={{ padding: 8, width: 100 }}>Credit</th></tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map(row => (
                          <tr key={row}>
                            <td style={{ padding: 4 }}><input style={{ width: '100%', padding: 8, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }} placeholder="Select A/C..." /></td>
                            <td style={{ padding: 4 }}><input style={{ width: '100%', padding: 8, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }} placeholder="Remarks..." /></td>
                            <td style={{ padding: 4 }}><input type="number" style={{ width: '100%', padding: 8, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }} placeholder="0.00" /></td>
                            <td style={{ padding: 4 }}><input type="number" style={{ width: '100%', padding: 8, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }} placeholder="0.00" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Post Voucher</button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                <button onClick={() => setSubTab('issuance')} style={{ background: subTab === 'issuance' ? '#8de02c' : theme.card, color: subTab === 'issuance' ? '#000' : theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Stock Issuance (Auto Day-Close)</button>
                <button onClick={() => setSubTab('receive')} style={{ background: subTab === 'receive' ? '#8de02c' : theme.card, color: subTab === 'receive' ? '#000' : theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Receive Notes & PO</button>
                <button onClick={() => setSubTab('recipes')} style={{ background: subTab === 'recipes' ? '#8de02c' : theme.card, color: subTab === 'recipes' ? '#000' : theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Rates, Pictures & Recipes</button>
                <button onClick={() => setSubTab('variance')} style={{ background: subTab === 'variance' ? '#8de02c' : theme.card, color: subTab === 'variance' ? '#000' : theme.text, border: `1px solid ${theme.border}`, padding: '8px 20px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Purchases & Variance Reports</button>
              </div>

              <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>

                {subTab === 'issuance' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h2 style={{ margin: 0, color: theme.text }}>Stock Issuance Note (Day Closing)</h2>
                      <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> Auto Issue for Next Day</button>
                    </div>
                    <div style={{ color: theme.muted, marginBottom: 20 }}>Generate closing adjustment to auto-forward stock balances to opening stock of next business day.</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ background: theme.bg, color: theme.muted }}>
                        <tr><th style={{ padding: 12, textAlign: 'left' }}>Item Name</th><th style={{ padding: 12, textAlign: 'center' }}>Closing Qty</th><th style={{ padding: 12, textAlign: 'center' }}>New Issue Qty</th><th style={{ padding: 12, textAlign: 'left' }}>Dept</th></tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: `1px solid ${theme.border}`, color: theme.text }}><td style={{ padding: 12 }}>Chicken Breast (Raw)</td><td style={{ padding: 12, textAlign: 'center' }}>12.5 KG</td><td style={{ padding: 12, textAlign: 'center' }}><input defaultValue="15" style={{ width: 60, padding: 4, textAlign: 'center', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }} /> KG</td><td style={{ padding: 12 }}>FAST FOOD</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {subTab === 'recipes' && (
                  <div>
                    <h2 style={{ margin: '0 0 20px 0', color: theme.text }}>Master Recipes & Rates Configration</h2>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <div style={{ flex: 1, background: theme.bg, padding: 20, borderRadius: 12, border: `1px solid ${theme.border}` }}>
                        <h3 style={{ marginTop: 0, color: theme.text }}>Item Setup</h3>
                        <input className="form-input" style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, marginBottom: 10 }} placeholder="Select Master Product..." />
                        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                          <input placeholder="Sale Rate" style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }} />
                          <input placeholder="Purchase Rate" style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text }} />
                        </div>
                        <button style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer', marginBottom: 20 }}><Star size={14} style={{ display: 'inline', marginRight: 6 }} /> Update Rates & Pictures</button>
                      </div>
                      <div style={{ flex: 1, background: theme.bg, padding: 20, borderRadius: 12, border: `1px solid ${theme.border}` }}>
                        <h3 style={{ marginTop: 0, color: theme.text }}>UHC Recipe Builder</h3>
                        <div style={{ color: theme.muted, fontSize: '0.85rem', marginBottom: 12 }}>Link raw ingredients to product schemes for De-Assembly and Variance check.</div>
                        <button style={{ width: '100%', background: '#8de02c', color: '#000', border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 800 }}><Workflow size={14} style={{ display: 'inline', marginRight: 6 }} /> Define Recipe Combos</button>
                      </div>
                    </div>
                  </div>
                )}

                {subTab === 'receive' && (
                  <div>
                    <h2 style={{ margin: '0 0 20px 0', color: theme.text }}>Supplier Goods Receive Notes (GRN)</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead style={{ background: theme.bg, color: theme.muted }}>
                        <tr><th style={{ padding: 12, textAlign: 'left' }}>PO Number</th><th style={{ padding: 12, textAlign: 'left' }}>Supplier</th><th style={{ padding: 12, textAlign: 'center' }}>Items</th><th style={{ padding: 12, textAlign: 'left' }}>Total Amount</th><th style={{ padding: 12, textAlign: 'left' }}>Status</th></tr>
                      </thead>
                    </table>
                  </div>
                )}

                {subTab === 'variance' && (
                  <div>
                    <h2 style={{ margin: '0 0 20px 0', color: theme.text }}>Purchase Ends & Supplier Variance Reports</h2>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                      <select style={{ padding: 10, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, flex: 1 }}><option>All Day Purchase Report</option><option>Supplier Wise Purchase Report</option><option>Item Wise Cost Variance</option></select>
                      <button style={{ background: '#8de02c', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Generate</button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* SETTINGS (Screenshot 1 Master Configuration) */}
          {activeTab === 'settings' && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <h2 style={{ margin: '0 0 24px 0', color: theme.text }}>Master ERP Configurations</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginTop: 0, color: theme.text, display: 'flex', alignItems: 'center', gap: 8 }}><Building size={18} color="#8de02c" /> Departments & Units</h3>
                  <div style={{ color: theme.muted, fontSize: '0.85rem', marginBottom: 20 }}>Define store groups, departments (e.g. Bar, BBQ), units, and budgets.</div>
                  <button style={{ width: '100%', padding: 10, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, cursor: 'pointer' }}>Configure</button>
                </div>
                <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginTop: 0, color: theme.text, display: 'flex', alignItems: 'center', gap: 8 }}><UserCheck size={18} color="#8de02c" /> Suppliers & Customers</h3>
                  <div style={{ color: theme.muted, fontSize: '0.85rem', marginBottom: 20 }}>Manage vendor ledgers, member structures, and credit terms.</div>
                  <button style={{ width: '100%', padding: 10, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, cursor: 'pointer' }}>Configure</button>
                </div>
                <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                  <h3 style={{ marginTop: 0, color: theme.text, display: 'flex', alignItems: 'center', gap: 8 }}><Edit size={18} color="#8de02c" /> System Registration</h3>
                  <div style={{ color: theme.muted, fontSize: '0.85rem', marginBottom: 20 }}>Configure branch limits, barcodes, and change system dates.</div>
                  <button style={{ width: '100%', padding: 10, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, cursor: 'pointer' }}>Configure</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
