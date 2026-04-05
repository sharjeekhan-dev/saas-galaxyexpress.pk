import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { LayoutDashboard, Users, Building, CreditCard, Settings, LogOut, UserPlus, FileText, Bell, Shield, HelpCircle } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { NotificationAlerts } from './shared/useSocket.jsx';
import { useTranslation } from './shared/useTranslation.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ============ LOGIN PAGE ============
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.fromTo('.login-container', { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'].includes(data.user.role)) {
        setError('Access denied. Admin role required.'); setLoading(false); return;
      }
      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      gsap.to('.login-container', { scale: 0.95, opacity: 0, duration: 0.3, onComplete: () => onLogin(data) });
    } catch { setError('Network error. Is the API running?'); setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-brand-icon">🛡️</div>
          <h1>Admin Panel</h1>
          <p>Super Admin & Tenant Management</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" placeholder="admin@platform.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="login-footer">Powered by <a href="#">SaaS ERP Platform</a></div>
      </div>
    </div>
  );
}

// ============ ADMIN DASHBOARD ============
function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [tenants, setTenants] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalTenants: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 });
  const [showModal, setShowModal] = useState(null);
  const token = localStorage.getItem('erp_token');

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    gsap.fromTo('.sidebar', { x: -200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    gsap.fromTo('.main-content', { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2 });
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [t, l, u, s] = await Promise.all([
        fetch(`${API}/api/tenant`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`${API}/api/leads`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`${API}/api/users`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`${API}/api/tenant/stats`, { headers }).then(r => r.json()).catch(() => ({})),
      ]);
      if (Array.isArray(t)) setTenants(t);
      if (Array.isArray(l)) setLeads(l);
      if (Array.isArray(u)) setUsers(u);
      if (s.totalTenants !== undefined) setStats(s);
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    onLogout();
  };

  const createTenant = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    await fetch(`${API}/api/tenant`, {
      method: 'POST', headers,
      body: JSON.stringify({ name: form.get('name'), subdomain: form.get('subdomain'), plan: form.get('plan') })
    });
    setShowModal(null);
    loadData();
  };

  const createUser = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    await fetch(`${API}/api/users`, {
      method: 'POST', headers,
      body: JSON.stringify({ name: form.get('name'), email: form.get('email'), password: form.get('password'), role: form.get('role') })
    });
    setShowModal(null);
    loadData();
  };

  const convertLead = async (id) => {
    await fetch(`${API}/api/leads/${id}/convert`, { method: 'PUT', headers });
    loadData();
  };

  const suspendTenant = async (id) => {
    await fetch(`${API}/api/tenant/${id}`, { method: 'DELETE', headers });
    loadData();
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ label: 'Revenue', data: [12000, 19000, 30000, 50000, 48000, stats.totalRevenue || 65000], backgroundColor: 'rgba(6, 182, 212, 0.5)', borderColor: '#06b6d4', borderWidth: 1 }]
  };

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
    { id: 'live_orders', label: 'Live Orders', icon: <Bell size={18}/> },
    { id: 'tenants', label: 'Tenants', icon: <Building size={18}/> },
    { id: 'users', label: 'Users & Roles', icon: <Users size={18}/> },
    { id: 'leads', label: 'Leads', icon: <UserPlus size={18}/> },
    { id: 'reports', label: 'Reports', icon: <FileText size={18}/> },
    { id: 'invoicing', label: 'Invoicing & Print', icon: <FileText size={18}/> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18}/> },
  ];

  return (
    <div className="admin-layout">
      <NotificationAlerts />
      <aside className="sidebar">
        <div className="brand">⚡ SaaS Admin</div>
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>{n.icon} {n.label}</div>
        ))}
        <div style={{ marginTop: 'auto' }} className="nav-item" onClick={handleLogout}><LogOut size={18}/> Logout</div>
      </aside>

      <main className="main-content">
        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <>
            <h1 style={{ marginBottom: 30, fontSize: '2rem' }}>Platform Overview</h1>
            <div className="stat-grid">
              <div className="glass-card"><div className="stat-label">Total Tenants</div><div className="stat-value">{stats.totalTenants}</div></div>
              <div className="glass-card"><div className="stat-label">Active Users</div><div className="stat-value">{stats.totalUsers}</div></div>
              <div className="glass-card"><div className="stat-label">Total Orders</div><div className="stat-value">{stats.totalOrders}</div></div>
              <div className="glass-card"><div className="stat-label">Revenue</div><div className="stat-value">${(stats.totalRevenue || 0).toLocaleString()}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="glass-card">
                <div className="section-title"><Building size={20}/> Recent Tenants</div>
                <div className="table-container"><table><thead><tr><th>Name</th><th>Plan</th><th>Status</th></tr></thead><tbody>
                  {tenants.slice(0, 5).map(t => (
                    <tr key={t.id}><td>{t.name}<br/><small style={{ color: 'var(--text-muted)' }}>{t.subdomain}</small></td><td><b>{t.plan}</b></td>
                    <td><span className={`badge ${t.isActive ? 'badge-active' : 'badge-suspended'}`}>{t.isActive ? 'ACTIVE' : 'SUSPENDED'}</span></td></tr>
                  ))}
                  {tenants.length === 0 && <tr><td colSpan="3" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No tenants yet</td></tr>}
                </tbody></table></div>
              </div>
              <div className="glass-card">
                <div className="section-title" style={{ color: 'var(--neon-purple)' }}><CreditCard size={20}/> Revenue Chart</div>
                <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ticks: { color: '#94a3b8' }, grid: { display: false } } } }} />
              </div>
            </div>
          </>
        )}

        {/* TENANTS */}
        {page === 'tenants' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <h1 style={{ fontSize: '2rem' }}>Tenant Management</h1>
              <button className="btn-sm btn-cyan" onClick={() => setShowModal('tenant')}>+ New Tenant</button>
            </div>
            <div className="table-container"><table><thead><tr><th>Name</th><th>Subdomain</th><th>Plan</th><th>Status</th><th>Actions</th></tr></thead><tbody>
              {tenants.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td><td>{t.subdomain}</td><td>{t.plan}</td>
                  <td><span className={`badge ${t.isActive ? 'badge-active' : 'badge-suspended'}`}>{t.isActive ? 'ACTIVE' : 'SUSPENDED'}</span></td>
                  <td><button className="btn-sm btn-red" onClick={() => suspendTenant(t.id)}>Suspend</button></td>
                </tr>
              ))}
            </tbody></table></div>
          </>
        )}

        {/* USERS */}
        {page === 'users' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <h1 style={{ fontSize: '2rem' }}>Users & Roles</h1>
              <button className="btn-sm btn-cyan" onClick={() => setShowModal('user')}>+ Add User</button>
            </div>
            <div className="table-container"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead><tbody>
              {users.map(u => (
                <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><span className="badge badge-active" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>{u.role}</span></td>
                <td style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td></tr>
              ))}
            </tbody></table></div>
          </>
        )}

        {/* LEADS */}
        {page === 'leads' && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: 30 }}>Lead Capture</h1>
            <div className="table-container"><table><thead><tr><th>Name</th><th>Business</th><th>Type</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {leads.map(l => (
                <tr key={l.id}><td>{l.name}</td><td>{l.businessName}</td><td>{l.businessType}</td>
                <td><span className="badge badge-active">{l.status}</span></td>
                <td>{l.status !== 'CONVERTED' && <button className="btn-sm btn-green" onClick={() => convertLead(l.id)}>Convert to Tenant</button>}</td></tr>
              ))}
              {leads.length === 0 && <tr><td colSpan="5" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No leads yet</td></tr>}
            </tbody></table></div>
          </>
        )}

        {/* REPORTS PLACEHOLDER */}
        {page === 'reports' && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: 30 }}>Reports</h1>
            <div className="stat-grid">
              {['Sales Report', 'Inventory Valuation', 'Shift Reconciliation', 'Vendor Performance', 'Rider Deliveries', 'Tax Collected'].map(r => (
                <div key={r} className="glass-card" style={{ cursor: 'pointer' }}>
                  <div className="section-title"><FileText size={18}/> {r}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click to generate</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* SETTINGS */}
        {page === 'settings' && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: 30 }}>Global Settings</h1>
            
            <div className="glass-card" style={{ marginBottom: 24 }}>
              <div className="section-title"><Settings size={20}/> Platform Branding</div>
              <form style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div className="form-group">
                  <label>Global Platform Logo URL</label>
                  <input className="form-input" placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Default Invoice Logo URL</label>
                  <input className="form-input" placeholder="https://..." />
                </div>
                <button type="button" className="btn-sm btn-cyan" style={{ alignSelf: 'flex-start' }}>Save Branding</button>
              </form>
            </div>

            <div className="glass-card" style={{ marginBottom: 24 }}>
              <div className="section-title"><FileText size={20}/> Localization & Translations (EN / UR)</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>Changes propagate immediately to all web/app clients without redeployment.</p>
              <div className="table-container">
                <table>
                  <thead><tr><th>Key</th><th>English</th><th>Roman Urdu</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr><td>ui.button.checkout</td><td>Checkout</td><td>Checkout Karein</td><td><button className="btn-sm btn-outline">Edit</button></td></tr>
                    <tr><td>ui.label.total</td><td>Total Amount</td><td>Kul Raqam</td><td><button className="btn-sm btn-outline">Edit</button></td></tr>
                  </tbody>
                </table>
              </div>
              <button className="btn-sm btn-cyan" style={{ marginTop: 16 }}>+ Add Translation Key</button>
            </div>

            <div className="glass-card" style={{ marginBottom: 24 }}>
              <div className="section-title"><HelpCircle size={20}/> FAQ Management</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>Manage FAQs displayed across customer, vendor, and rider portals.</p>
              <div className="table-container">
                <table>
                  <thead><tr><th>Target Role</th><th>Question</th><th>Pos</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr><td><span className="badge">VENDOR</span></td><td>How do payouts work?</td><td>1</td><td><button className="btn-sm btn-outline">Edit</button></td></tr>
                    <tr><td><span className="badge">RIDER</span></td><td>How do I mark an order delivered?</td><td>1</td><td><button className="btn-sm btn-outline">Edit</button></td></tr>
                  </tbody>
                </table>
              </div>
              <button className="btn-sm btn-cyan" style={{ marginTop: 16 }}>+ Add FAQ</button>
            </div>

            <div className="glass-card" style={{ maxWidth: 600 }}>
              <div className="section-title"><Shield size={20}/> Payment Gateways</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Stripe</span><span className="badge badge-active">ENABLED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>GoPayFast</span><span className="badge badge-active">ENABLED</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* INVOICING & PRINTERS */}
        {page === 'invoicing' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <h1 style={{ fontSize: '2rem' }}>Invoicing & Print Management</h1>
              <button className="btn-sm btn-cyan">+ Add Printer</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="glass-card">
                <div className="section-title">Network Printers</div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>IP/Port</th><th>Type</th><th>Dept/Outlet</th></tr></thead>
                    <tbody>
                      <tr><td>Kitchen Main</td><td>192.168.1.50:9100</td><td><span className="badge">THERMAL</span></td><td>Kitchen</td></tr>
                      <tr><td>Cashier A4</td><td>192.168.1.51:9100</td><td><span className="badge">A4</span></td><td>Main Branch</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="glass-card">
                <div className="section-title">Invoice Templates</div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Actions</th></tr></thead>
                    <tbody>
                      <tr><td>Standard Thermal</td><td><span className="badge">THERMAL</span></td><td><span className="badge badge-active">YES</span></td><td><button className="btn-sm btn-outline">Edit Code</button></td></tr>
                      <tr><td>Retail A4 (Clothing)</td><td><span className="badge">A4</span></td><td><span className="badge badge-active">YES</span></td><td><button className="btn-sm btn-outline">Edit Code</button></td></tr>
                    </tbody>
                  </table>
                </div>
                <button className="btn-sm btn-cyan" style={{ marginTop: 16 }}>+ Add Template</button>
              </div>
            </div>
          </>
        )}

        {/* LIVE ORDERS */}
        {page === 'live_orders' && (
          <>
            <h1 style={{ fontSize: '2rem', marginBottom: 30 }}>Live Dispatch & Monitoring</h1>
            <div className="glass-card">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', display: 'inline-block' }}></span> 
                Live Feed
              </div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Order #</th><th>Outlet</th><th>Amount</th><th>Status</th><th>Rider Assign</th></tr></thead>
                  <tbody>
                    <tr><td>ORD-00001</td><td>Main Branch</td><td>$45.00</td><td><span className="badge badge-active">PREPARING</span></td><td><button className="btn-sm btn-green">Assign Rider</button></td></tr>
                    <tr><td colSpan="5" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Listening for incoming orders...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* CREATE TENANT MODAL */}
      {showModal === 'tenant' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create New Tenant</div>
            <form onSubmit={createTenant} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label>Business Name</label><input name="name" className="form-input" required /></div>
              <div className="form-group"><label>Subdomain</label><input name="subdomain" className="form-input" placeholder="mycompany" required /></div>
              <div className="form-group"><label>Plan</label>
                <select name="plan" className="form-input"><option value="BASIC">Basic</option><option value="PRO">Pro</option><option value="ENTERPRISE">Enterprise</option></select>
              </div>
              <button type="submit" className="login-btn">Create Tenant</button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showModal === 'user' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add New User</div>
            <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label>Full Name</label><input name="name" className="form-input" required /></div>
              <div className="form-group"><label>Email</label><input name="email" type="email" className="form-input" required /></div>
              <div className="form-group"><label>Password</label><input name="password" type="password" className="form-input" minLength={6} required /></div>
              <div className="form-group"><label>Role</label>
                <select name="role" className="form-input">
                  <option value="TENANT_ADMIN">Tenant Admin</option><option value="MANAGER">Manager</option><option value="CASHIER">Cashier</option>
                  <option value="WAITER">Waiter</option><option value="KITCHEN">Kitchen</option><option value="VENDOR">Vendor</option><option value="RIDER">Rider</option>
                </select>
              </div>
              <button type="submit" className="login-btn">Create User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const savedUser = localStorage.getItem('erp_user');
    if (token && savedUser) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser(JSON.parse(savedUser));
          setAuthed(true);
        }
      } catch { /* expired token */ }
    }
  }, []);

  if (!authed) {
    return <LoginScreen onLogin={(data) => { setUser(data.user); setAuthed(true); }} />;
  }

  return <Dashboard user={user} onLogout={() => { setAuthed(false); setUser(null); }} />;
}
