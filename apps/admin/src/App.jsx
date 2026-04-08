import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store, Bike, FileText,
  CreditCard, Bell, Settings, Building, UserPlus, ChefHat, Printer,
  LogOut, RefreshCw, Moon, Sun, Globe, TrendingUp, DollarSign, Layers,
  Tag, Image, BookOpen, Key, UserCog, MapPin, Receipt, Percent, Wallet,
  Truck, Shield, HelpCircle, BarChart3, MessageCircle, Menu, X,
  ShoppingBag, Factory, Briefcase, Users2, ClipboardList, Search, Eye
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
import CategoriesPage from './components/CategoriesPage.jsx';
import OutletsPage from './components/OutletsPage.jsx';
import GalleryPage from './components/GalleryPage.jsx';

// UNIFIED ERP COMPONENTS (MIGRATED FROM VENDOR)
import InventoryERP from './components/erp/InventoryERP.jsx';
import AccountsERP from './components/erp/AccountsERP.jsx';
import DailyClosingERP from './components/erp/DailyClosingERP.jsx';
import MasterConfiguration from './components/erp/MasterConfiguration.jsx';

export const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';

// Headers helper now handles impersonation
export const getHeaders = (impersonateId = null) => {
  const h = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('erp_token')}`
  };
  if (impersonateId) h['x-impersonate-tenant'] = impersonateId;
  return h;
};

// ─── NAV CONFIG ────────────────────────────────────────────────────────────
const NAV = [
  { section: 'Global SaaS Control' },
  { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard },
  { id: 'tenants', label: 'Tenants & Subs', icon: Building, badge: 'SaaS' },
  { id: 'leads', label: 'Inbound Leads', icon: UserPlus },
  
  { section: 'Merchant Operations' },
  { id: 'pos', label: 'Cloud POS Terminal', icon: Receipt },
  { id: 'orders', label: 'Unified Orders', icon: ShoppingCart, badge: 'Live' },
  { id: 'inventory_erp', label: 'Inventory (B2B)', icon: Factory },
  { id: 'daily_closing', label: 'Daily Closings', icon: RefreshCw },

  { section: 'Finance & ERP' },
  { id: 'finance_erp', label: 'Accounting Hub', icon: BarChart3 },
  { id: 'invoices', label: 'Bill Generation', icon: FileText },
  { id: 'wallets', label: 'Partner Wallets', icon: Wallet },
  { id: 'products', label: 'Master Catalog', icon: Package },

  { section: 'Governance' },
  { id: 'users', label: 'Users & RBAC', icon: Users },
  { id: 'hr', label: 'HR & Management', icon: Users2 },
  { id: 'outlets', label: 'Global Outlets', icon: MapPin },
  { id: 'delivery', label: 'Logistics Control', icon: Truck },

  { section: 'Marketing & CRM' },
  { id: 'customers', label: 'Customer DB', icon: UserCog },
  { id: 'coupons', label: 'Coupons/Offers', icon: Tag },
  { id: 'banners', label: 'Banners Hub', icon: Image },

  { section: 'Cloud Infrastructure' },
  { id: 'gallery', label: 'Media Assets', icon: Image },
  { id: 'api_keys', label: 'Service Microkeys', icon: Key },
  { id: 'settings', label: 'Global Setup', icon: Settings },
];

const PAGE_TITLES = {
  dashboard: 'Monitoring Dashboard', orders: 'Unified Order Control', pos: 'Cloud POS Terminal',
  products: 'Global Catalog', inventory_erp: 'ERP Inventory Controller',
  users: 'RBAC - Access Control', finance_erp: 'Accounting Hub (Unified)',
  tenants: 'SaaS Tenant Management', daily_closing: 'Operational Closings',
  gallery: 'Cloud Media Assets', settings: 'Infrastructure Setup', hr: 'Employee Management',
};

// ─── GENERIC PLACEHOLDER ────────────────────────────────────────────────────
function GenericPage({ icon: Icon, title, subtitle }) {
  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Icon size={20} />{title}</div>
      </div>
      <div className="glass-card" style={{ textAlign: 'center', padding: 56 }}>
        <Icon size={44} color="var(--text-light)" style={{ marginBottom: 14 }} />
        <h3 style={{ marginBottom: 6, color: 'var(--text-main)' }}>{title}</h3>
        <p className="text-muted text-sm">{subtitle || 'Connected to API — data will appear here.'}</p>
      </div>
    </div>
  );
}

import { auth, db } from './lib/firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Credentials required');
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found in database');
      }

      const userData = userDoc.data();
      if (userData.role !== 'SUPER_ADMIN') {
        await signOut(auth);
        throw new Error('Unauthorized role for Admin Panel');
      }

      onLogin(userData);
    } catch (err) {
      console.error("FULL LOGIN ERROR:", err);
      // Show exact error message to user for debugging
      setError(err.code || err.message || 'Unknown Authentication Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page" style={{
      background: 'radial-gradient(circle at top left, #1e1b4b, #000000)',
      height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="login-container glass-card" style={{
        width: 400, padding: 40, borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(2, 8, 23, 0.7)', backdropFilter: 'blur(12px)'
      }}>
        <div className="login-brand" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="login-brand-icon" style={{
            fontSize: '3rem', marginBottom: 12,
            background: 'linear-gradient(45deg, #39FF14, #8de02c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>⚡</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: '#fff' }}>Partner Panel</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: '0.9rem' }}>partner.galaxyexpress.pk</p>
        </div>

        {error && <div className="login-error" style={{
          padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
          borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 24,
          fontSize: '0.85rem', fontWeight: 600, textAlign: 'center'
        }}>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Email Address</label>
            <input className="form-input" type="email" placeholder="admin@galaxyexpress.pk"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem'
              }}
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem'
              }}
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-btn" disabled={loading} style={{
            width: '100%', padding: '16px', borderRadius: 15, background: 'linear-gradient(45deg, #39FF14, #8de02c)',
            color: '#000', fontWeight: 900, border: 'none', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 16px -4px rgba(57, 255, 20, 0.4)', fontSize: '1rem'
          }}>
            {loading ? 'Authenticating…' : 'Sign In To System →'}
          </button>
        </form>

        <div className="login-footer" style={{ textAlign: 'center', marginTop: 40, color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          Restricted Access · GalaxyERP v3.0 Production
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
  
  // ─── SAAS IMPERSONATION STATE ─────────────────────────────────────────────
  const [activeTenant, setActiveTenant] = useState(null);
  
  const [data, setData] = useState({
    tenants: [], leads: [], users: [], orders: [], products: [],
    stats: { totalTenants: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 }
  });

  const headers = useMemo(() => getHeaders(activeTenant?.id), [activeTenant]);

  // Theme toggle
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('erp_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // ─── REAL-TIME DATA SYNC ───
  useEffect(() => {
    // 1. Tenants Listener
    const unsubTenants = onSnapshot(collection(db, 'tenants'), (snap) => {
      const t = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(prev => ({ ...prev, tenants: t }));
    });

    // 2. Global Stats (Pseudo-aggregation or dedicated doc)
    const unsubStats = onSnapshot(doc(db, 'stats', 'global'), (snap) => {
      if (snap.exists()) setData(prev => ({ ...prev, stats: snap.data() }));
    });

    // 3. Orders Listener (Optionally scoped to tenant)
    const ordersRef = collection(db, 'orders');
    const qOrders = activeTenant 
      ? query(ordersRef, where('tenantId', '==', activeTenant.id), orderBy('createdAt', 'desc'))
      : query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const o = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(prev => ({ ...prev, orders: o }));
    });

    return () => {
      unsubTenants();
      unsubStats();
      unsubOrders();
    };
  }, [activeTenant]);

  const loadData = useCallback(() => {
    // Legacy fetch logic replaced by Real-time listeners above
    console.log('Real-time sync active...');
  }, []);

  // Close sidebar on nav click (mobile)
  const navigate = (id) => { setPage(id); setSidebarOpen(false); };


  const renderPage = () => {
    // Current context for child components
    const ctxProps = { headers, activeTenant, onRefresh: loadData };

    switch (page) {
      case 'dashboard': return <DashboardPage stats={data.stats} orders={data.orders} onNav={navigate} />;
      case 'orders': return <OrdersPage orders={data.orders} {...ctxProps} />;
      case 'pos': return <POSTerminal products={data.products} {...ctxProps} />;
      case 'products': return <ProductsPage products={data.products} {...ctxProps} />;
      case 'inventory_erp': return <InventoryERP tenant={activeTenant} headers={headers} />;
      case 'finance_erp': return <AccountsERP tenant={activeTenant} headers={headers} />;
      case 'daily_closing': return <DailyClosingERP tenant={activeTenant} headers={headers} />;
      case 'kds': return <KdsScreen orders={data.orders} {...ctxProps} />;
      case 'vendors': return <VendorsPage />;
      case 'riders': return <RidersPage />;
      case 'wallets':
      case 'finance': return <WalletsPage />;
      case 'commissions': return <WalletsPage />;
      case 'customers': return <CustomersPage />;
      case 'users': return <UsersPage users={data.users} {...ctxProps} />;
      case 'tenants': return <TenantsPage tenants={data.tenants} {...ctxProps} />;
      case 'settings': return <SettingsPage />;
      case 'outlets': return <OutletsPage />;
      case 'delivery': return <GenericPage icon={Truck} title="Delivery Zones" subtitle="Create map-based delivery zones" />;
      case 'coupons': return <GenericPage icon={Tag} title="Coupons" subtitle="Create discount codes and offers" />;
      case 'banners': return <GenericPage icon={Image} title="Banners Hub" subtitle="Manage marketing banners" />;
      case 'blog': return <GenericPage icon={BookOpen} title="Blog / CMS" subtitle="Manage content pages" />;
      case 'hr': return <HRPage />;
      case 'api_keys': return <GenericPage icon={Key} title="API Keys" subtitle="Manage Google, Firebase, Stripe keys" />;
      case 'leads': return <GenericPage icon={UserPlus} title="Lead Management" subtitle="Incoming vendor/tenant leads" />;
      case 'gallery': return <GalleryPage user={user} />;
      default: return <DashboardPage stats={data.stats} orders={data.orders} onNav={navigate} />;
    }
  };

  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'AD';

  return (
    <div className="admin-layout">
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">⚡</div>
            <div>
              <div className="brand-name">Partner Panel</div>
              <div className="brand-tag">partner.galaxyexpress.pk</div>
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
                  onClick={() => { navigate(n.id); setSidebarOpen(false); }}
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
      <header className="topbar" style={{ height: activeTenant ? 85 : 70 }}>
        <div className="topbar-left">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <span>Infrastructure</span> <span style={{ opacity: 0.3 }}>/</span> 
              <span>{activeTenant ? `Tenant: ${activeTenant.name}` : 'Global Monitor'}</span>
            </div>
            <h1 className="page-title" style={{ marginTop: -2, fontSize: '1.2rem' }}>{PAGE_TITLES[page] || 'Core Control'}</h1>
          </div>
        </div>

        {/* ── SAAS TENANT SWITCHER ── */}
        <div className="topbar-center" style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: activeTenant ? 'rgba(57, 255, 20, 0.08)' : 'var(--bg-card)', padding: '6px 14px', borderRadius: 12, border: `1px solid ${activeTenant ? '#39FF14' : 'var(--border-color)'}`, transition: '0.3s' }}>
            <Building size={16} color={activeTenant ? '#39FF14' : 'var(--text-muted)'} />
            <select 
              value={activeTenant?.id || ''} 
              onChange={(e) => {
                const t = data.tenants.find(x => x.id === e.target.value);
                setActiveTenant(t || null);
                loadData();
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.85rem', outline: 'none', cursor: 'pointer', minWidth: 200 }}
            >
              <option value="">🌐 GLOBAL PLATFORM VIEW</option>
              {data.tenants.map(t => (
                <option key={t.id} value={t.id}>🏢 {t.name} ({t.subdomain})</option>
              ))}
            </select>
            {activeTenant && <div style={{ background: '#39FF14', color: '#000', fontSize: '0.55rem', fontWeight: 900, padding: '2px 5px', borderRadius: 4 }}>LIVE IMPERSONATION</div>}
          </div>
        </div>

        <div className="topbar-right">
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0 12px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              className="search-global"
              style={{ border: 'none', background: 'transparent', backgroundImage: 'none' }}
              placeholder="Search data..."
              value={searchGlobal}
              onChange={e => setSearchGlobal(e.target.value)}
            />
          </div>
          <button className="topbar-btn" onClick={loadData} title="Force Resync All Data">
            <RefreshCw size={16} />
          </button>
          <button className="topbar-btn" onClick={() => setIsDark(d => !d)}>
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional role data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'SUPER_ADMIN') {
            setUser(userData);
            setAuthed(true);
          } else {
            await signOut(auth);
            setAuthed(false);
          }
        }
      } else {
        setAuthed(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!authed) return (
    <LoginScreen onLogin={(userData) => { setUser(userData); setAuthed(true); }} />
  );
  return (
    <AdminDashboard
      user={user}
      onLogout={async () => {
        await signOut(auth);
        setAuthed(false); 
        setUser(null);
      }}
    />
  );
}
