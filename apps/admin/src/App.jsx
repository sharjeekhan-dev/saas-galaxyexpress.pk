import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store, Bike, FileText,
  CreditCard, Bell, Settings, Building, UserPlus, ChefHat, Printer,
  LogOut, RefreshCw, Moon, Sun, Globe, TrendingUp, DollarSign, Layers,
  Tag, Image, BookOpen, Key, UserCog, MapPin, Receipt, Percent, Wallet,
  Truck, Shield, HelpCircle, BarChart3, MessageCircle, Menu, X,
  ShoppingBag, Factory, Briefcase, Users2, ClipboardList
} from 'lucide-react';

import DashboardPage from './components/DashboardPage.jsx';
import OrdersPage from './components/OrdersPage.jsx';
import ProductsPage from './components/ProductsPage.jsx';
import POSTerminal from './components/POSTerminal.jsx';
import KdsScreen from './components/KdsScreen.jsx';
import TenantsPage from './components/TenantsPage.jsx';
import VendorsPage from './components/VendorsPage.jsx';
import RidersPage from './components/RidersPage.jsx';
import InventoryPage from './components/InventoryPage.jsx';
import ReportsPage from './components/ReportsPage.jsx';
import WalletsPage from './components/WalletsPage.jsx';
import B2BPage from './components/B2BPage.jsx';
import CustomersPage from './components/CustomersPage.jsx';
import UsersPage from './components/UsersPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import InvoicesPage from './components/InvoicesPage.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import HRPage from './components/HRPage.jsx';

