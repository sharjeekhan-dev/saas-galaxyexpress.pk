import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Store, Bike, FileText, CreditCard, Megaphone, Settings, Building, UserPlus, ChefHat, Printer, Bell, LogOut, Search, Moon, Globe, TrendingUp, DollarSign, Eye, Clock, MapPin, CheckCircle, XCircle, AlertTriangle, BarChart3, PieChart, Activity, Layers, Tag, Gift, Image, BookOpen, Key, UserCog, Calendar, Wallet, ArrowUpRight, ArrowDownRight, MoreVertical, Filter, Download, RefreshCw, X, Plus, Minus, Edit, Trash2, Check, Star, Phone, MessageCircle, Shield, HelpCircle, Truck, Receipt, Hash, Percent } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      if (!['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'].includes(data.user.role)) { setError('Access denied. Admin role required.'); setLoading(false); return; }
      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      onLogin(data);
    } catch { setError('Network error. Is the API running?'); setLoading(false); }
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
        <div className="login-footer">Powered by <a href="#">Galaxy Express Platform</a></div>
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
  { id: 'api_keys', label: 'API Keys', icon: Key },
  { id: 'printers', label: 'Printers', icon: Printer },
];

// ═══════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════
function DashboardPage({ stats, tenants, orders }) {
  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.03)' } }, x: { ticks: { color: '#64748b', font: { size: 11 } }, grid: { display: false } } } };
  const revenueData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{ label: 'Revenue', data: [18e3,24e3,32e3,28e3,45e3,52e3,48e3,61e3,55e3,72e3,68e3, stats.totalRevenue||80e3], fill: true, backgroundColor: 'rgba(99,102,241,0.08)', borderColor: '#6366f1', borderWidth: 2, pointBackgroundColor: '#6366f1', pointRadius: 3, tension: 0.4 }]
  };
  const orderData = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [
      { label: 'Dine-in', data: [45,62,38,71,55,92,87], backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 },
      { label: 'Delivery', data: [32,45,28,53,41,68,63], backgroundColor: 'rgba(34,211,238,0.7)', borderRadius: 6 },
      { label: 'Takeaway', data: [18,24,15,30,22,35,28], backgroundColor: 'rgba(167,139,250,0.7)', borderRadius: 6 }
    ]
  };
  const pieData = {
    labels: ['Cash','Card','Online','Wallet'],
    datasets: [{ data: [35,30,25,10], backgroundColor: ['#6366f1','#22d3ee','#34d399','#fb923c'], borderWidth: 0 }]
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
        <div className="stat-card purple"><div className="stat-card-header"><div className="stat-icon purple"><DollarSign size={22}/></div><span className="stat-trend up">↑ 12.5%</span></div><div className="stat-value">${(stats.totalRevenue||0).toLocaleString()}</div><div className="stat-label">Total Revenue</div></div>
        <div className="stat-card cyan"><div className="stat-card-header"><div className="stat-icon cyan"><ShoppingCart size={22}/></div><span className="stat-trend up">↑ 8.3%</span></div><div className="stat-value">{stats.totalOrders||0}</div><div className="stat-label">Total Orders</div></div>
        <div className="stat-card green"><div className="stat-card-header"><div className="stat-icon green"><Users size={22}/></div><span className="stat-trend up">↑ 3.2%</span></div><div className="stat-value">{stats.totalUsers||0}</div><div className="stat-label">Active Users</div></div>
        <div className="stat-card orange"><div className="stat-card-header"><div className="stat-icon orange"><Building size={22}/></div><span className="stat-trend up">↑ 2</span></div><div className="stat-value">{stats.totalTenants||0}</div><div className="stat-label">Active Tenants</div></div>
      </div>

      <div className="grid-2 mb-24">
        <div className="glass-card"><div className="card-header"><div className="card-title"><TrendingUp size={18}/> Revenue Overview</div><div className="tabs"><button className="tab active">Yearly</button><button className="tab">Monthly</button></div></div><div className="chart-container"><Line data={revenueData} options={chartOpts}/></div></div>
        <div className="glass-card"><div className="card-header"><div className="card-title"><BarChart3 size={18}/> Orders by Type</div></div><div className="chart-container"><Bar data={orderData} options={{...chartOpts, scales: {...chartOpts.scales, x: {...chartOpts.scales.x, stacked: true}}, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12, padding: 16, font: { size: 11 } }}}}}/></div></div>
      </div>

      <div className="grid-2 mb-24">
        <div className="glass-card">
          <div className="card-header"><div className="card-title"><ShoppingCart size={18}/> Recent Orders</div><button className="btn btn-sm btn-outline">View All</button></div>
          <table><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Type</th></tr></thead><tbody>
            {recentOrders.length > 0 ? recentOrders.map(o => (
              <tr key={o.id}><td style={{fontWeight:600}}>#{o.orderNumber||o.id.slice(-6)}</td><td>{o.user?.name||'Walk-in'}</td><td style={{fontWeight:600}}>${o.totalAmount?.toFixed(2)}</td>
              <td><span className={`badge ${o.status==='DELIVERED'?'badge-success':o.status==='CANCELLED'?'badge-danger':o.status==='PREPARING'?'badge-warning':'badge-info'}`}><span className={`badge-dot ${o.status==='DELIVERED'?'green':o.status==='CANCELLED'?'red':'blue'}`}></span>{o.status}</span></td>
              <td><span className="badge badge-default">{o.type}</span></td></tr>
            )) : <tr><td colSpan="5" className="table-empty">No orders yet. They'll appear here in real-time.</td></tr>}
          </tbody></table>
        </div>
        <div className="flex flex-col gap-24">
          <div className="glass-card"><div className="card-header"><div className="card-title"><PieChart size={18}/> Payment Methods</div></div><div style={{height:200,display:'flex',justifyContent:'center'}}><Doughnut data={pieData} options={{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{color:'#94a3b8',padding:12,boxWidth:12,font:{size:11}}}}}}/></div></div>
          <div className="glass-card"><div className="card-header"><div className="card-title"><Activity size={18}/> Live Activity</div><span className="live-dot"></span></div>
            <div className="activity-list">{activities.map((a,i) => (<div key={i} className="activity-item"><div className={`activity-dot ${a.color}`}></div><div className="activity-info"><div className="activity-text" dangerouslySetInnerHTML={{__html:a.text}}></div><div className="activity-time">{a.time}</div></div></div>))}</div>
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
  const counts = { ALL: orders.length, PENDING: orders.filter(o=>o.status==='PENDING').length, PREPARING: orders.filter(o=>o.status==='PREPARING').length, READY: orders.filter(o=>o.status==='READY').length, DELIVERED: orders.filter(o=>o.status==='DELIVERED').length, CANCELLED: orders.filter(o=>o.status==='CANCELLED').length };

  const updateStatus = async (id, status) => {
    try { await fetch(`${API}/api/pos/orders/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({status}) }); onRefresh(); } catch {}
  };

  return (
    <div className="fade-in">
      <div className="section-header"><div className="section-title"><ShoppingCart size={22}/> Order Management</div><div className="flex gap-8"><button className="btn btn-sm btn-outline" onClick={onRefresh}><RefreshCw size={14}/> Refresh</button><button className="btn btn-sm btn-primary"><Download size={14}/> Export</button></div></div>
      <div className="filter-bar">
        <input className="filter-input" placeholder="Search orders..." value={search} onChange={e=>setSearch(e.target.value)} />
        {Object.keys(counts).map(s => <button key={s} className={`tab ${filter===s?'active':''}`} onClick={()=>setFilter(s)}>{s} ({counts[s]})</button>)}
      </div>
      <div className="table-wrapper"><table><thead><tr><th>Order #</th><th>Customer</th><th>Type</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>
        {filtered.length > 0 ? filtered.map(o => (
          <tr key={o.id}><td style={{fontWeight:600}}>#{o.orderNumber||o.id.slice(-6)}</td><td>{o.user?.name||'Walk-in'}</td><td><span className="badge badge-default">{o.type}</span></td><td>{o.items?.length||0}</td><td style={{fontWeight:700}}>${o.totalAmount?.toFixed(2)}</td><td>{o.payments?.[0]?.method||'CASH'}</td>
            <td><span className={`badge ${o.status==='DELIVERED'?'badge-success':o.status==='CANCELLED'?'badge-danger':o.status==='PREPARING'?'badge-warning':'badge-info'}`}>{o.status}</span></td>
            <td className="text-muted text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
            <td><div className="flex gap-4">
              {o.status==='PENDING'&&<button className="btn-icon" title="Accept" onClick={()=>updateStatus(o.id,'PREPARING')}><Check size={14}/></button>}
              {o.status==='PREPARING'&&<button className="btn-icon" title="Ready" onClick={()=>updateStatus(o.id,'READY')}><CheckCircle size={14}/></button>}
              {o.status==='READY'&&<button className="btn-icon" title="Deliver" onClick={()=>updateStatus(o.id,'DELIVERED')}><Truck size={14}/></button>}
              <button className="btn-icon" title="View"><Eye size={14}/></button>
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
    try { await fetch(`${API}/api/products`, { method:'POST', headers: headers(), body: JSON.stringify({ name:f.get('name'), sku:f.get('sku'), category:f.get('category'), price:+f.get('price'), cost:+f.get('cost'), description:f.get('description') }) }); setShowModal(false); onRefresh(); } catch {}
  };
  return (
    <div className="fade-in">
      <div className="section-header"><div className="section-title"><Package size={22}/> Products</div><button className="btn btn-sm btn-primary" onClick={()=>setShowModal(true)}><Plus size={14}/> Add Product</button></div>
      <div className="table-wrapper"><table><thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Cost</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {products.length > 0 ? products.map(p=>(
          <tr key={p.id}><td style={{fontWeight:600}}>{p.name}</td><td className="text-muted">{p.sku}</td><td><span className="badge badge-purple">{p.category}</span></td><td style={{fontWeight:600}}>${p.price?.toFixed(2)}</td><td className="text-muted">${p.cost?.toFixed(2)}</td><td><span className={`badge ${p.isActive?'badge-success':'badge-danger'}`}>{p.isActive?'Active':'Inactive'}</span></td>
            <td><div className="flex gap-4"><button className="btn-icon"><Edit size={14}/></button><button className="btn-icon"><Trash2 size={14}/></button></div></td></tr>
        )) : <tr><td colSpan="7" className="table-empty">No products yet</td></tr>}
      </tbody></table></div>
      {showModal && <div className="modal-overlay" onClick={()=>setShowModal(false)}><div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><div className="modal-title">Add New Product</div><button className="btn-icon" onClick={()=>setShowModal(false)}><X size={16}/></button></div>
        <form onSubmit={createProduct} className="modal-body">
          <div className="form-group"><label>Product Name</label><input name="name" className="form-input" required/></div>
          <div className="grid-2"><div className="form-group"><label>SKU</label><input name="sku" className="form-input" required/></div><div className="form-group"><label>Category</label><input name="category" className="form-input" required/></div></div>
          <div className="grid-2"><div className="form-group"><label>Price</label><input name="price" type="number" step="0.01" className="form-input" required/></div><div className="form-group"><label>Cost</label><input name="cost" type="number" step="0.01" className="form-input"/></div></div>
          <div className="form-group"><label>Description</label><textarea name="description" className="form-input" rows="3"></textarea></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Product</button></div>
        </form></div></div>}
    </div>
  );
}

// ═══════════════════════════════════════
// USERS, TENANTS, VENDORS, RIDERS, REPORTS, SETTINGS PAGES
// ═══════════════════════════════════════
function UsersPage({ users, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const createUser = async(e)=>{ e.preventDefault(); const f=new FormData(e.target); try{await fetch(`${API}/api/users`,{method:'POST',headers:headers(),body:JSON.stringify({name:f.get('name'),email:f.get('email'),password:f.get('password'),role:f.get('role')})}); setShowModal(false); onRefresh();}catch{} };
  return (
    <div className="fade-in">
      <div className="section-header"><div className="section-title"><Users size={22}/> Users & Roles</div><button className="btn btn-sm btn-primary" onClick={()=>setShowModal(true)}><Plus size={14}/> Add User</button></div>
      <div className="table-wrapper"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>
        {users.map(u=>(<tr key={u.id}><td style={{fontWeight:600}}>{u.name}</td><td className="text-muted">{u.email}</td><td><span className="badge badge-purple">{u.role}</span></td><td><span className={`badge ${u.isActive!==false?'badge-success':'badge-danger'}`}>{u.isActive!==false?'Active':'Inactive'}</span></td><td className="text-muted text-sm">{new Date(u.createdAt).toLocaleDateString()}</td><td><div className="flex gap-4"><button className="btn-icon"><Edit size={14}/></button><button className="btn-icon"><Trash2 size={14}/></button></div></td></tr>))}
        {users.length===0&&<tr><td colSpan="6" className="table-empty">No users found</td></tr>}
      </tbody></table></div>
      {showModal&&<div className="modal-overlay" onClick={()=>setShowModal(false)}><div className="modal-card" onClick={e=>e.stopPropagation()}><div className="modal-header"><div className="modal-title">Add User</div><button className="btn-icon" onClick={()=>setShowModal(false)}><X size={16}/></button></div>
        <form onSubmit={createUser} className="modal-body"><div className="form-group"><label>Name</label><input name="name" className="form-input" required/></div><div className="form-group"><label>Email</label><input name="email" type="email" className="form-input" required/></div><div className="form-group"><label>Password</label><input name="password" type="password" className="form-input" minLength={6} required/></div>
          <div className="form-group"><label>Role</label><select name="role" className="form-input"><option value="TENANT_ADMIN">Tenant Admin</option><option value="MANAGER">Manager</option><option value="CASHIER">Cashier</option><option value="WAITER">Waiter</option><option value="KITCHEN">Kitchen</option><option value="VENDOR">Vendor</option><option value="RIDER">Rider</option><option value="CUSTOMER">Customer</option></select></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create User</button></div></form></div></div>}
    </div>
  );
}

function TenantsPage({ tenants, onRefresh }) {
  const [showModal,setShowModal]=useState(false);
  const createTenant=async(e)=>{e.preventDefault();const f=new FormData(e.target);try{await fetch(`${API}/api/tenant`,{method:'POST',headers:headers(),body:JSON.stringify({name:f.get('name'),subdomain:f.get('subdomain'),plan:f.get('plan')})});setShowModal(false);onRefresh();}catch{}};
  const suspend=async(id)=>{try{await fetch(`${API}/api/tenant/${id}`,{method:'DELETE',headers:headers()});onRefresh();}catch{}};
  return (<div className="fade-in"><div className="section-header"><div className="section-title"><Building size={22}/> Tenant Management</div><button className="btn btn-sm btn-primary" onClick={()=>setShowModal(true)}><Plus size={14}/> New Tenant</button></div>
    <div className="table-wrapper"><table><thead><tr><th>Name</th><th>Subdomain</th><th>Plan</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
      {tenants.map(t=>(<tr key={t.id}><td style={{fontWeight:600}}>{t.name}</td><td className="text-muted">{t.subdomain}</td><td><span className="badge badge-cyan">{t.plan}</span></td><td><span className={`badge ${t.isActive?'badge-success':'badge-danger'}`}>{t.isActive?'Active':'Suspended'}</span></td><td className="text-muted text-sm">{new Date(t.createdAt).toLocaleDateString()}</td><td><div className="flex gap-4"><button className="btn-icon"><Edit size={14}/></button><button className="btn-icon" onClick={()=>suspend(t.id)}><XCircle size={14}/></button></div></td></tr>))}
      {tenants.length===0&&<tr><td colSpan="6" className="table-empty">No tenants</td></tr>}
    </tbody></table></div>
    {showModal&&<div className="modal-overlay" onClick={()=>setShowModal(false)}><div className="modal-card" onClick={e=>e.stopPropagation()}><div className="modal-header"><div className="modal-title">Create Tenant</div><button className="btn-icon" onClick={()=>setShowModal(false)}><X size={16}/></button></div>
      <form onSubmit={createTenant} className="modal-body"><div className="form-group"><label>Business Name</label><input name="name" className="form-input" required/></div><div className="form-group"><label>Subdomain</label><input name="subdomain" className="form-input" required/></div><div className="form-group"><label>Plan</label><select name="plan" className="form-input"><option value="BASIC">Basic</option><option value="PRO">Pro</option><option value="ENTERPRISE">Enterprise</option></select></div>
        <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div></form></div></div>}
  </div>);
}

function VendorsPage() { return <div className="fade-in"><div className="section-header"><div className="section-title"><Store size={22}/> Vendor Management</div><button className="btn btn-sm btn-primary"><Plus size={14}/> Add Vendor</button></div><div className="stat-grid"><div className="stat-card green"><div className="stat-value">12</div><div className="stat-label">Active Vendors</div></div><div className="stat-card orange"><div className="stat-value">3</div><div className="stat-label">Pending Verification</div></div><div className="stat-card purple"><div className="stat-value">$48,500</div><div className="stat-label">Total Commission</div></div><div className="stat-card cyan"><div className="stat-value">$12,200</div><div className="stat-label">Pending Payouts</div></div></div><div className="table-wrapper"><table><thead><tr><th>Business</th><th>Owner</th><th>Products</th><th>Orders</th><th>Commission</th><th>Verification</th><th>Actions</th></tr></thead><tbody><tr><td style={{fontWeight:600}}>Pizza Palace</td><td>Ali Khan</td><td>24</td><td>156</td><td>10%</td><td><span className="badge badge-success">Verified</span></td><td><div className="flex gap-4"><button className="btn-icon"><Eye size={14}/></button><button className="btn-icon"><Edit size={14}/></button></div></td></tr><tr><td style={{fontWeight:600}}>Burger Galaxy</td><td>Sara Ahmed</td><td>18</td><td>89</td><td>12%</td><td><span className="badge badge-warning">Pending</span></td><td><div className="flex gap-4"><button className="btn-icon"><Eye size={14}/></button><button className="btn-icon"><Check size={14}/></button></div></td></tr></tbody></table></div></div>; }

function RidersPage() { return <div className="fade-in"><div className="section-header"><div className="section-title"><Bike size={22}/> Rider Management</div><button className="btn btn-sm btn-primary"><Plus size={14}/> Add Rider</button></div><div className="stat-grid"><div className="stat-card green"><div className="stat-value">8</div><div className="stat-label">Online Riders</div></div><div className="stat-card orange"><div className="stat-value">5</div><div className="stat-label">On Delivery</div></div><div className="stat-card purple"><div className="stat-value">142</div><div className="stat-label">Today's Deliveries</div></div><div className="stat-card cyan"><div className="stat-value">$2,450</div><div className="stat-label">Today's Earnings</div></div></div><div className="table-wrapper"><table><thead><tr><th>Rider</th><th>Vehicle</th><th>Status</th><th>Today Deliveries</th><th>Earnings</th><th>Rating</th><th>Actions</th></tr></thead><tbody><tr><td style={{fontWeight:600}}>Ahmed Khan</td><td>Motorcycle</td><td><span className="badge badge-success"><span className="badge-dot green"></span>Online</span></td><td>12</td><td>$145</td><td><span className="flex items-center gap-4"><Star size={14} color="#fbbf24" fill="#fbbf24"/>4.8</span></td><td><button className="btn-icon"><Eye size={14}/></button></td></tr><tr><td style={{fontWeight:600}}>Hassan Ali</td><td>Bicycle</td><td><span className="badge badge-warning"><span className="badge-dot orange"></span>On Delivery</span></td><td>8</td><td>$92</td><td><span className="flex items-center gap-4"><Star size={14} color="#fbbf24" fill="#fbbf24"/>4.5</span></td><td><button className="btn-icon"><Eye size={14}/></button></td></tr></tbody></table></div></div>; }

function ReportsPage() {
  const reports = ['Sales Report','Order Analytics','Revenue by Outlet','Vendor Performance','Rider Delivery Report','Inventory Valuation','Commission Report','Daily Closing Summary','Tax Report','Customer Analytics','Product Performance','Shift Reconciliation'];
  return <div className="fade-in"><div className="section-header"><div className="section-title"><BarChart3 size={22}/> Reports & Analytics</div><button className="btn btn-sm btn-primary"><Download size={14}/> Export All</button></div><div className="grid-3">{reports.map(r=>(<div key={r} className="glass-card cursor-pointer"><div className="card-title"><FileText size={18}/>{r}</div><p className="text-muted text-sm" style={{marginTop:8}}>Click to generate & view</p><div className="progress-bar" style={{marginTop:12}}><div className="progress-fill purple" style={{width:`${Math.random()*60+30}%`}}></div></div></div>))}</div></div>;
}

function FinancePage() { return <div className="fade-in"><div className="section-header"><div className="section-title"><CreditCard size={22}/> Payments & Payouts</div></div><div className="stat-grid"><div className="stat-card green"><div className="stat-value">$125,400</div><div className="stat-label">Total Collected</div></div><div className="stat-card orange"><div className="stat-value">$18,320</div><div className="stat-label">Pending Payouts</div></div><div className="stat-card purple"><div className="stat-value">$8,540</div><div className="stat-label">Commission Earned</div></div><div className="stat-card red"><div className="stat-value">$2,100</div><div className="stat-label">Refunded</div></div></div><div className="table-wrapper"><table><thead><tr><th>Transaction</th><th>Type</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead><tbody><tr><td>#TXN-001</td><td><span className="badge badge-success">Payment</span></td><td style={{fontWeight:600}}>$245.00</td><td>Card</td><td><span className="badge badge-success">Completed</span></td><td className="text-muted">Today</td></tr><tr><td>#TXN-002</td><td><span className="badge badge-orange">Payout</span></td><td style={{fontWeight:600}}>$1,200.00</td><td>Bank Transfer</td><td><span className="badge badge-warning">Processing</span></td><td className="text-muted">Today</td></tr></tbody></table></div></div>; }

function LeadsPage({ leads, onRefresh }) {
  const convertLead=async(id)=>{try{await fetch(`${API}/api/leads/${id}/convert`,{method:'PUT',headers:headers()});onRefresh();}catch{}};
  return <div className="fade-in"><div className="section-header"><div className="section-title"><UserPlus size={22}/> Lead Management</div></div><div className="table-wrapper"><table><thead><tr><th>Name</th><th>Business</th><th>Type</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{leads.map(l=>(<tr key={l.id}><td style={{fontWeight:600}}>{l.name}</td><td>{l.businessName}</td><td><span className="badge badge-purple">{l.businessType}</span></td><td><span className="badge badge-info">{l.status}</span></td><td className="text-muted text-sm">{new Date(l.createdAt).toLocaleDateString()}</td><td>{l.status!=='CONVERTED'&&<button className="btn btn-sm btn-green" onClick={()=>convertLead(l.id)}>Convert</button>}</td></tr>))}{leads.length===0&&<tr><td colSpan="6" className="table-empty">No leads yet</td></tr>}</tbody></table></div></div>;
}

function SettingsPage() { return <div className="fade-in"><div className="section-header"><div className="section-title"><Settings size={22}/> Global Settings</div></div><div className="grid-2"><div className="glass-card"><div className="card-title"><Globe size={18}/>Platform Branding</div><form className="modal-body" style={{marginTop:16}}><div className="form-group"><label>Platform Name</label><input className="form-input" defaultValue="Galaxy Express"/></div><div className="form-group"><label>Logo URL</label><input className="form-input" placeholder="https://..."/></div><div className="form-group"><label>Invoice Logo URL</label><input className="form-input" placeholder="https://..."/></div><button type="button" className="btn btn-primary" style={{alignSelf:'flex-start',marginTop:8}}>Save Branding</button></form></div><div className="glass-card"><div className="card-title"><Shield size={18}/>Payment Gateways</div><div style={{marginTop:16,display:'flex',flexDirection:'column',gap:16}}><div className="flex justify-between items-center"><span>Stripe</span><span className="badge badge-success">Enabled</span></div><div className="flex justify-between items-center"><span>GoPayFast</span><span className="badge badge-success">Enabled</span></div><div className="flex justify-between items-center"><span>Cash on Delivery</span><span className="badge badge-success">Enabled</span></div><div className="flex justify-between items-center"><span>UPI</span><span className="badge badge-default">Disabled</span></div></div></div></div><div className="grid-2 mt-24"><div className="glass-card"><div className="card-title"><Globe size={18}/>Translations (EN / UR)</div><table style={{marginTop:16}}><thead><tr><th>Key</th><th>English</th><th>Urdu</th><th>Edit</th></tr></thead><tbody><tr><td>ui.checkout</td><td>Checkout</td><td>Checkout Karein</td><td><button className="btn-icon"><Edit size={14}/></button></td></tr><tr><td>ui.total</td><td>Total</td><td>Kul Raqam</td><td><button className="btn-icon"><Edit size={14}/></button></td></tr></tbody></table></div><div className="glass-card"><div className="card-title"><HelpCircle size={18}/>FAQ Management</div><table style={{marginTop:16}}><thead><tr><th>Target</th><th>Question</th><th>Edit</th></tr></thead><tbody><tr><td><span className="badge badge-orange">Vendor</span></td><td>How do payouts work?</td><td><button className="btn-icon"><Edit size={14}/></button></td></tr><tr><td><span className="badge badge-cyan">Rider</span></td><td>How to mark delivered?</td><td><button className="btn-icon"><Edit size={14}/></button></td></tr></tbody></table></div></div></div>; }

function GenericPage({ icon: Icon, title, subtitle }) { return <div className="fade-in"><div className="section-header"><div className="section-title"><Icon size={22}/> {title}</div><button className="btn btn-sm btn-primary"><Plus size={14}/> Add New</button></div><div className="glass-card" style={{textAlign:'center',padding:60}}><Icon size={48} color="var(--text-muted)" style={{marginBottom:16}}/><h3 style={{marginBottom:8,color:'var(--text-light)'}}>{title}</h3><p className="text-muted">{subtitle || 'This section is connected to your API. Data will appear as it flows in.'}</p></div></div>; }

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
  const [stats, setStats] = useState({ totalTenants:0, totalUsers:0, totalOrders:0, totalRevenue:0 });
  const [searchGlobal, setSearchGlobal] = useState('');

  const loadData = async () => {
    const h = headers();
    const safe = (p) => fetch(`${API}${p}`, { headers: h }).then(r=>r.json()).catch(()=>[]);
    const [t,l,u,s,o,p] = await Promise.all([safe('/api/tenant'),safe('/api/leads'),safe('/api/users'),safe('/api/tenant/stats'),safe('/api/pos/orders'),safe('/api/products')]);
    if(Array.isArray(t)) setTenants(t);
    if(Array.isArray(l)) setLeads(l);
    if(Array.isArray(u)) setUsers(u);
    if(s.totalTenants!==undefined) setStats(s);
    if(Array.isArray(o)) setOrders(o);
    if(Array.isArray(p)) setProducts(p);
  };

  useEffect(() => { loadData(); }, []);

  const pageTitles = { dashboard:'Dashboard', orders:'Order Management', pos_orders:'POS Orders', products:'Products', categories:'Categories', users:'Users & Roles', vendors:'Vendors', riders:'Riders', customers:'Customers', outlets:'Outlets & Tables', kds:'Kitchen Display', delivery:'Delivery Zones', reports:'Reports & Analytics', finance:'Payments & Payouts', commissions:'Commissions', wallets:'Wallets', coupons:'Coupons', banners:'Banners', notifications:'Notifications', blog:'Blog / CMS', faqs:'FAQs', tenants:'Tenants', leads:'Leads', settings:'Settings', api_keys:'API Keys', printers:'Printers' };

  const renderPage = () => {
    switch(page) {
      case 'dashboard': return <DashboardPage stats={stats} tenants={tenants} orders={orders}/>;
      case 'orders': case 'pos_orders': return <OrdersPage orders={orders} onRefresh={loadData}/>;
      case 'products': return <ProductsPage products={products} onRefresh={loadData}/>;
      case 'users': return <UsersPage users={users} onRefresh={loadData}/>;
      case 'tenants': return <TenantsPage tenants={tenants} onRefresh={loadData}/>;
      case 'vendors': return <VendorsPage/>;
      case 'riders': return <RidersPage/>;
      case 'reports': return <ReportsPage/>;
      case 'finance': case 'commissions': case 'wallets': return <FinancePage/>;
      case 'leads': return <LeadsPage leads={leads} onRefresh={loadData}/>;
      case 'settings': return <SettingsPage/>;
      case 'categories': return <GenericPage icon={Layers} title="Categories" subtitle="Manage product categories & subcategories"/>;
      case 'customers': return <GenericPage icon={UserCog} title="Customers" subtitle="View and manage customer accounts & loyalty points"/>;
      case 'outlets': return <GenericPage icon={MapPin} title="Outlets & Tables" subtitle="Manage restaurant outlets, tables and QR codes"/>;
      case 'kds': return <GenericPage icon={ChefHat} title="Kitchen Display" subtitle="Monitor real-time kitchen order status"/>;
      case 'delivery': return <GenericPage icon={Truck} title="Delivery Zones" subtitle="Create map-based delivery zones and pricing"/>;
      case 'coupons': return <GenericPage icon={Tag} title="Coupons & Promotions" subtitle="Create discount codes and promotional offers"/>;
      case 'banners': return <GenericPage icon={Image} title="Banners" subtitle="Manage marketing banners across all platforms"/>;
      case 'notifications': return <GenericPage icon={Bell} title="Push Notifications" subtitle="Send targeted push notifications to users"/>;
      case 'blog': return <GenericPage icon={BookOpen} title="Blog / CMS" subtitle="Manage blog posts and content pages"/>;
      case 'faqs': return <GenericPage icon={HelpCircle} title="FAQs" subtitle="Manage frequently asked questions"/>;
      case 'api_keys': return <GenericPage icon={Key} title="API Keys & Integrations" subtitle="Manage third-party API keys (Google Maps, Firebase, etc.)"/>;
      case 'printers': return <GenericPage icon={Printer} title="Printers & Invoicing" subtitle="Configure network printers and invoice templates"/>;
      default: return <DashboardPage stats={stats} tenants={tenants} orders={orders}/>;
    }
  };

  const handleLogout = () => { localStorage.removeItem('erp_token'); localStorage.removeItem('erp_user'); onLogout(); };
  const initials = user.name ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '??';

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand"><div className="brand-icon">⚡</div><div className="brand-text"><div className="brand-name">Galaxy Express</div><div className="brand-tag">Admin Panel</div></div></div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((n, i) => n.section
            ? <div key={i} className="nav-section-title">{n.section}</div>
            : <div key={n.id} className={`nav-item ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}>
                <n.icon size={18}/> {n.label}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card" onClick={handleLogout}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info"><div className="user-name">{user.name}</div><div className="user-role">{user.role}</div></div>
            <LogOut size={16} color="var(--text-muted)"/>
          </div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-left"><h1 className="page-title">{pageTitles[page]||'Dashboard'}</h1></div>
        <div className="topbar-right">
          <input className="search-global" placeholder="Search anything..." value={searchGlobal} onChange={e=>setSearchGlobal(e.target.value)}/>
          <button className="topbar-btn" onClick={loadData} title="Refresh"><RefreshCw size={18}/></button>
          <button className="topbar-btn"><Bell size={18}/><span className="notif-dot"></span></button>
          <button className="topbar-btn"><Moon size={18}/></button>
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
      } catch {}
    }
  }, []);

  if (!authed) return <LoginScreen onLogin={(data) => { setUser(data.user); setAuthed(true); }} />;
  return <AdminDashboard user={user} onLogout={() => { setAuthed(false); setUser(null); }} />;
}
