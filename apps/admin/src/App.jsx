import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store, Bike, FileText,
  CreditCard, Bell, Settings, Building, UserPlus, ChefHat, Printer,
  LogOut, RefreshCw, Moon, Sun, Globe, TrendingUp, DollarSign, Layers,
  Tag, Image, BookOpen, Key, UserCog, MapPin, Receipt, Percent, Wallet,
  Truck, Shield, HelpCircle, BarChart3, MessageCircle, Menu, X,
  ShoppingBag, Factory, Briefcase, Users2, ClipboardList, Search, Eye,
  Clock, CheckCircle, Star
} from 'lucide-react';

import DashboardPage from './components/DashboardPage.jsx';
import OrdersPage from './components/OrdersPage.jsx';
import ProductsPage from './components/ProductsPage.jsx';
import POSTerminal from './components/POSTerminal.jsx';
import TenantsPage from './components/TenantsPage.jsx';
import InventoryERP from './components/erp/InventoryERP.jsx';
import AccountsERP from './components/erp/AccountsERP.jsx';
import DailyClosingERP from './components/erp/DailyClosingERP.jsx';
import MenuManagement from './components/MenuManagement.jsx';
import OpeningTimes from './components/OpeningTimes.jsx';
import GalleryPage from './components/GalleryPage.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import LoginPage from '@shared/LoginPage.jsx';
import { useAuth } from '@shared/AuthContext.jsx';
import { db } from '@shared/firebase.js';
import { onSnapshot, collection, query, where, orderBy, doc } from 'firebase/firestore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── UNIFIED NAV CONFIG ──────────────────────────────────────────────────
const NAV = [
  { section: 'Platform Control' },
  { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard },
  { id: 'tenants', label: 'Tenants & Subs', icon: Building, role: 'SUPER_ADMIN' },
  
  { section: 'Operations' },
  { id: 'pos', label: 'POS Terminal', icon: Receipt },
  { id: 'orders', label: 'Order Pipeline', icon: ShoppingCart, badge: 'Live' },
  { id: 'menu', label: 'Menu Management', icon: BookOpen },
  { id: 'opening_times', label: 'Opening Times', icon: Clock },

  { section: 'ERP & Finance' },
  { id: 'inventory', label: 'Inventory (B2B)', icon: Factory },
  { id: 'finance', label: 'Accounting Hub', icon: BarChart3 },
  { id: 'daily_closing', label: 'Daily Closings', icon: RefreshCw },
  { id: 'wallets', label: 'Wallets', icon: Wallet },

  { section: 'Governance' },
  { id: 'users', label: 'Users & RBAC', icon: Users },
  { id: 'outlets', label: 'Outlets', icon: MapPin },
  
  { section: 'Resources' },
  { id: 'gallery', label: 'Media Assets', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const { user, loading, logout, isAuthenticated, isAdmin } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('erp_theme') !== 'light');
  const [activeTenant, setActiveTenant] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  
  const [data, setData] = useState({
    tenants: [], stats: { totalOrders: 0, totalRevenue: 0 }, orders: []
  });

  // Re-sync theme
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('erp_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Real-time Data Sync
  useEffect(() => {
    if (!isAuthenticated) return;

    // Tenants Listener (Super Admin only)
    let unsubTenants = () => {};
    if (isAdmin) {
      unsubTenants = onSnapshot(collection(db, 'tenants'), (snap) => {
        setData(prev => ({ ...prev, tenants: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      });
    }

    // Orders Listener (Scoped to context)
    const targetId = activeTenant?.id || user?.tenantId || user?.id;
    const qOrders = query(
      collection(db, 'orders'),
      where('tenantId', '==', targetId),
      orderBy('createdAt', 'desc')
    );
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setData(prev => ({ ...prev, orders: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
    });

    return () => { unsubTenants(); unsubOrders(); };
  }, [isAuthenticated, isAdmin, activeTenant, user]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#050906' }}>
      <RefreshCw size={48} color="#39FF14" className="spin" />
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isAuthenticated) return (
    <LoginPage 
      title="Galaxy Express" 
      subtitle="Unified ERP & Multi-Vendor Console" 
      onSuccess={() => {}} 
    />
  );

  const renders = {
    dashboard: <DashboardPage stats={data.stats} orders={data.orders} onNav={setPage} />,
    tenants: <TenantsPage tenants={data.tenants} />,
    orders: <OrdersPage orders={data.orders} />,
    pos: <POSTerminal products={[]} />,
    menu: <MenuManagement API={API} vendor={user} />,
    inventory: <InventoryERP />,
    finance: <AccountsERP />,
    daily_closing: <DailyClosingERP />,
    opening_times: <OpeningTimes />,
    gallery: <GalleryPage user={user} />,
    settings: <Settings />,
  };

  const navItems = NAV.filter(n => !n.role || (n.role === 'SUPER_ADMIN' && isAdmin));

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">⚡</div>
            <div>
              <div className="brand-name">Galaxy Express</div>
              <div className="brand-tag">{isAdmin ? 'Master Control' : 'Partner Node'}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((n, i) => n.section 
            ? <div key={i} className="nav-section-title">{n.section}</div>
            : (
              <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <n.icon size={18} />
                {n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={() => setShowProfile(true)}>
             <div className="user-avatar">{user.name?.[0].toUpperCase()}</div>
             <div className="user-info">
               <div className="user-name">{user.name}</div>
               <div className="user-role">{isAdmin ? 'Super Admin' : 'Vendor'}</div>
             </div>
             <UserCog size={14} />
          </div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-left">
           <button className="hamburger-btn" style={{ display: 'flex' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
             <Menu size={18} />
           </button>
           <h1 className="page-title">{page.toUpperCase()}</h1>
        </div>

        {isAdmin && (
          <div className="topbar-center" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(57,255,20,0.05)', padding: '6px 16px', borderRadius: 12, border: '1px solid rgba(57,255,20,0.2)' }}>
              <Store size={14} color="#39FF14" />
              <select 
                value={activeTenant?.id || ''} 
                onChange={e => setActiveTenant(data.tenants.find(t => t.id === e.target.value) || null)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 700, outline: 'none' }}
              >
                <option value="">🌐 GLOBAL MONITOR</option>
                {data.tenants.map(t => <option key={t.id} value={t.id}>🏢 {t.name}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="topbar-right">
          <button className="topbar-btn" onClick={() => setIsDark(!isDark)}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="topbar-btn" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="main-content">
        {renders[page] || <div className="glass-card">Coming Soon</div>}
      </main>

      {showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onLogout={logout} 
          isDark={isDark}
        />
      )}
    </div>
  );
}