export const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';
export const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('erp_token')}`
});

// ─── NAV CONFIG ────────────────────────────────────────────────────────────
const NAV = [
  { section: 'Main' },
  { id: 'dashboard',    label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'orders',       label: 'Orders',           icon: ShoppingCart,  badge: 'Live' },
  { id: 'pos',          label: 'POS Terminal',     icon: Receipt },
  { section: 'Catalog' },
  { id: 'products',     label: 'Products',         icon: Package },
  { id: 'categories',   label: 'Categories',       icon: Layers },
  { id: 'inventory',    label: 'Inventory',        icon: Factory },
  { section: 'People' },
  { id: 'users',        label: 'Users & Roles',    icon: Users },
  { id: 'vendors',      label: 'Vendors',          icon: Store },
  { id: 'riders',       label: 'Riders',           icon: Bike },
  { id: 'customers',    label: 'Customers',        icon: UserCog },
  { section: 'Operations' },
  { id: 'outlets',      label: 'Outlets & Tables', icon: MapPin },
  { id: 'kds',          label: 'Kitchen (KDS)',    icon: ChefHat },
  { id: 'delivery',     label: 'Delivery Zones',   icon: Truck },
  { section: 'Finance' },
  { id: 'reports',      label: 'Reports',          icon: BarChart3 },
  { id: 'invoices',     label: 'Invoices',         icon: FileText },
  { id: 'finance',      label: 'Payments',         icon: CreditCard },
  { id: 'commissions',  label: 'Commissions',      icon: Percent },
  { id: 'wallets',      label: 'Wallets',          icon: Wallet },
  { section: 'B2B & ERP' },
  { id: 'b2b',          label: 'B2B Portal',       icon: Briefcase },
  { id: 'hr',           label: 'HR & Staff',       icon: Users2 },
  { section: 'Marketing' },
  { id: 'coupons',      label: 'Coupons',          icon: Tag },
  { id: 'banners',      label: 'Banners',          icon: Image },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { section: 'Content' },
  { id: 'blog',         label: 'Blog / CMS',       icon: BookOpen },
  { id: 'faqs',         label: 'FAQs',             icon: HelpCircle },
  { section: 'System' },
  { id: 'tenants',      label: 'Tenants',          icon: Building },
  { id: 'leads',        label: 'Leads',            icon: UserPlus },
  { id: 'settings',     label: 'Settings',         icon: Settings },
  { id: 'api_keys',     label: 'API Keys',         icon: Key },
  { id: 'printers',     label: 'Printers',         icon: Printer },
];

const PAGE_TITLES = {
  dashboard:'Dashboard', orders:'Order Management', pos:'POS Terminal',
  products:'Products', categories:'Categories', inventory:'Inventory',
  users:'Users & Roles', vendors:'Vendor Management', riders:'Rider Management',
  customers:'Customer Management', outlets:'Outlets & Tables', kds:'Kitchen Display',
  delivery:'Delivery Zones', reports:'Reports & Analytics', invoices:'Invoices',
  finance:'Payments & Payouts', commissions:'Commissions', wallets:'Wallets & Ledger',
  b2b:'B2B Portal', hr:'HR & Staff', coupons:'Coupons', banners:'Banners',
  notifications:'Notifications', blog:'Blog / CMS', faqs:'FAQs',
  tenants:'Tenant Management', leads:'Leads',
  settings:'Settings', api_keys:'API Keys', printers:'Printers',
};

// ─── GENERIC PLACEHOLDER ────────────────────────────────────────────────────
function GenericPage({ icon: Icon, title, subtitle }) {
  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Icon size={20} />{title}</div>
      </div>
      <div className="glass-card" style={{ textAlign:'center', padding:56 }}>
        <Icon size={44} color="var(--text-light)" style={{ marginBottom:14 }} />
        <h3 style={{ marginBottom:6, color:'var(--text-main)' }}>{title}</h3>
        <p className="text-muted text-sm">{subtitle || 'Connected to API — data will appear here.'}</p>
      </div>
    </div>
  );
}

// ─── LOGIN ──────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@platform.com');
  const [password, setPassword] = useState('Admin1234!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('email');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      onLogin(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to server');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-brand-icon">⚡</div>
          <h1>GalaxyERP</h1>
          <p>Super Admin Dashboard</p>
        </div>

        <div className="tabs mb-20" style={{justifyContent:'center'}}>
          {['email','google','whatsapp'].map(t => (
            <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t==='email'?'Email':t==='google'?'Google':'WhatsApp'}
            </button>
          ))}
        </div>

        {error && <div className="login-error">{error}</div>}

        {tab==='email' && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-input" type="email" placeholder="admin@platform.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        )}

        {tab==='google' && (
          <button className="login-btn" style={{marginTop:0}} onClick={handleSubmit}>
            🔵 Continue with Google
          </button>
        )}

        {tab==='whatsapp' && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input className="form-input" type="tel" placeholder="+92 300 0000000" />
            </div>
            <button type="submit" className="login-btn">Send OTP via WhatsApp</button>
          </form>
        )}

        <div className="login-footer">
          Powered by <a href="#">GalaxyExpress Platform</a> · ERP v3.0
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN DASHBOARD SHELL ──────────────────────────────────────────────
function AdminDashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('erp_theme') === 'dark');
  const [searchGlobal, setSearchGlobal] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [data, setData] = useState({
    tenants:[], leads:[], users:[], orders:[], products:[],
    stats:{ totalTenants:0, totalUsers:0, totalOrders:0, totalRevenue:0 }
  });

  // Theme toggle
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('erp_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const loadData = useCallback(async () => {
    const h = headers();
    const safe = (url) => fetch(`${API}${url}`, { headers: h }).then(r => r.json()).catch(() => null);
    const [t, l, u, s, o, p] = await Promise.all([
      safe('/api/tenant'), safe('/api/leads'), safe('/api/users'),
      safe('/api/tenant/stats'), safe('/api/pos/orders'), safe('/api/products')
    ]);
    setData(prev => ({
      tenants:  Array.isArray(t) ? t : prev.tenants,
      leads:    Array.isArray(l) ? l : prev.leads,
      users:    Array.isArray(u) ? u : prev.users,
      orders:   Array.isArray(o) ? o : prev.orders,
      products: Array.isArray(p) ? p : prev.products,
      stats:    (s && s.totalTenants !== undefined) ? s : prev.stats,
    }));
  }, []);

  // Load data once + live polling every 8 seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Close sidebar on nav click (mobile)
  const navigate = (id) => { setPage(id); setSidebarOpen(false); };

  const renderPage = () => {
    switch(page) {
      case 'dashboard':   return <DashboardPage stats={data.stats} orders={data.orders} onNav={navigate} />;
      case 'orders':      return <OrdersPage orders={data.orders} onRefresh={loadData} />;
      case 'pos':         return <POSTerminal products={data.products} onRefresh={loadData} />;
      case 'products':    return <ProductsPage products={data.products} onRefresh={loadData} />;
      case 'kds':         return <KdsScreen orders={data.orders} onRefresh={loadData} />;
      case 'vendors':     return <VendorsPage />;
      case 'riders':      return <RidersPage />;
      case 'inventory':   return <InventoryPage products={data.products} />;
      case 'reports':     return <ReportsPage stats={data.stats} orders={data.orders} />;
      case 'invoices':    return <InvoicesPage />;
      case 'wallets':
      case 'finance':     return <WalletsPage />;
      case 'commissions': return <WalletsPage />;
      case 'b2b':         return <B2BPage />;
      case 'customers':   return <CustomersPage />;
      case 'users':       return <UsersPage users={data.users} onRefresh={loadData} />;
      case 'tenants':     return <TenantsPage tenants={data.tenants} onRefresh={loadData} />;
      case 'settings':    return <SettingsPage />;
      case 'categories':  return <GenericPage icon={Layers} title="Categories" subtitle="Manage product categories & subcategories" />;
      case 'outlets':     return <GenericPage icon={MapPin} title="Outlets & Tables" subtitle="Manage outlets, tables and QR codes" />;
      case 'delivery':    return <GenericPage icon={Truck} title="Delivery Zones" subtitle="Create map-based delivery zones" />;
      case 'coupons':     return <GenericPage icon={Tag} title="Coupons" subtitle="Create discount codes and offers" />;
      case 'banners':     return <GenericPage icon={Image} title="Banners" subtitle="Manage marketing banners" />;
      case 'notifications': return <GenericPage icon={Bell} title="Notifications" subtitle="Push notifications to users" />;
      case 'blog':        return <GenericPage icon={BookOpen} title="Blog / CMS" subtitle="Manage content pages" />;
      case 'faqs':        return <GenericPage icon={HelpCircle} title="FAQs" subtitle="Manage FAQ entries" />;
      case 'hr':          return <HRPage />;
      case 'api_keys':    return <GenericPage icon={Key} title="API Keys" subtitle="Manage Google, Firebase, Stripe keys" />;
      case 'printers':    return <GenericPage icon={Printer} title="Printers" subtitle="Configure thermal and A4 printers" />;
      case 'leads':       return <GenericPage icon={UserPlus} title="Lead Management" subtitle="Incoming vendor/tenant leads" />;
      default:            return <DashboardPage stats={data.stats} orders={data.orders} onNav={navigate} />;
    }
  };

  const initials = user.name ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'AD';

  return (
    <div className="admin-layout">
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">⚡</div>
            <div>
              <div className="brand-name">GalaxyERP</div>
              <div className="brand-tag">Super Admin</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((n, i) =>
            n.section
              ? <div key={i} className="nav-section-title">{n.section}</div>
              : (
                <div
                  key={n.id}
                  className={`nav-item ${page === n.id ? 'active' : ''}`}
                  onClick={() => navigate(n.id)}
                >
                  <n.icon size={16} />
                  {n.label}
                  {n.badge && <span className="nav-badge">{n.badge}</span>}
                </div>
              )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={() => setShowProfile(true)} title="View Profile">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role?.replace('_', ' ')}</div>
            </div>
            <UserCog size={15} color="var(--text-muted)" />
          </div>
        </div>
      </aside>

      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div className="topbar-left">
          {/* Hamburger — visible only on mobile */}
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <h1 className="page-title">{PAGE_TITLES[page] || 'Dashboard'}</h1>
        </div>
        <div className="topbar-right">
          <input
            className="search-global"
            placeholder="Search…"
            value={searchGlobal}
            onChange={e => setSearchGlobal(e.target.value)}
          />
          <button className="topbar-btn" onClick={loadData} title="Refresh data">
            <RefreshCw size={16} />
          </button>
          <button className="topbar-btn" title="Notifications">
            <Bell size={16} />
            <span className="notif-dot" />
          </button>
          <button className="topbar-btn" onClick={() => setIsDark(d => !d)} title="Toggle theme">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content" key={page}>
        {renderPage()}
      </main>

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={onLogout}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
        />
      )}
    </div>
  );
}

// ─── APP ENTRY ───────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const savedUser = localStorage.getItem('erp_user');
    if (token && savedUser) {
      try {
        // Support both real JWT and demo token
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const notExpired = !payload.exp || payload.exp * 1000 > Date.now();
          if (notExpired) { setUser(JSON.parse(savedUser)); setAuthed(true); return; }
        }
      } catch { /* ignore */ }
    }
  }, []);

  if (!authed) return (
    <LoginScreen onLogin={(data) => { setUser(data.user); setAuthed(true); }} />
  );
  return (
    <AdminDashboard
      user={user}
      onLogout={() => {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        setAuthed(false); setUser(null);
      }}
    />
  );
}
