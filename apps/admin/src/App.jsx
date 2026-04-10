import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store, Bike, FileText,
  CreditCard, Bell, Settings, Building, UserPlus, ChefHat, Printer,
  LogOut, RefreshCw, Moon, Sun, Globe, TrendingUp, DollarSign, Layers,
  Tag, Image, BookOpen, Key, UserCog, MapPin, Receipt, Percent, Wallet,
  Truck, Shield, HelpCircle, BarChart3, MessageCircle, Menu, X,
  ShoppingBag, Factory, Briefcase, Users2, ClipboardList, Search, Eye,
  Clock, CheckCircle, Star, ShieldCheck
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
import AuditReportPage from './components/AuditReportPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import UsersPage from './components/UsersPage.jsx';
import ApiConfigPanel from './components/ApiConfigPanel.jsx';
import LoginPage from '@shared/LoginPage.jsx';
import { useAuth } from '@shared/AuthContext.jsx';

export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('erp_token')}`
});

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
  
  { section: 'System Control' },
  { id: 'api_config', label: 'API Config', icon: Key, role: 'SUPER_ADMIN' },
  { id: 'audit', label: 'System Audit', icon: ShieldCheck },
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
    tenants: [], stats: { totalOrders: 0, totalRevenue: 0 }, orders: [], users: []
  });

  // Re-sync theme
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
    localStorage.setItem('erp_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Auth Bridge
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bridgeToken = params.get('bridge_token');
    const bridgeUser = params.get('bridge_user');

    if (bridgeToken && bridgeUser) {
      localStorage.setItem('erp_token', bridgeToken);
      localStorage.setItem('erp_user', bridgeUser);
      const url = new URL(window.location);
      url.searchParams.delete('bridge_token');
      url.searchParams.delete('bridge_user');
      window.history.replaceState({}, '', url);
      window.location.reload();
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      // Fetch Tenants
      if (isAdmin) {
        const tRes = await fetch(`${API}/api/tenant`, { headers: headers() });
        if (tRes.ok) {
          const tData = await tRes.json();
          setData(prev => ({ ...prev, tenants: tData }));
        }
      }

      // Fetch Orders
      const orderUrl = activeTenant 
        ? `${API}/api/pos/orders?tenantId=${activeTenant.id}`
        : `${API}/api/pos/orders`;
      const oRes = await fetch(orderUrl, { headers: headers() });
      if (oRes.ok) {
        const oData = await oRes.json();
        setData(prev => ({ ...prev, orders: oData }));
      }

      // Fetch Users
      const uRes = await fetch(`${API}/api/users`, { headers: headers() });
      if (uRes.ok) {
        const uData = await uRes.json();
        setData(prev => ({ ...prev, users: uData }));
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    }
  }, [isAuthenticated, isAdmin, activeTenant]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

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
    tenants: <TenantsPage tenants={data.tenants} onRefresh={fetchData} />,
    orders: <OrdersPage orders={data.orders} onRefresh={fetchData} />,
    pos: <POSTerminal products={[]} />,
    menu: <MenuManagement API={API} vendor={user} />,
    inventory: <InventoryERP />,
    finance: <AccountsERP />,
    daily_closing: <DailyClosingERP />,
    opening_times: <OpeningTimes />,
    gallery: <GalleryPage user={user} />,
    audit: <AuditReportPage />,
    settings: <SettingsPage />,
    users: <UsersPage users={data.users} onRefresh={fetchData} />,
    api_config: <ApiConfigPanel />,
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
               <div className="user-role">{isAdmin ? 'Super Admin' : (user.role || 'User')}</div>
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
           <h1 className="page-title">{page.replace('_', ' ').toUpperCase()}</h1>
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
          <button className="topbar-btn" title="Refresh Data" onClick={fetchData}>
             <RefreshCw size={16} />
          </button>
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
