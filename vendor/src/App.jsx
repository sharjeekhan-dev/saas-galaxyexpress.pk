import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Store, ShoppingCart, Package, Users, BarChart3, Receipt, ClipboardList, BookOpen, Settings, LogOut, Bell, Search, Moon, FileText, ArrowDownRight, ArrowUpRight, DollarSign, Wallet, Building, RotateCcw, AlertTriangle, Truck } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('erp_token')}` });

// ═══════════════════════════════════════
// MOCK DATA FOR ERP & MULTI-BRANCH
// ═══════════════════════════════════════
const BRANCHES = [
  { id:'b1', name:'Main Branch (Model Town)', code:'HQ' },
  { id:'b2', name:'Gulberg Outlet', code:'GB' },
  { id:'b3', name:'DHA Phase 5', code:'DHA5' },
];

const CHART_OF_ACCOUNTS = [
  { code:'1000', name:'Assets', type:'Asset', balance:1250000 },
  { code:'1100', name:'Cash in Hand', type:'Asset', balance:45000 },
  { code:'1200', name:'Bank Accounts', type:'Asset', balance:450000 },
  { code:'1300', name:'Accounts Receivable', type:'Asset', balance:85000 },
  { code:'1400', name:'Inventory', type:'Asset', balance:670000 },
  { code:'2000', name:'Liabilities', type:'Liability', balance:350000 },
  { code:'2100', name:'Accounts Payable', type:'Liability', balance:150000 },
  { code:'3000', name:'Equity', type:'Equity', balance:800000 },
  { code:'4000', name:'Revenue', type:'Revenue', balance:550000 },
  { code:'4100', name:'Sales Revenue', type:'Revenue', balance:520000 },
  { code:'4200', name:'Delivery Income', type:'Revenue', balance:30000 },
  { code:'5000', name:'Expenses', type:'Expense', balance:420000 },
  { code:'5100', name:'Cost of Goods Sold', type:'Expense', balance:280000 },
  { code:'5200', name:'Salaries', type:'Expense', balance:80000 },
  { code:'5300', name:'Rent & Utilities', type:'Expense', balance:60000 },
];

const STOCK_ITEMS = [
  { id:'s1', code:'RM-001', name:'Chicken Breast', unit:'KG', qty:45.5, rate:450, value:20475 },
  { id:'s2', code:'RM-002', name:'Pizza Flour', unit:'KG', qty:120, rate:150, value:18000 },
  { id:'s3', code:'RM-003', name:'Mozzarella Cheese', unit:'KG', qty:32, rate:1200, value:38400 },
  { id:'s4', code:'PM-001', name:'Pizza Box 10"', unit:'PCs', qty:450, rate:25, value:11250 },
];

// ═══════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const data = await res.json();
      if(!res.ok){ setError(data.error); setLoading(false); return; }
      if(data.user.role !== 'VENDOR' && data.user.role !== 'TENANT_ADMIN'){ setError('Vendor access required.'); setLoading(false); return; }
      localStorage.setItem('erp_token', data.token); localStorage.setItem('erp_user', JSON.stringify(data.user));
      onLogin(data);
    } catch { setError('Connection failed'); setLoading(false); }
  };

  return (
    <div className="login-page"><div className="login-box">
      <div className="login-icon">🏪</div>
      <h1>Vendor Portal</h1>
      <p>Manage your stores, stock, and accounts</p>
      {error && <div className="login-err">{error}</div>}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="fg"><label>Email</label><input className="fi" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div className="fg"><label>Password</label><input className="fi" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
        <button type="submit" className="login-btn" disabled={loading}>{loading?'Logging in...':'Login'}</button>
      </form>
    </div></div>
  );
}

// ═══════════════════════════════════════
// DASHBOARD (Branch-wise Analytics)
// ═══════════════════════════════════════
function DashboardPage({ branch }) {
  const chartOpts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{color:'#94a3b8'}}}, scales:{y:{ticks:{color:'#64748b'},grid:{color:'rgba(255,255,255,0.05)'}},x:{ticks:{color:'#64748b'},grid:{display:false}}} };
  
  // Simulated data based on branch choice
  const multiplier = branch === 'All' ? 1 : branch === 'b1' ? 0.6 : branch === 'b2' ? 0.3 : 0.1;
  const salesData = {
    labels: ['10AM','12PM','2PM','4PM','6PM','8PM','10PM'],
    datasets: [{ label:'Today Sales', data:[120,450,380,240,600,850,420].map(v=>v*multiplier), borderColor:'#6366f1', backgroundColor:'rgba(99,102,241,0.1)', fill:true, tension:0.4 }]
  };

  const currentSales = 45200 * multiplier;
  const currentOrders = 125 * multiplier;
  const currentReturns = 1200 * multiplier;
  const currentCancellations = 3 * multiplier;

  return (
    <div style={{animation:'fi 0.4s ease'}}>
      <div className="sec-hdr">
        <div className="sec-title"><LayoutDashboard size={20}/> Overview — {branch==='All'?'All Branches':BRANCHES.find(b=>b.id===branch)?.name}</div>
      </div>

      <div className="stat-row">
        <div className="stat purple"><div className="stat-top"><div className="stat-ic purple"><DollarSign size={20}/></div><span className="stat-trend up">↑ 8%</span></div><div className="stat-val">${currentSales.toFixed(0)}</div><div className="stat-lbl">Gross Sales</div></div>
        <div className="stat cyan"><div className="stat-top"><div className="stat-ic cyan"><ShoppingCart size={20}/></div><span className="stat-trend up">↑ 12%</span></div><div className="stat-val">{currentOrders.toFixed(0)}</div><div className="stat-lbl">Total Orders</div></div>
        <div className="stat orange"><div className="stat-top"><div className="stat-ic orange"><RotateCcw size={20}/></div><span className="stat-trend down">↓ 2%</span></div><div className="stat-val">${currentReturns.toFixed(0)}</div><div className="stat-lbl">Returns / Refunds</div></div>
        <div className="stat red"><div className="stat-top"><div className="stat-ic red"><AlertTriangle size={20}/></div><span className="stat-trend down">↓ 1</span></div><div className="stat-val">{currentCancellations.toFixed(0)}</div><div className="stat-lbl">Cancellations</div></div>
      </div>

      <div className="g2">
        <div className="card"><div className="card-hdr"><div className="card-title"><BarChart3 size={16}/> Hourly Sales Trend</div></div><div className="chart-box"><Line data={salesData} options={chartOpts}/></div></div>
        <div className="card">
          <div className="card-hdr"><div className="card-title"><Store size={16}/> Branch Performance</div></div>
          <table style={{marginTop:10}}><thead><tr><th>Branch</th><th>Sales</th><th>Orders</th><th>Avg Ticket</th></tr></thead><tbody>
            {BRANCHES.map(b=>(
              <tr key={b.id}>
                <td style={{fontWeight:600}}>{b.name}</td>
                <td>${(b.code==='HQ'?27120:b.code==='GB'?13560:4520).toFixed(0)}</td>
                <td>{b.code==='HQ'?75:b.code==='GB'?37:13}</td>
                <td>${(361.6).toFixed(2)}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ACCOUNTS MODULE (Chart of Accounts, Invoices)
// ═══════════════════════════════════════
function AccountsPage() {
  const [tab, setTab] = useState('coa');

  return (
    <div style={{animation:'fi 0.4s ease'}}>
      <div className="sec-hdr"><div className="sec-title"><BookOpen size={20}/> Accounts & Finance</div></div>
      <div className="tabs" style={{marginBottom:24}}>
        <button className={`tab ${tab==='coa'?'active':''}`} onClick={()=>setTab('coa')}>Chart of Accounts</button>
        <button className={`tab ${tab==='purchase'?'active':''}`} onClick={()=>setTab('purchase')}>Purchase Invoices</button>
        <button className={`tab ${tab==='returns'?'active':''}`} onClick={()=>setTab('returns')}>Sales Returns</button>
        <button className={`tab ${tab==='ledger'?'active':''}`} onClick={()=>setTab('ledger')}>General Ledger</button>
      </div>

      {tab==='coa' && (
        <div className="tbl-wrap"><table><thead><tr><th>A/C Code</th><th>Account Title</th><th>Type</th><th>Current Balance</th><th>Actions</th></tr></thead><tbody>
          {CHART_OF_ACCOUNTS.map(a=>(
            <tr key={a.code}><td style={{fontFamily:'monospace',color:'var(--text-muted)'}}>{a.code}</td><td style={{fontWeight:600}}>{a.name}</td><td><span className={`badge ${a.type==='Asset'?'badge-blue':a.type==='Liability'?'badge-red':a.type==='Equity'?'badge-purple':a.type==='Revenue'?'badge-green':'badge-orange'}`}>{a.type}</span></td><td style={{fontWeight:700,textAlign:'right'}}>{a.balance.toLocaleString()} Rs</td><td><button className="btn-sm btn-outline">Ledger</button></td></tr>
          ))}
        </tbody></table></div>
      )}

      {tab==='purchase' && (
        <>
          <div className="filter-bar">
            <button className="btn btn-primary">+ New Purchase Invoice</button>
            <input className="fi" placeholder="Search Supplier/Inv #..." style={{width:200}}/>
          </div>
          <div className="tbl-wrap"><table><thead><tr><th>Inv No</th><th>Date</th><th>Supplier</th><th>Store/Dept</th><th>Gross</th><th>Net Amount</th><th>Status</th></tr></thead><tbody>
            <tr><td>PI-0012</td><td>09/02/2026</td><td>National Foods</td><td>Main Store - GB</td><td>18,500 Rs</td><td style={{fontWeight:700}}>18,500 Rs</td><td><span className="badge badge-green">Posted</span></td></tr>
            <tr><td>PI-0013</td><td>09/02/2026</td><td>Local Dairy Farms</td><td>Main Store - HQ</td><td>24,000 Rs</td><td style={{fontWeight:700}}>24,000 Rs</td><td><span className="badge badge-orange">Draft</span></td></tr>
          </tbody></table></div>
        </>
      )}

      {tab==='returns' && (
        <div className="tbl-wrap"><table><thead><tr><th>Return #</th><th>Date</th><th>Customer/Ref</th><th>Reason</th><th>Branch</th><th>Amount</th></tr></thead><tbody>
          <tr><td>SR-105</td><td>09/02/2026</td><td>Walk-in (POS-992)</td><td>Quality Issue</td><td>Main Branch</td><td style={{fontWeight:700,color:'var(--red)'}}>-1,450 Rs</td></tr>
          <tr><td>SR-106</td><td>08/02/2026</td><td>Ali Raza (Order #451)</td><td>Wrong item delivered</td><td>DHA Phase 5</td><td style={{fontWeight:700,color:'var(--red)'}}>-850 Rs</td></tr>
        </tbody></table></div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// INVENTORY & STOCK MODULE
// ═══════════════════════════════════════
function StockPage() {
  const [tab, setTab] = useState('inventory');

  return (
    <div style={{animation:'fi 0.4s ease'}}>
      <div className="sec-hdr"><div className="sec-title"><Package size={20}/> Inventory & Stock Control</div></div>
      <div className="tabs" style={{marginBottom:24}}>
        <button className={`tab ${tab==='inventory'?'active':''}`} onClick={()=>setTab('inventory')}>Current Stock</button>
        <button className={`tab ${tab==='issue'?'active':''}`} onClick={()=>setTab('issue')}>Stock Issue Note (Consumption)</button>
        <button className={`tab ${tab==='transfer'?'active':''}`} onClick={()=>setTab('transfer')}>Branch Transfers</button>
        <button className={`tab ${tab==='production'?'active':''}`} onClick={()=>setTab('production')}>Production Recipe</button>
      </div>

      {tab==='inventory' && (
        <div className="tbl-wrap"><table><thead><tr><th>Code</th><th>Item Description</th><th>Unit</th><th>Available Qty</th><th>Avg Rate</th><th>Total Value</th></tr></thead><tbody>
          {STOCK_ITEMS.map(s=>(
            <tr key={s.id}><td>{s.code}</td><td style={{fontWeight:600}}>{s.name}</td><td>{s.unit}</td><td style={{fontWeight:700}}>{s.qty}</td><td>{s.rate} Rs</td><td style={{fontWeight:700,color:'var(--text)'}}>{s.value.toLocaleString()} Rs</td></tr>
          ))}
        </tbody></table></div>
      )}

      {tab==='issue' && (
        <div className="card">
          <div className="card-hdr" style={{borderBottom:'1px solid var(--border)',paddingBottom:12}}><div className="card-title">Stock Issue Note / Consumption</div></div>
          <div className="g2" style={{marginBottom:20}}>
            <div className="fg"><label>Voucher No</label><input className="fi" value="AUTO" disabled/></div>
            <div className="fg"><label>Date</label><input className="fi" type="date" defaultValue="2026-02-09"/></div>
            <div className="fg"><label>Remarks / Department</label><input className="fi" placeholder="Kitchen Dept"/></div>
            <div className="fg"><label>Expense GL Account</label><select className="fi"><option>5100 - Cost of Goods Sold</option><option>5250 - Wastage Expense</option></select></div>
          </div>
          <table style={{marginBottom:20,border:'1px solid var(--border)'}}><thead><tr style={{background:'rgba(255,255,255,0.05)'}}><th>Item Code</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Action</th></tr></thead><tbody>
            <tr>
              <td><input className="fi" style={{padding:'6px',width:80}} defaultValue="RM-001"/></td>
              <td>Chicken Breast</td>
              <td><input className="fi" type="number" style={{padding:'6px',width:70}} defaultValue="5"/></td>
              <td>450</td>
              <td style={{fontWeight:600}}>2250 Rs</td>
              <td><button className="btn-icon"><Trash2 size={14}/></button></td>
            </tr>
          </tbody></table>
          <div style={{display:'flex',justifyContent:'flex-end',gap:10}}><button className="btn btn-outline">Cancel</button><button className="btn btn-primary">Save & Post Issue Note</button></div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN VENDOR APP
// ═══════════════════════════════════════
function VendorDashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [branch, setBranch] = useState('All');

  const navs = [
    { section:'Main' },
    { id:'dashboard', label:'Dashboard', icon:LayoutDashboard },
    { id:'pos', label:'Point of Sale', icon:Receipt, badge:'Live' },
    { id:'orders', label:'Online Orders', icon:ShoppingCart },
    { section:'ERP & Accounts' },
    { id:'accounts', label:'Accounts & Finance', icon:BookOpen },
    { id:'stock', label:'Inventory & Stock', icon:Package },
    { id:'suppliers', label:'Suppliers', icon:Truck },
    { section:'Management' },
    { id:'menu', label:'Menu / Items', icon:ClipboardList },
    { id:'hr', label:'Staff & HR', icon:Users },
    { id:'reports', label:'All Reports', icon:BarChart3 },
    { id:'settings', label:'Settings', icon:Settings },
  ];

  const renderPage = () => {
    switch(page){
      case 'dashboard': return <DashboardPage branch={branch}/>;
      case 'accounts': return <AccountsPage/>;
      case 'stock': return <StockPage/>;
      default: return <div style={{animation:'fi 0.4s ease',padding:40,textAlign:'center',color:'var(--text-muted)'}}><div style={{fontSize:'3rem',marginBottom:10}}>🚧</div><h2>Under Construction</h2><p>This ERP module is being connected to the main platform API.</p></div>;
    }
  };

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="side">
        <div className="side-hdr">
          <div className="side-brand"><div className="side-logo">🏪</div><div><div className="side-name">Restaurant Pro</div><div className="side-tag">Vendor ERP Panel</div></div></div>
        </div>
        <nav className="side-nav">
          {navs.map((n,i) => n.section ? <div key={i} className="nav-sec">{n.section}</div> :
            <div key={n.id} className={`nav-i ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}><n.icon size={16}/> {n.label} {n.badge && <span className="nav-badge">{n.badge}</span>}</div>
          )}
        </nav>
        <div className="side-ft">
          <div className="side-user" onClick={onLogout}>
            <div className="side-av">{user.name?user.name[0]:'V'}</div>
            <div><div className="side-uname">{user.name}</div><div className="side-urole">{user.role} Logout</div></div>
          </div>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="topbar">
        <h1>{navs.find(n=>n.id===page)?.label||'Dashboard'}</h1>
        
        {/* Branch Selector built into topbar for Vendor ERP */}
        <div style={{display:'flex',gap:6}}>
          <button className={`btn ${branch==='All'?'btn-primary':'btn-outline'}`} style={{padding:'6px 12px'}} onClick={()=>setBranch('All')}>All Branches</button>
          {BRANCHES.map(b=><button key={b.id} className={`btn ${branch===b.id?'btn-primary':'btn-outline'}`} style={{padding:'6px 12px'}} onClick={()=>setBranch(b.id)}>{b.code}</button>)}
        </div>

        <div className="topbar-r">
          <input className="search-g" placeholder="Search orders, invoices, accounts..."/>
          <button className="top-btn"><Bell size={16}/></button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="main" key={`${page}-${branch}`}>
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
    const saved = localStorage.getItem('erp_user');
    if(token && saved){ try{ const p=JSON.parse(atob(token.split('.')[1])); if(p.exp*1000>Date.now()){setUser(JSON.parse(saved));setAuthed(true);} }catch{} }
  }, []);

  if(!authed) return <LoginScreen onLogin={d=>{setUser(d.user);setAuthed(true);}}/>;
  return <VendorDashboard user={user} onLogout={()=>{localStorage.removeItem('erp_token');localStorage.removeItem('erp_user');setAuthed(false);setUser(null);}}/>;
}
