import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Store, Bike, FileText, CreditCard, Megaphone, Settings, Building, UserPlus, ChefHat, Printer, Bell, LogOut, Search, Moon, Sun, Globe, TrendingUp, DollarSign, Eye, Clock, MapPin, CheckCircle, XCircle, AlertTriangle, BarChart3, PieChart, Activity, Layers, Tag, Gift, Image, BookOpen, Key, UserCog, Calendar, Wallet, ArrowUpRight, ArrowDownRight, MoreVertical, Filter, Download, RefreshCw, X, Plus, Minus, Edit, Trash2, Check, Star, Phone, MessageCircle, Shield, HelpCircle, Truck, Receipt, Hash, Percent, UploadCloud } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('erp_token')}` });

// ═══════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    
    // UI DEMO BYPASS: Grant instant access to the UI and Dashboard
    setTimeout(() => {
      const mockUser = { id: 'admin_123', name: 'Master Admin', role: 'SUPER_ADMIN', email: email };
      localStorage.setItem('erp_token', 'mock_token_12345');
      localStorage.setItem('erp_user', JSON.stringify(mockUser));
      onLogin({ user: mockUser });
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-brand-icon">⚡</div>
          <h1>Admin Panel</h1>
          <p>Multi-Vendor Marketplace Management</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input className="form-input" type="email" placeholder="admin@platform.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Password</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div className="login-footer">Powered by <a href="#">Foodyman Platform</a></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// NAV CONFIG
// ═══════════════════════════════════════
const NAV = [
  { section: 'Main' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: 'Live' },
  { id: 'pos_orders', label: 'POS Orders', icon: Receipt },
  { section: 'Catalog' },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Layers },
  { section: 'People' },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'vendors', label: 'Vendors', icon: Store },
  { id: 'riders', label: 'Riders', icon: Bike },
  { id: 'customers', label: 'Customers', icon: UserCog },
  { section: 'Operations' },
  { id: 'outlets', label: 'Outlets & Tables', icon: MapPin },
  { id: 'kds', label: 'Kitchen (KDS)', icon: ChefHat },
  { id: 'delivery', label: 'Delivery Zones', icon: Truck },
  { section: 'Finance' },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'finance', label: 'Payments & Payouts', icon: CreditCard },
  { id: 'commissions', label: 'Commissions', icon: Percent },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { section: 'Marketing' },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { section: 'Content' },
  { id: 'blog', label: 'Blog / CMS', icon: BookOpen },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { section: 'System' },
  { id: 'tenants', label: 'Tenants', icon: Building },
  { id: 'leads', label: 'Leads', icon: UserPlus },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'translations', label: 'Translations', icon: Globe },
  { id: 'api_keys', label: 'API Keys', icon: Key },
  { id: 'printers', label: 'Printers', icon: Printer },
];

// ═══════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════
function DashboardPage({ stats, tenants, orders }) {
  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.03)' } }, x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { display: false } } } };
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{ label: 'Revenue', data: [18e3, 24e3, 32e3, 28e3, 45e3, 52e3, 48e3, 61e3, 55e3, 72e3, 68e3, stats.totalRevenue || 80e3], fill: true, backgroundColor: 'rgba(99,102,241,0.08)', borderColor: '#6366f1', borderWidth: 2, pointBackgroundColor: '#6366f1', pointRadius: 3, tension: 0.4 }]
  };
  const orderData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Dine-in', data: [45, 62, 38, 71, 55, 92, 87], backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 },
      { label: 'Delivery', data: [32, 45, 28, 53, 41, 68, 63], backgroundColor: 'rgba(34,211,238,0.7)', borderRadius: 6 },
      { label: 'Takeaway', data: [18, 24, 15, 30, 22, 35, 28], backgroundColor: 'rgba(167,139,250,0.7)', borderRadius: 6 }
    ]
  };
  const pieData = {
    labels: ['Cash', 'Card', 'Online', 'Wallet'],
    datasets: [{ data: [35, 30, 25, 10], backgroundColor: ['#6366f1', '#22d3ee', '#34d399', '#fb923c'], borderWidth: 0 }]
  };

  const recentOrders = orders.slice(0, 8);
  const activities = [
    { text: 'New vendor registration request from <strong>Pizza Palace</strong>', time: '2 min ago', color: 'blue' },
    { text: 'Order #ORD-4521 marked as <strong>Delivered</strong>', time: '5 min ago', color: 'green' },
    { text: 'Low stock alert: <strong>Chicken Breast</strong> (5 units)', time: '12 min ago', color: 'orange' },
    { text: 'Rider <strong>Ahmed K.</strong> went offline', time: '18 min ago', color: 'red' },
    { text: 'Daily closing report generated for <strong>Main Branch</strong>', time: '1 hour ago', color: 'purple' },
  ];

  return (
    <div className="fade-in">
      <div className="stat-grid">
        <div className="stat-card purple"><div className="stat-card-header"><div className="stat-icon purple"><DollarSign size={22} /></div><span className="stat-trend up">↑ 12.5%</span></div><div className="stat-value">${(stats.totalRevenue || 0).toLocaleString()}</div><div className="stat-label">Total Revenue</div></div>
        <div className="stat-card cyan"><div className="stat-card-header"><div className="stat-icon cyan"><ShoppingCart size={22} /></div><span className="stat-trend up">↑ 8.3%</span></div><div className="stat-value">{stats.totalOrders || 0}</div><div className="stat-label">Total Orders</div></div>
        <div className="stat-card green"><div className="stat-card-header"><div className="stat-icon green"><Users size={22} /></div><span className="stat-trend up">↑ 3.2%</span></div><div className="stat-value">{stats.totalUsers || 0}</div><div className="stat-label">Active Users</div></div>
        <div className="stat-card orange"><div className="stat-card-header"><div className="stat-icon orange"><Building size={22} /></div><span className="stat-trend up">↑ 2</span></div><div className="stat-value">{stats.totalTenants || 0}</div><div className="stat-label">Active Tenants</div></div>
      </div>

      <div className="grid-2 mb-24">
        <div className="glass-card"><div className="card-header"><div className="card-title"><TrendingUp size={18} /> Revenue Overview</div><div className="tabs"><button className="tab active">Yearly</button><button className="tab">Monthly</button></div></div><div className="chart-container"><Line data={revenueData} options={chartOpts} /></div></div>
        <div className="glass-card"><div className="card-header"><div className="card-title"><BarChart3 size={18} /> Orders by Type</div></div><div className="chart-container"><Bar data={orderData} options={{ ...chartOpts, scales: { ...chartOpts.scales, x: { ...chartOpts.scales.x, stacked: true } }, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12, padding: 16, font: { size: 11 } } } } }} /></div></div>
      </div>

      <div className="grid-2 mb-24">
        <div className="glass-card">
          <div className="card-header"><div className="card-title"><ShoppingCart size={18} /> Recent Orders</div><button className="btn btn-sm btn-outline">View All</button></div>
          <table><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Type</th></tr></thead><tbody>
            {recentOrders.length > 0 ? recentOrders.map(o => (
              <tr key={o.id}><td style={{ fontWeight: 600 }}>#{o.orderNumber || o.id.slice(-6)}</td><td>{o.user?.name || 'Walk-in'}</td><td style={{ fontWeight: 600 }}>${o.totalAmount?.toFixed(2)}</td>
                <td><span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : o.status === 'CANCELLED' ? 'badge-danger' : o.status === 'PREPARING' ? 'badge-warning' : 'badge-info'}`}><span className={`badge-dot ${o.status === 'DELIVERED' ? 'green' : o.status === 'CANCELLED' ? 'red' : 'blue'}`}></span>{o.status}</span></td>
                <td><span className="badge badge-default">{o.type}</span></td></tr>
            )) : <tr><td colSpan="5" className="table-empty">No orders yet. They'll appear here in real-time.</td></tr>}
          </tbody></table>
        </div>
        <div className="flex flex-col gap-24">
          <div className="glass-card"><div className="card-header"><div className="card-title"><PieChart size={18} /> Payment Methods</div></div><div style={{ height: 200, display: 'flex', justifyContent: 'center' }}><Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, boxWidth: 12, font: { size: 11 } } } } }} /></div></div>
          <div className="glass-card"><div className="card-header"><div className="card-title"><Activity size={18} /> Live Activity</div><span className="live-dot"></span></div>
            <div className="activity-list">{activities.map((a, i) => (<div key={i} className="activity-item"><div className={`activity-dot ${a.color}`}></div><div className="activity-info"><div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }}></div><div className="activity-time">{a.time}</div></div></div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ORDERS PAGE
// ═══════════════════════════════════════
function OrdersPage({ orders, onRefresh }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const filtered = orders.filter(o => {
    if (filter !== 'ALL' && o.status !== filter) return false;
    if (search && !JSON.stringify(o).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const counts = { ALL: orders.length, PENDING: orders.filter(o => o.status === 'PENDING').length, PREPARING: orders.filter(o => o.status === 'PREPARING').length, READY: orders.filter(o => o.status === 'READY').length, DELIVERED: orders.filter(o => o.status === 'DELIVERED').length, CANCELLED: orders.filter(o => o.status === 'CANCELLED').length };

  const updateStatus = async (id, status) => {
    try { await fetch(`${API}/api/pos/orders/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }); onRefresh(); } catch { }
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><ShoppingCart size={22} /> Order Management & Invoices</div>
        <div className="flex gap-8">
          <button className="btn btn-sm btn-outline" onClick={onRefresh}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-sm" style={{background: '#10b981', color: 'white', border: 'none'}} onClick={() => alert('Generating Excel Report...')}><FileText size={14} /> Export to Excel</button>
          <button className="btn btn-sm" style={{background: '#ef4444', color: 'white', border: 'none'}} onClick={() => window.print()}><Download size={14} /> PDF Invoice</button>
          <button className="btn btn-sm" style={{background: '#1f2937', color: 'white', border: 'none'}} onClick={() => alert('Sending to Thermal Printer...')}><Printer size={14} /> Thermal Print</button>
        </div>
      </div>
      <div className="filter-bar">
        <input className="filter-input" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        {Object.keys(counts).map(s => <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s} ({counts[s]})</button>)}
      </div>
      <div className="table-wrapper"><table><thead><tr><th>Order #</th><th>Customer</th><th>Type</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>
        {filtered.length > 0 ? filtered.map(o => (
          <tr key={o.id}><td style={{ fontWeight: 600 }}>#{o.orderNumber || o.id.slice(-6)}</td><td>{o.user?.name || 'Walk-in'}</td><td><span className="badge badge-default">{o.type}</span></td><td>{o.items?.length || 0}</td><td style={{ fontWeight: 700 }}>${o.totalAmount?.toFixed(2)}</td><td>{o.payments?.[0]?.method || 'CASH'}</td>
            <td><span className={`badge ${o.status === 'DELIVERED' ? 'badge-success' : o.status === 'CANCELLED' ? 'badge-danger' : o.status === 'PREPARING' ? 'badge-warning' : 'badge-info'}`}>{o.status}</span></td>
            <td className="text-muted text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
            <td><div className="flex gap-4">
              {o.status === 'PENDING' && <button className="btn-icon" title="Accept" onClick={() => updateStatus(o.id, 'PREPARING')}><Check size={14} /></button>}
              {o.status === 'PREPARING' && <button className="btn-icon" title="Ready" onClick={() => updateStatus(o.id, 'READY')}><CheckCircle size={14} /></button>}
              {o.status === 'READY' && <button className="btn-icon" title="Deliver" onClick={() => updateStatus(o.id, 'DELIVERED')}><Truck size={14} /></button>}
              <button className="btn-icon" title="View"><Eye size={14} /></button>
            </div></td></tr>
        )) : <tr><td colSpan="9" className="table-empty">No orders found</td></tr>}
      </tbody></table></div>
    </div>
  );
}

// ═══════════════════════════════════════
// PRODUCTS PAGE
// ═══════════════════════════════════════
function ProductsPage({ products, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const createProduct = async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    try { await fetch(`${API}/api/products`, { method: 'POST', headers: headers(), body: JSON.stringify({ name: f.get('name'), sku: f.get('sku'), category: f.get('category'), price: +f.get('price'), cost: +f.get('cost'), description: f.get('description') }) }); setShowModal(false); onRefresh(); } catch { }
  };
  return (
    <div className="fade-in">
      <div className="section-header"><div className="section-title"><Package size={22} /> Products</div><button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add Product</button></div>
      <div className="table-wrapper"><table><thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Cost</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {products.length > 0 ? products.map(p => (
          <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.name}</td><td className="text-muted">{p.sku}</td><td><span className="badge badge-purple">{p.category}</span></td><td style={{ fontWeight: 600 }}>${p.price?.toFixed(2)}</td><td className="text-muted">${p.cost?.toFixed(2)}</td><td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
            <td><div className="flex gap-4"><button className="btn-icon"><Edit size={14} /></button><button className="btn-icon"><Trash2 size={14} /></button></div></td></tr>
        )) : <tr><td colSpan="7" className="table-empty">No products yet</td></tr>}
      </tbody></table></div>
      {showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div className="modal-title">Add New Product</div><button className="btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button></div>
        <form onSubmit={createProduct} className="modal-body">
          <div className="form-group"><label>Product Name</label><input name="name" className="form-input" required /></div>
          <div className="grid-2"><div className="form-group"><label>SKU</label><input name="sku" className="form-input" required /></div><div className="form-group"><label>Category</label><input name="category" className="form-input" required /></div></div>
          <div className="grid-2"><div className="form-group"><label>Price</label><input name="price" type="number" step="0.01" className="form-input" required /></div><div className="form-group"><label>Cost</label><input name="cost" type="number" step="0.01" className="form-input" /></div></div>
          <div className="form-group"><label>Description</label><textarea name="description" className="form-input" rows="3"></textarea></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Product</button></div>
        </form></div></div>}
    </div>
  );
}

// ═══════════════════════════════════════
// USERS, TENANTS, VENDORS, RIDERS, REPORTS, SETTINGS PAGES
// ═══════════════════════════════════════
function UsersPage({ users, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const createUser = async (e) => { e.preventDefault(); const f = new FormData(e.target); try { await fetch(`${API}/api/users`, { method: 'POST', headers: headers(), body: JSON.stringify({ name: f.get('name'), email: f.get('email'), password: f.get('password'), role: f.get('role') }) }); setShowModal(false); onRefresh(); } catch { } };
  return (
    <div className="fade-in">
      <div className="section-header"><div className="section-title"><Users size={22} /> Users & Roles</div><button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add User</button></div>
      <div className="table-wrapper"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
        {users.map(u => (<tr key={u.id}><td style={{ fontWeight: 600 }}>{u.name}</td><td className="text-muted">{u.email}</td><td><span className="badge badge-purple">{u.role}</span></td><td><span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-danger'}`}>{u.isActive !== false ? 'Active' : 'Inactive'}</span></td><td className="text-muted text-sm">{new Date(u.createdAt).toLocaleDateString()}</td><td><div className="flex gap-4"><button className="btn-icon"><Edit size={14} /></button><button className="btn-icon"><Trash2 size={14} /></button></div></td></tr>))}
        {users.length === 0 && <tr><td colSpan="6" className="table-empty">No users found</td></tr>}
      </tbody></table></div>
      {showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal-card" onClick={e => e.stopPropagation()}><div className="modal-header"><div className="modal-title">Add User</div><button className="btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button></div>
        <form onSubmit={createUser} className="modal-body"><div className="form-group"><label>Name</label><input name="name" className="form-input" required /></div><div className="form-group"><label>Email</label><input name="email" type="email" className="form-input" required /></div><div className="form-group"><label>Password</label><input name="password" type="password" className="form-input" minLength={6} required /></div>
          <div className="form-group"><label>Role</label><select name="role" className="form-input"><option value="TENANT_ADMIN">Tenant Admin</option><option value="MANAGER">Manager</option><option value="CASHIER">Cashier</option><option value="WAITER">Waiter</option><option value="KITCHEN">Kitchen</option><option value="VENDOR">Vendor</option><option value="RIDER">Rider</option><option value="CUSTOMER">Customer</option></select></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create User</button></div></form></div></div>}
    </div>
  );
}

function TenantsPage({ tenants, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const createTenant = async (e) => { e.preventDefault(); const f = new FormData(e.target); try { await fetch(`${API}/api/tenant`, { method: 'POST', headers: headers(), body: JSON.stringify({ name: f.get('name'), subdomain: f.get('subdomain'), plan: f.get('plan') }) }); setShowModal(false); onRefresh(); } catch { } };
  const suspend = async (id) => { try { await fetch(`${API}/api/tenant/${id}`, { method: 'DELETE', headers: headers() }); onRefresh(); } catch { } };
  return (<div className="fade-in"><div className="section-header"><div className="section-title"><Building size={22} /> Tenant Management</div><button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Tenant</button></div>
    <div className="table-wrapper"><table><thead><tr><th>Name</th><th>Subdomain</th><th>Plan</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
      {tenants.map(t => (<tr key={t.id}><td style={{ fontWeight: 600 }}>{t.name}</td><td className="text-muted">{t.subdomain}</td><td><span className="badge badge-cyan">{t.plan}</span></td><td><span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`}>{t.isActive ? 'Active' : 'Suspended'}</span></td><td className="text-muted text-sm">{new Date(t.createdAt).toLocaleDateString()}</td><td><div className="flex gap-4"><button className="btn-icon"><Edit size={14} /></button><button className="btn-icon" onClick={() => suspend(t.id)}><XCircle size={14} /></button></div></td></tr>))}
      {tenants.length === 0 && <tr><td colSpan="6" className="table-empty">No tenants</td></tr>}
    </tbody></table></div>
    {showModal && <div className="modal-overlay" onClick={() => setShowModal(false)}><div className="modal-card" onClick={e => e.stopPropagation()}><div className="modal-header"><div className="modal-title">Create Tenant</div><button className="btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button></div>
      <form onSubmit={createTenant} className="modal-body"><div className="form-group"><label>Business Name</label><input name="name" className="form-input" required /></div><div className="form-group"><label>Subdomain</label><input name="subdomain" className="form-input" required /></div><div className="form-group"><label>Plan</label><select name="plan" className="form-input"><option value="BASIC">Basic</option><option value="PRO">Pro</option><option value="ENTERPRISE">Enterprise</option></select></div>
        <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div></form></div></div>}
  </div>);
}

function VendorsPage() { return <div className="fade-in"><div className="section-header"><div className="section-title"><Store size={22} /> Vendor Management</div><button className="btn btn-sm btn-primary"><Plus size={14} /> Add Vendor</button></div><div className="stat-grid"><div className="stat-card green"><div className="stat-value">12</div><div className="stat-label">Active Vendors</div></div><div className="stat-card orange"><div className="stat-value">3</div><div className="stat-label">Pending Verification</div></div><div className="stat-card purple"><div className="stat-value">$48,500</div><div className="stat-label">Total Commission</div></div><div className="stat-card cyan"><div className="stat-value">$12,200</div><div className="stat-label">Pending Payouts</div></div></div><div className="table-wrapper"><table><thead><tr><th>Business</th><th>Owner</th><th>Products</th><th>Orders</th><th>Commission</th><th>Verification</th><th>Actions</th></tr></thead><tbody><tr><td style={{ fontWeight: 600 }}>Pizza Palace</td><td>Ali Khan</td><td>24</td><td>156</td><td>10%</td><td><span className="badge badge-success">Verified</span></td><td><div className="flex gap-4"><button className="btn-icon"><Eye size={14} /></button><button className="btn-icon"><Edit size={14} /></button></div></td></tr><tr><td style={{ fontWeight: 600 }}>Burger Galaxy</td><td>Sara Ahmed</td><td>18</td><td>89</td><td>12%</td><td><span className="badge badge-warning">Pending</span></td><td><div className="flex gap-4"><button className="btn-icon"><Eye size={14} /></button><button className="btn-icon"><Check size={14} /></button></div></td></tr></tbody></table></div></div>; }

function RidersPage() { return <div className="fade-in"><div className="section-header"><div className="section-title"><Bike size={22} /> Rider Management</div><button className="btn btn-sm btn-primary"><Plus size={14} /> Add Rider</button></div><div className="stat-grid"><div className="stat-card green"><div className="stat-value">8</div><div className="stat-label">Online Riders</div></div><div className="stat-card orange"><div className="stat-value">5</div><div className="stat-label">On Delivery</div></div><div className="stat-card purple"><div className="stat-value">142</div><div className="stat-label">Today's Deliveries</div></div><div className="stat-card cyan"><div className="stat-value">$2,450</div><div className="stat-label">Today's Earnings</div></div></div><div className="table-wrapper"><table><thead><tr><th>Rider</th><th>Vehicle</th><th>Status</th><th>Today Deliveries</th><th>Earnings</th><th>Rating</th><th>Actions</th></tr></thead><tbody><tr><td style={{ fontWeight: 600 }}>Ahmed Khan</td><td>Motorcycle</td><td><span className="badge badge-success"><span className="badge-dot green"></span>Online</span></td><td>12</td><td>$145</td><td><span className="flex items-center gap-4"><Star size={14} color="#fbbf24" fill="#fbbf24" />4.8</span></td><td><button className="btn-icon"><Eye size={14} /></button></td></tr><tr><td style={{ fontWeight: 600 }}>Hassan Ali</td><td>Bicycle</td><td><span className="badge badge-warning"><span className="badge-dot orange"></span>On Delivery</span></td><td>8</td><td>$92</td><td><span className="flex items-center gap-4"><Star size={14} color="#fbbf24" fill="#fbbf24" />4.5</span></td><td><button className="btn-icon"><Eye size={14} /></button></td></tr></tbody></table></div></div>; }

function ReportsPage({ stats, orders }) {
  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }, scales: { y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.03)' } }, x: { ticks: { color: '#64748b' }, grid: { display: false } } } };
  const revData = { labels: ['Jan','Feb','Mar','Apr','May','Jun'], datasets: [{ label: 'Gross Sales ($)', data: [12000, 19000, 15000, 22000, 28000, 34000], borderColor: '#8de02c', backgroundColor: 'rgba(141, 224, 44, 0.2)', fill: true, tension: 0.4 }] };
  const appsData = { labels: ['Admin/Web', 'POS App', 'Rider App', 'Vendor App'], datasets: [{ data: [15, 45, 25, 15], backgroundColor: ['#3b82f6', '#8de02c', '#f59e0b', '#8b5cf6'], borderWidth: 0 }] };
  const orderData = { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets: [{ label: 'POS', data: [45, 52, 38, 60, 85, 110, 95], backgroundColor: '#8de02c' }, { label: 'Online Delivery', data: [20, 25, 22, 35, 55, 80, 70], backgroundColor: '#06b6d4' }] };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><BarChart3 size={22} /> Central Reporting Hub</div>
        <div className="flex gap-12">
          <select className="form-input" style={{width: 150}}><option>Last 7 Days</option><option>This Month</option><option>This Year</option></select>
          <button className="btn btn-sm btn-primary"><Download size={14} /> Export CSV</button>
        </div>
      </div>
      
      <div className="stat-grid">
        <div className="stat-card green"><div className="stat-card-header"><div className="stat-icon green"><DollarSign size={22} /></div><span className="stat-trend up">↑ 24%</span></div><div className="stat-value">${(stats?.totalRevenue || 130000).toLocaleString()}</div><div className="stat-label">Total GTV (All Apps)</div></div>
        <div className="stat-card cyan"><div className="stat-card-header"><div className="stat-icon cyan"><ShoppingCart size={22} /></div><span className="stat-trend up">↑ 12%</span></div><div className="stat-value">{stats?.totalOrders || 4521}</div><div className="stat-label">Total Orders</div></div>
        <div className="stat-card orange"><div className="stat-card-header"><div className="stat-icon orange"><Bike size={22} /></div></div><div className="stat-value">98.2%</div><div className="stat-label">Rider Success Rate</div></div>
        <div className="stat-card purple"><div className="stat-card-header"><div className="stat-icon purple"><Store size={22} /></div></div><div className="stat-value">{stats?.totalTenants || 84}</div><div className="stat-label">Active Vendors</div></div>
      </div>

      <div className="grid-2 mb-24">
        <div className="glass-card"><div className="card-title mb-16"><TrendingUp size={18}/> Platform Revenue</div><div style={{height: 250}}><Line data={revData} options={chartOpts} /></div></div>
        <div className="glass-card"><div className="card-title mb-16"><Activity size={18}/> Orders: POS vs Delivery</div><div style={{height: 250}}><Bar data={orderData} options={chartOpts} /></div></div>
      </div>

      <div className="grid-3 mb-24">
        <div className="glass-card"><div className="card-title mb-16"><PieChart size={18}/> App Usage</div><div style={{height: 200, display: 'flex', justifyContent: 'center'}}><Doughnut data={appsData} options={{cutout: '70%', plugins: {legend: {position: 'right', labels: {color: '#94a3b8'}}}}} /></div></div>
        <div className="glass-card" style={{gridColumn: 'span 2'}}><div className="card-title mb-16"><Users size={18}/> Cross-App Diagnostics</div>
          <table className="mt-12" style={{width: '100%'}}>
            <thead><tr><th>App Module</th><th>Active Users</th><th>CPU / Ping</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td><strong>Admin Dashboard</strong></td><td>14 online</td><td>24ms</td><td><span className="badge badge-success">Healthy</span></td></tr>
              <tr><td><strong>POS System</strong></td><td>82 terminals</td><td>18ms</td><td><span className="badge badge-success">Healthy</span></td></tr>
              <tr><td><strong>Rider App</strong></td><td>145 riders</td><td>45ms</td><td><span className="badge badge-success">Healthy</span></td></tr>
              <tr><td><strong>Vendor App</strong></td><td>89 vendors</td><td>32ms</td><td><span className="badge badge-warning">High Load</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinancePage() { return <div className="fade-in"><div className="section-header"><div className="section-title"><CreditCard size={22} /> Payments & Payouts</div></div><div className="stat-grid"><div className="stat-card green"><div className="stat-value">$125,400</div><div className="stat-label">Total Collected</div></div><div className="stat-card orange"><div className="stat-value">$18,320</div><div className="stat-label">Pending Payouts</div></div><div className="stat-card purple"><div className="stat-value">$8,540</div><div className="stat-label">Commission Earned</div></div><div className="stat-card red"><div className="stat-value">$2,100</div><div className="stat-label">Refunded</div></div></div><div className="table-wrapper"><table><thead><tr><th>Transaction</th><th>Type</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead><tbody><tr><td>#TXN-001</td><td><span className="badge badge-success">Payment</span></td><td style={{ fontWeight: 600 }}>$245.00</td><td>Card</td><td><span className="badge badge-success">Completed</span></td><td className="text-muted">Today</td></tr><tr><td>#TXN-002</td><td><span className="badge badge-orange">Payout</span></td><td style={{ fontWeight: 600 }}>$1,200.00</td><td>Bank Transfer</td><td><span className="badge badge-warning">Processing</span></td><td className="text-muted">Today</td></tr></tbody></table></div></div>; }

function LeadsPage({ leads, onRefresh }) {
  const convertLead = async (id) => { try { await fetch(`${API}/api/leads/${id}/convert`, { method: 'PUT', headers: headers() }); onRefresh(); } catch { } };
  return <div className="fade-in"><div className="section-header"><div className="section-title"><UserPlus size={22} /> Lead Management</div></div><div className="table-wrapper"><table><thead><tr><th>Name</th><th>Business</th><th>Type</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{leads.map(l => (<tr key={l.id}><td style={{ fontWeight: 600 }}>{l.name}</td><td>{l.businessName}</td><td><span className="badge badge-purple">{l.businessType}</span></td><td><span className="badge badge-info">{l.status}</span></td><td className="text-muted text-sm">{new Date(l.createdAt).toLocaleDateString()}</td><td>{l.status !== 'CONVERTED' && <button className="btn btn-sm btn-green" onClick={() => convertLead(l.id)}>Convert</button>}</td></tr>))}{leads.length === 0 && <tr><td colSpan="6" className="table-empty">No leads yet</td></tr>}</tbody></table></div></div>;
}

function SettingsPage() { return <div className="fade-in"><div className="section-header"><div className="section-title"><Settings size={22} /> Global Settings</div></div><div className="grid-2"><div className="glass-card"><div className="card-title"><Globe size={18} />Platform Branding</div><form className="modal-body" style={{ marginTop: 16 }}><div className="form-group"><label>Platform Name</label><input className="form-input" defaultValue="Galaxy Express" /></div><div className="form-group"><label>Logo URL</label><input className="form-input" placeholder="https://..." /></div><div className="form-group"><label>Invoice Logo URL</label><input className="form-input" placeholder="https://..." /></div><button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 8 }}>Save Branding</button></form></div><div className="glass-card"><div className="card-title"><Shield size={18} />Payment Gateways</div><div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}><div className="flex justify-between items-center"><span>Stripe</span><span className="badge badge-success">Enabled</span></div><div className="flex justify-between items-center"><span>GoPayFast</span><span className="badge badge-success">Enabled</span></div><div className="flex justify-between items-center"><span>Cash on Delivery</span><span className="badge badge-success">Enabled</span></div><div className="flex justify-between items-center"><span>UPI</span><span className="badge badge-default">Disabled</span></div></div></div></div><div className="grid-2 mt-24"><div className="glass-card"><div className="card-title"><Globe size={18} />Translations (EN / UR)</div><table style={{ marginTop: 16 }}><thead><tr><th>Key</th><th>English</th><th>Urdu</th><th>Edit</th></tr></thead><tbody><tr><td>ui.checkout</td><td>Checkout</td><td>Checkout Karein</td><td><button className="btn-icon"><Edit size={14} /></button></td></tr><tr><td>ui.total</td><td>Total</td><td>Kul Raqam</td><td><button className="btn-icon"><Edit size={14} /></button></td></tr></tbody></table></div><div className="glass-card"><div className="card-title"><HelpCircle size={18} />FAQ Management</div><table style={{ marginTop: 16 }}><thead><tr><th>Target</th><th>Question</th><th>Edit</th></tr></thead><tbody><tr><td><span className="badge badge-orange">Vendor</span></td><td>How do payouts work?</td><td><button className="btn-icon"><Edit size={14} /></button></td></tr><tr><td><span className="badge badge-cyan">Rider</span></td><td>How to mark delivered?</td><td><button className="btn-icon"><Edit size={14} /></button></td></tr></tbody></table></div></div></div>; }

function GenericPage({ icon: Icon, title, subtitle }) { return <div className="fade-in"><div className="section-header"><div className="section-title"><Icon size={22} /> {title}</div><button className="btn btn-sm btn-primary"><Plus size={14} /> Add New</button></div><div className="glass-card" style={{ textAlign: 'center', padding: 60 }}><Icon size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} /><h3 style={{ marginBottom: 8, color: 'var(--text-light)' }}>{title}</h3><p className="text-muted">{subtitle || 'This section is connected to your API. Data will appear as it flows in.'}</p></div></div>; }

// ═══════════════════════════════════════
// KDS SCREEN (KITCHEN DISPLAY SYSTEM)
// ═══════════════════════════════════════
function KdsScreen({ orders, onRefresh }) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000); // UI update every 10s
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto advance order status simulation (user requested time-based auto update)
    if (!autoAdvance) return;
    const interval = setInterval(() => {
      orders.forEach(async (o) => {
        const elapsed = (Date.now() - new Date(o.createdAt).getTime()) / 60000;
        let newStatus = null;
        if (o.status === 'PENDING' && elapsed > 2) newStatus = 'PREPARING';
        else if (o.status === 'PREPARING' && elapsed > 8) newStatus = 'READY';
        else if (o.status === 'READY' && elapsed > 15) newStatus = 'DELIVERED';
        
        if (newStatus) {
          try {
            await fetch(`${API}/api/pos/orders/${o.id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status: newStatus }) });
            onRefresh();
          } catch {}
        }
      });
    }, 15000); // Check for auto-advancement every 15s
    return () => clearInterval(interval);
  }, [orders, autoAdvance, onRefresh]);

  const updateStatus = async (id, status) => {
    try { await fetch(`${API}/api/pos/orders/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }); onRefresh(); } catch { }
  };

  const getCol = (status) => orders.filter(o => o.status === status).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  const cols = [
    { title: 'New Orders (Pending)', status: 'PENDING', data: getCol('PENDING'), color: 'info' },
    { title: 'In Kitchen (Preparing)', status: 'PREPARING', data: getCol('PREPARING'), color: 'warning' },
    { title: 'Ready to Serve', status: 'READY', data: getCol('READY'), color: 'success' }
  ];

  const getTimeElapsed = (createdAt) => {
    const min = Math.floor((currentTime - new Date(createdAt).getTime()) / 60000);
    if (min < 0) return 'Just now';
    return `${min} min ago`;
  };

  return (
    <div className="fade-in kds-wrapper">
      <div className="section-header">
        <div className="section-title"><ChefHat size={22} /> Kitchen Display Board</div>
        <div className="flex gap-8 items-center">
          <label className="flex items-center gap-4 text-sm"><input type="checkbox" checked={autoAdvance} onChange={e => setAutoAdvance(e.target.checked)} /> Auto-Advance (Time Based)</label>
          <button className="btn btn-sm btn-outline" onClick={onRefresh}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>
      <div className="kds-board">
        {cols.map(c => (
          <div key={c.status} className={`kds-col kds-col-${c.color}`}>
            <div className="kds-col-header">
              <h3>{c.title} <span className={`badge badge-${c.color}`}>{c.data.length}</span></h3>
            </div>
            <div className="kds-col-body">
              {c.data.map(o => (
                <div key={o.id} className="kds-card glass-card">
                  <div className="kds-card-top">
                    <span className="order-no">#{o.orderNumber || o.id.slice(-6)}</span>
                    <span className={`time-elapsed ${Math.floor((currentTime - new Date(o.createdAt).getTime()) / 60000) > 10 ? 'text-danger' : ''}`}>
                      <Clock size={12} style={{marginRight: 4}} />
                      {getTimeElapsed(o.createdAt)}
                    </span>
                  </div>
                  <div className="kds-card-type"><span className="badge badge-default">{o.type}</span> {o.type === 'DELIVERY' ? <Truck size={12}/> : <MapPin size={12}/>}</div>
                  <div className="kds-items">
                    {o.items?.map((it, idx) => (
                      <div key={idx} className="kds-item">
                        <span className="qty">{it.quantity}x</span>
                        <span className="name">{it.product?.name || 'Unknown Item'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="kds-actions">
                    {c.status === 'PENDING' && <button className="btn btn-sm btn-primary w-full justify-center" onClick={() => updateStatus(o.id, 'PREPARING')}>Start Preparing</button>}
                    {c.status === 'PREPARING' && <button className="btn btn-sm btn-green w-full justify-center" onClick={() => updateStatus(o.id, 'READY')}>Mark Ready</button>}
                    {c.status === 'READY' && <button className="btn btn-sm btn-outline w-full justify-center" onClick={() => updateStatus(o.id, 'DELIVERED')}><CheckCircle size={14}/> Complete</button>}
                  </div>
                </div>
              ))}
              {c.data.length === 0 && <div className="kds-empty">No orders</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TRANSLATIONS PAGE
// ═══════════════════════════════════════
function TranslationsPage() {
  const [lang, setLang] = useState('en');
  const translations = {
    en: { welcome: 'Welcome', orders: 'Orders', settings: 'Settings', revenue: 'Revenue', products: 'Products', dashboard: 'Dashboard' },
    ur: { welcome: 'خوش آمدید', orders: 'احکامات', settings: 'ترتیبات', revenue: 'آمدنی', products: 'مصنوعات', dashboard: 'ڈیش بورڈ' },
    ar: { welcome: 'مرحباً', orders: 'الطلبات', settings: 'الإعدادات', revenue: 'إيرادات', products: 'المنتجات', dashboard: 'لوحة القيادة' },
  };
  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Globe size={22} /> Translations Management</div>
        <select className="form-input" value={lang} onChange={e=>setLang(e.target.value)} style={{width: 150}}>
          <option value="en">English (US)</option>
          <option value="ur">Urdu (اردو)</option>
          <option value="ar">Arabic (العربية)</option>
        </select>
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Translation Key</th><th>English Value</th><th>{lang.toUpperCase()} Value</th><th>Action</th></tr></thead>
          <tbody>
            {Object.keys(translations.en).map(k => (
              <tr key={k}>
                <td style={{fontWeight:600}}>{k}</td>
                <td className="text-muted">{translations.en[k]}</td>
                <td><input type="text" className="form-input" defaultValue={translations[lang][k]} style={{minWidth: 200}}/></td>
                <td><button className="btn btn-sm btn-outline"><Check size={14}/> Save</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════
function SettingsPage() {
  const [tab, setTab] = useState('branding');
  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Settings size={22} /> Platform Settings</div>
      </div>
      
      <div className="grid-3 mb-24" style={{gridTemplateColumns: '250px 1fr'}}>
         <div className="glass-card p-0" style={{padding:0}}>
           <div style={{padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600}}>Settings Navigation</div>
           <div className="nav-item" onClick={()=>setTab('branding')} style={{background: tab==='branding'?'var(--accent-bg)':'', padding:'12px 16px', cursor:'pointer'}}><Image size={18}/> Master Gallery & Logo</div>
           <div className="nav-item" onClick={()=>setTab('colors')} style={{background: tab==='colors'?'var(--accent-bg)':'', padding:'12px 16px', cursor:'pointer'}}><Moon size={18}/> Theme & Colors</div>
           <div className="nav-item" onClick={()=>setTab('general')} style={{background: tab==='general'?'var(--accent-bg)':'', padding:'12px 16px', cursor:'pointer'}}><Store size={18}/> General Info</div>
         </div>
         
         <div className="glass-card">
           {tab === 'branding' && (
             <div className="fade-in">
               <h3 className="mb-16">Brand Identity & Logo</h3>
               <div className="grid-2 gap-16 mb-24">
                 <div>
                   <label className="text-sm font-600 block mb-8">Platform Logo (Light Mode)</label>
                   <div style={{border:'2px dashed var(--border-color)', borderRadius: 12, padding: 30, textAlign:'center', cursor:'pointer'}}>
                     <UploadCloud size={32} color="var(--text-muted)" className="mb-8 mx-auto"/>
                     <div className="text-sm">Click to upload or drag logo</div>
                   </div>
                 </div>
                 <div>
                   <label className="text-sm font-600 block mb-8">Platform Logo (Dark Mode)</label>
                   <div style={{border:'2px dashed var(--border-color)', borderRadius: 12, padding: 30, textAlign:'center', cursor:'pointer'}}>
                     <UploadCloud size={32} color="var(--text-muted)" className="mb-8 mx-auto"/>
                     <div className="text-sm">Click to upload or drag logo</div>
                   </div>
                 </div>
               </div>
               
               <h3 className="mb-16 mt-32">Master Image Gallery</h3>
               <p className="text-muted text-sm mb-16">Upload master assets (banners, category icons, default products) used across POS, Waiter, Kiosk, and Delivery apps.</p>
               <div className="grid-4 gap-12">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} style={{height: 120, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
                     <Image size={24} color="var(--text-muted)" />
                     <button className="btn-icon" style={{position:'absolute', top:4, right:4, background:'red', color:'white', width:20, height:20, padding:2}}><X size={12}/></button>
                   </div>
                 ))}
                 <div style={{height: 120, border: '2px dashed var(--accent)', borderRadius: 8, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', cursor:'pointer', flexDirection:'column'}}>
                    <Plus size={20} className="mb-4"/> Add Media
                 </div>
               </div>
             </div>
           )}
           
           {tab === 'colors' && (
             <div className="fade-in">
               <h3 className="mb-16">Platform Color Scheme</h3>
               <div className="form-group mb-16"><label>Primary Accent Color</label><div className="flex gap-12 items-center"><input type="color" defaultValue="#8de02c" style={{width:50, height:50, borderRadius:8, cursor:'pointer', padding:2}}/><input type="text" className="form-input flex-1" defaultValue="#8de02c" /></div></div>
               <div className="form-group mb-16"><label>Secondary Color</label><div className="flex gap-12 items-center"><input type="color" defaultValue="#06b6d4" style={{width:50, height:50, borderRadius:8, cursor:'pointer', padding:2}}/><input type="text" className="form-input flex-1" defaultValue="#06b6d4" /></div></div>
               <button className="btn btn-primary mt-12">Apply Global Theme</button>
             </div>
           )}
           
           {tab === 'general' && (
             <div className="fade-in">
               <h3 className="mb-16">General Settings</h3>
               <div className="form-group mb-16"><label>Business Name</label><input type="text" className="form-input" defaultValue="Foodyman SaaS" /></div>
               <div className="form-group mb-16"><label>Contact Email</label><input type="email" className="form-input" defaultValue="admin@githubit.com" /></div>
               <div className="form-group mb-16"><label>Support WhatsApp</label><input type="text" className="form-input" defaultValue="+123456789" /></div>
               <button className="btn btn-primary mt-12">Save Settings</button>
             </div>
           )}
         </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN ADMIN DASHBOARD SHELL
// ═══════════════════════════════════════
function AdminDashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [tenants, setTenants] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalTenants: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 });
  const [searchGlobal, setSearchGlobal] = useState('');
  const [isDark, setIsDark] = useState(localStorage.getItem('erp_theme') === 'dark');

  useEffect(() => {
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('erp_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const loadData = async () => {
    const h = headers();
    const safe = (p) => fetch(`${API}${p}`, { headers: h }).then(r => r.json()).catch(() => []);
    const [t, l, u, s, o, p] = await Promise.all([safe('/api/tenant'), safe('/api/leads'), safe('/api/users'), safe('/api/tenant/stats'), safe('/api/pos/orders'), safe('/api/products')]);
    if (Array.isArray(t)) setTenants(t);
    if (Array.isArray(l)) setLeads(l);
    if (Array.isArray(u)) setUsers(u);
    if (s.totalTenants !== undefined) setStats(s);
    if (Array.isArray(o)) setOrders(o);
    if (Array.isArray(p)) setProducts(p);
  };

  useEffect(() => { loadData(); }, []);

  const pageTitles = { dashboard: 'Dashboard', orders: 'Order Management', pos_orders: 'POS Orders', products: 'Products', categories: 'Categories', users: 'Users & Roles', vendors: 'Vendors', riders: 'Riders', customers: 'Customers', outlets: 'Outlets & Tables', kds: 'Kitchen Display', delivery: 'Delivery Zones', reports: 'Reports & Analytics', finance: 'Payments & Payouts', commissions: 'Commissions', wallets: 'Wallets', coupons: 'Coupons', banners: 'Banners', notifications: 'Notifications', blog: 'Blog / CMS', faqs: 'FAQs', tenants: 'Tenants', leads: 'Leads', settings: 'Settings', api_keys: 'API Keys', printers: 'Printers' };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage stats={stats} tenants={tenants} orders={orders} />;
      case 'orders': case 'pos_orders': return <OrdersPage orders={orders} onRefresh={loadData} />;
      case 'products': return <ProductsPage products={products} onRefresh={loadData} />;
      case 'users': return <UsersPage users={users} onRefresh={loadData} />;
      case 'tenants': return <TenantsPage tenants={tenants} onRefresh={loadData} />;
      case 'vendors': return <VendorsPage />;
      case 'riders': return <RidersPage />;
      case 'reports': return <ReportsPage stats={stats} orders={orders} />;
      case 'finance': case 'commissions': case 'wallets': return <FinancePage />;
      case 'leads': return <LeadsPage leads={leads} onRefresh={loadData} />;
      case 'settings': return <SettingsPage />;
      case 'translations': return <TranslationsPage />;
      case 'categories': return <GenericPage icon={Layers} title="Categories" subtitle="Manage product categories & subcategories" />;
      case 'customers': return <GenericPage icon={UserCog} title="Customers" subtitle="View and manage customer accounts & loyalty points" />;
      case 'outlets': return <GenericPage icon={MapPin} title="Outlets & Tables" subtitle="Manage restaurant outlets, tables and QR codes" />;
      case 'kds': return <KdsScreen orders={orders} onRefresh={loadData} />;
      case 'delivery': return <GenericPage icon={Truck} title="Delivery Zones" subtitle="Create map-based delivery zones and pricing" />;
      case 'coupons': return <GenericPage icon={Tag} title="Coupons & Promotions" subtitle="Create discount codes and promotional offers" />;
      case 'banners': return <GenericPage icon={Image} title="Banners" subtitle="Manage marketing banners across all platforms" />;
      case 'notifications': return <GenericPage icon={Bell} title="Push Notifications" subtitle="Send targeted push notifications to users" />;
      case 'blog': return <GenericPage icon={BookOpen} title="Blog / CMS" subtitle="Manage blog posts and content pages" />;
      case 'faqs': return <GenericPage icon={HelpCircle} title="FAQs" subtitle="Manage frequently asked questions" />;
      case 'api_keys': return <GenericPage icon={Key} title="API Keys & Integrations" subtitle="Manage third-party API keys (Google Maps, Firebase, etc.)" />;
      case 'printers': return <GenericPage icon={Printer} title="Printers & Invoicing" subtitle="Configure network printers and invoice templates" />;
      default: return <DashboardPage stats={stats} tenants={tenants} orders={orders} />;
    }
  };

  const handleLogout = () => { localStorage.removeItem('erp_token'); localStorage.removeItem('erp_user'); onLogout(); };
  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand"><div className="brand-icon">⚡</div><div className="brand-text"><div className="brand-name">Foodyman</div><div className="brand-tag">Admin Panel</div></div></div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((n, i) => n.section
            ? <div key={i} className="nav-section-title">{n.section}</div>
            : <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              <n.icon size={18} /> {n.label}
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card" onClick={handleLogout}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info"><div className="user-name">{user.name}</div><div className="user-role">{user.role}</div></div>
            <LogOut size={16} color="var(--text-muted)" />
          </div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-left"><h1 className="page-title">{pageTitles[page] || 'Dashboard'}</h1></div>
        <div className="topbar-right">
          <input className="search-global" placeholder="Search anything..." value={searchGlobal} onChange={e => setSearchGlobal(e.target.value)} />
          <button className="topbar-btn" onClick={loadData} title="Refresh"><RefreshCw size={18} /></button>
          
          <select className="form-input" style={{width: 130, padding: '8px 12px', border:'none', background:'transparent', fontWeight: 600}}>
            <option>🇺🇸 EN (US)</option>
            <option>🇵🇰 UR (PK)</option>
            <option>🇸🇦 AR (SA)</option>
          </select>
          
          <button className="topbar-btn"><Bell size={18} /><span className="notif-dot"></span></button>
          <button className="topbar-btn" onClick={() => setIsDark(!isDark)} title="Toggle Theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content" key={page}>
        {renderPage()}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════
// APP ENTRY
// ═══════════════════════════════════════
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const savedUser = localStorage.getItem('erp_user');
    if (token && savedUser) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) { setUser(JSON.parse(savedUser)); setAuthed(true); }
      } catch { }
    }
  }, []);

  if (!authed) return <LoginScreen onLogin={(data) => { setUser(data.user); setAuthed(true); }} />;
  return <AdminDashboard user={user} onLogout={() => { setAuthed(false); setUser(null); }} />;
}
