import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { Utensils, Bell, LogOut, X, ChefHat, Clock, Users, MapPin, Search, Plus, Minus, Trash2, Check, CreditCard, CalendarClock, ClipboardList, LayoutGrid, Send } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SECTIONS = ['All', 'Main Hall', 'Patio', 'VIP Room', 'Bar Area'];

const TABLES_DATA = [
  { id:'t1', name:'T1', seats:4, section:'Main Hall', status:'free' },
  { id:'t2', name:'T2', seats:2, section:'Main Hall', status:'occupied', order:'ORD-101', total:45.50, time:'12 min' },
  { id:'t3', name:'T3', seats:6, section:'Main Hall', status:'free' },
  { id:'t4', name:'T4', seats:4, section:'Main Hall', status:'reserved' },
  { id:'t5', name:'T5', seats:2, section:'Main Hall', status:'occupied', order:'ORD-102', total:28.00, time:'25 min' },
  { id:'t6', name:'T6', seats:8, section:'VIP Room', status:'free' },
  { id:'t7', name:'T7', seats:4, section:'VIP Room', status:'bill', order:'ORD-099', total:186.50, time:'52 min' },
  { id:'t8', name:'T8', seats:6, section:'VIP Room', status:'occupied', order:'ORD-103', total:92.00, time:'8 min' },
  { id:'t9', name:'T9', seats:2, section:'Patio', status:'free' },
  { id:'t10', name:'T10', seats:4, section:'Patio', status:'free' },
  { id:'t11', name:'T11', seats:2, section:'Patio', status:'occupied', order:'ORD-104', total:34.00, time:'15 min' },
  { id:'t12', name:'T12', seats:4, section:'Patio', status:'reserved' },
  { id:'t13', name:'B1', seats:1, section:'Bar Area', status:'occupied', order:'ORD-105', total:18.50, time:'5 min' },
  { id:'t14', name:'B2', seats:1, section:'Bar Area', status:'free' },
  { id:'t15', name:'B3', seats:1, section:'Bar Area', status:'free' },
  { id:'t16', name:'B4', seats:1, section:'Bar Area', status:'occupied', order:'ORD-106', total:12.00, time:'3 min' },
];

const MENU = [
  { id:1, name:'Caesar Salad', price:12, cat:'Starters', emoji:'🥗' },
  { id:2, name:'Bruschetta', price:9, cat:'Starters', emoji:'🍞' },
  { id:3, name:'Soup of the Day', price:8, cat:'Starters', emoji:'🍲' },
  { id:4, name:'Calamari Rings', price:11, cat:'Starters', emoji:'🦑' },
  { id:5, name:'Grilled Steak', price:32, cat:'Mains', emoji:'🥩' },
  { id:6, name:'Salmon Fillet', price:28, cat:'Mains', emoji:'🐟' },
  { id:7, name:'Chicken Parmesan', price:22, cat:'Mains', emoji:'🍗' },
  { id:8, name:'Lamb Chops', price:35, cat:'Mains', emoji:'🍖' },
  { id:9, name:'Pasta Carbonara', price:18, cat:'Mains', emoji:'🍝' },
  { id:10, name:'Mushroom Risotto', price:20, cat:'Mains', emoji:'🍄' },
  { id:11, name:'Truffle Fries', price:8, cat:'Sides', emoji:'🍟' },
  { id:12, name:'Garlic Bread', price:6, cat:'Sides', emoji:'🧄' },
  { id:13, name:'Mashed Potatoes', price:7, cat:'Sides', emoji:'🥔' },
  { id:14, name:'Craft Beer', price:9, cat:'Drinks', emoji:'🍺' },
  { id:15, name:'Red Wine', price:14, cat:'Drinks', emoji:'🍷' },
  { id:16, name:'Cocktail', price:16, cat:'Drinks', emoji:'🍸' },
  { id:17, name:'Fresh Juice', price:6, cat:'Drinks', emoji:'🧃' },
  { id:18, name:'Sparkling Water', price:4, cat:'Drinks', emoji:'💧' },
  { id:19, name:'Latte', price:5, cat:'Drinks', emoji:'☕' },
  { id:20, name:'Tiramisu', price:10, cat:'Desserts', emoji:'🍰' },
  { id:21, name:'Chocolate Lava', price:12, cat:'Desserts', emoji:'🍫' },
  { id:22, name:'Ice Cream', price:7, cat:'Desserts', emoji:'🍦' },
];

const MENU_CATS = ['All', 'Starters', 'Mains', 'Sides', 'Drinks', 'Desserts'];

// ═══════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { gsap.fromTo('.login-container', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.7, ease:'power3.out' }); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      if (!['SUPER_ADMIN','TENANT_ADMIN','MANAGER','WAITER'].includes(data.user.role)) { setError('Access denied. Waiter role required.'); setLoading(false); return; }
      localStorage.setItem('erp_token', data.token); localStorage.setItem('erp_user', JSON.stringify(data.user));
      onLogin(data);
    } catch { setError('Network error'); setLoading(false); }
  };

  return (
    <div className="login-page"><div className="login-container">
      <div className="login-brand"><div className="login-brand-icon">🍽️</div><h1>WaiterPad</h1><p>Table service & order management</p></div>
      {error && <div className="login-error">{error}</div>}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group"><label>Email</label><input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div className="form-group"><label>Password</label><input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
        <button type="submit" className="login-btn" disabled={loading}>{loading?'Signing in...':'Start Shift'}</button>
      </form>
    </div></div>
  );
}

// ═══════════════════════════════════════
// ORDER PANEL (Slide-up)
// ═══════════════════════════════════════
function OrderPanel({ table, onClose, onSubmit }) {
  const [order, setOrder] = useState([]);
  const [menuCat, setMenuCat] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MENU.filter(m => {
    if (search) return m.name.toLowerCase().includes(search.toLowerCase());
    return menuCat === 'All' || m.cat === menuCat;
  });

  const addItem = (item) => {
    setOrder(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty+1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, d) => {
    setOrder(prev => prev.map(i => {
      if (i.id !== id) return i;
      const n = i.qty + d;
      return n > 0 ? { ...i, qty: n } : null;
    }).filter(Boolean));
  };

  const subtotal = order.reduce((s,i) => s + i.price*i.qty, 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const handleSend = () => { onSubmit(order, total); };

  return (
    <>
      <div className="order-overlay" onClick={onClose}/>
      <div className="order-panel">
        <div className="order-panel-header">
          <div className="order-panel-title"><ChefHat size={20}/> {table.name} — New Order</div>
          <button className="order-panel-close" onClick={onClose}>✕ Cancel</button>
        </div>
        <div className="order-panel-body">
          {/* Menu Side */}
          <div className="menu-side">
            <div className="menu-search"><input placeholder="Search menu..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <div className="menu-cats">
              {MENU_CATS.map(c => <button key={c} className={`menu-cat ${menuCat===c?'active':''}`} onClick={()=>{setMenuCat(c);setSearch('')}}>{c}</button>)}
            </div>
            <div className="menu-scroll">
              {filtered.map(item => (
                <div key={item.id} className="menu-item" onClick={()=>addItem(item)}>
                  <div className="mi-left">
                    <span className="mi-emoji">{item.emoji}</span>
                    <div><div className="mi-name">{item.name}</div><div className="mi-cat">{item.cat}</div></div>
                  </div>
                  <span className="mi-price">${item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Side */}
          <div className="cart-side">
            <div className="cart-side-header">Order Items ({order.reduce((s,i)=>s+i.qty,0)})</div>
            <div className="cart-side-items">
              {order.length === 0 ? <div style={{textAlign:'center',color:'var(--text-muted)',padding:'40px 0',fontSize:'0.88rem'}}>Tap items to add</div> :
              order.map(item => (
                <div key={item.id} className="cart-line">
                  <span className="cl-qty">{item.qty}</span>
                  <div className="cl-info"><div className="cl-name">{item.emoji} {item.name}</div></div>
                  <span className="cl-price">${(item.price*item.qty).toFixed(2)}</span>
                  <div className="cl-actions">
                    <button className="cl-btn" onClick={()=>updateQty(item.id,-1)}>{item.qty===1?'✕':'−'}</button>
                    <button className="cl-btn" onClick={()=>updateQty(item.id,1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-side-footer">
              <div className="cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="cart-total-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="cart-total-row grand"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <button className="send-btn" disabled={order.length===0} onClick={handleSend}>
                <Send size={16}/> Send to Kitchen ({order.reduce((s,i)=>s+i.qty,0)} items)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// MAIN WAITER APP
// ═══════════════════════════════════════
function WaiterDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('floor');
  const [section, setSection] = useState('All');
  const [tables, setTables] = useState(TABLES_DATA);
  const [activeTable, setActiveTable] = useState(null);
  const [activeOrders, setActiveOrders] = useState([
    { id:'ORD-101', table:'T2', items:[{name:'Grilled Steak',qty:1,price:32},{name:'Caesar Salad',qty:1,price:12},{name:'Red Wine',qty:1,price:14}], total:63.80, status:'preparing', time:'12 min ago' },
    { id:'ORD-102', table:'T5', items:[{name:'Pasta Carbonara',qty:2,price:18},{name:'Garlic Bread',qty:1,price:6}], total:46.20, status:'ready', time:'25 min ago' },
    { id:'ORD-103', table:'T8', items:[{name:'Lamb Chops',qty:2,price:35},{name:'Truffle Fries',qty:2,price:8},{name:'Cocktail',qty:2,price:16}], total:130.68, status:'preparing', time:'8 min ago' },
    { id:'ORD-104', table:'T11', items:[{name:'Chicken Parmesan',qty:1,price:22},{name:'Fresh Juice',qty:2,price:6}], total:37.40, status:'served', time:'15 min ago' },
  ]);
  const [reservations] = useState([
    { id:1, name:'Ahmed Khan', guests:4, table:'T4', time:'7:00 PM', date:'Today', phone:'+923001234567', status:'upcoming' },
    { id:2, name:'Sara Ali', guests:2, table:'T12', time:'7:30 PM', date:'Today', phone:'+923009876543', status:'upcoming' },
    { id:3, name:'Hassan R.', guests:6, table:'T6', time:'8:00 PM', date:'Today', phone:'+923005551234', status:'upcoming' },
    { id:4, name:'Fatima B.', guests:3, table:'T3', time:'6:00 PM', date:'Today', phone:'+923007778899', status:'late' },
  ]);

  useEffect(() => {
    gsap.fromTo('.table-card', { opacity:0, scale:0.85 }, { opacity:1, scale:1, duration:0.35, stagger:0.03, ease:'back.out(1.5)' });
  }, [section, tab]);

  const openTable = (t) => { if (t.status === 'free' || t.status === 'occupied') setActiveTable(t); };

  const handleSubmitOrder = async (items, total) => {
    const token = localStorage.getItem('erp_token');
    try {
      await fetch(`${API}/api/pos/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          outletId: 'OUTLET_1', type: 'DINE_IN',
          items: items.map(i => ({ productId: String(i.id), quantity: i.qty, unitPrice: i.price })),
          payments: [{ method: 'CASH', amount: total, status: 'PENDING' }],
          totalAmount: total, taxAmount: total*0.10, discount: 0
        })
      });
    } catch {}

    const newOrder = { id: `ORD-${Math.floor(Math.random()*900+100)}`, table: activeTable.name, items: items.map(i=>({name:i.name,qty:i.qty,price:i.price})), total, status:'preparing', time:'Just now' };
    setActiveOrders(prev => [newOrder, ...prev]);
    setTables(prev => prev.map(t => t.id===activeTable.id ? { ...t, status:'occupied', total, time:'0 min', order: newOrder.id } : t));
    setActiveTable(null);
  };

  const markServed = (ordId) => { setActiveOrders(prev => prev.map(o => o.id===ordId ? {...o, status:'served'} : o)); };
  const generateBill = (ordId) => {
    const ord = activeOrders.find(o => o.id === ordId);
    if (ord) {
      setTables(prev => prev.map(t => t.name===ord.table ? {...t, status:'bill'} : t));
      setActiveOrders(prev => prev.filter(o => o.id !== ordId));
    }
  };

  const filteredTables = section === 'All' ? tables : tables.filter(t => t.section === section);
  const statusCounts = { free: tables.filter(t=>t.status==='free').length, occupied: tables.filter(t=>t.status==='occupied').length, reserved: tables.filter(t=>t.status==='reserved').length, bill: tables.filter(t=>t.status==='bill').length };
  const readyCount = activeOrders.filter(o=>o.status==='ready').length;

  const tableIcon = (s) => s==='free'?'🟢':s==='occupied'?'🟠':s==='reserved'?'🔵':'🔴';

  return (
    <div className="waiter-app">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-logo">🍽️</span>
          <div><div className="top-bar-title">WaiterPad</div><div className="top-bar-user">{user.name} — On Shift</div></div>
        </div>
        <div className="top-bar-right">
          <button className="top-btn"><Bell size={18}/>{readyCount>0&&<span className="notif-dot"/>}</button>
          <button className="top-btn" onClick={onLogout}><LogOut size={18}/></button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab==='floor'?'active':''}`} onClick={()=>setTab('floor')}><LayoutGrid size={16}/> Floor Plan</button>
        <button className={`tab-btn ${tab==='orders'?'active':''}`} onClick={()=>setTab('orders')}>
          <ClipboardList size={16}/> Active Orders
          {activeOrders.length>0&&<span className="tab-badge">{activeOrders.length}</span>}
        </button>
        <button className={`tab-btn ${tab==='reservations'?'active':''}`} onClick={()=>setTab('reservations')}>
          <CalendarClock size={16}/> Reservations
          {reservations.length>0&&<span className="tab-badge">{reservations.length}</span>}
        </button>
      </div>

      {/* Main */}
      <div className="main-area">
        {/* FLOOR PLAN */}
        {tab === 'floor' && (
          <>
            <div className="floor-header">
              <div className="floor-title"><MapPin size={20}/> Floor Plan</div>
              <div className="floor-stats">
                <div className="floor-stat"><div className="floor-stat-dot" style={{background:'var(--green)'}}></div>{statusCounts.free} Free</div>
                <div className="floor-stat"><div className="floor-stat-dot" style={{background:'var(--orange)'}}></div>{statusCounts.occupied} Occupied</div>
                <div className="floor-stat"><div className="floor-stat-dot" style={{background:'var(--accent)'}}></div>{statusCounts.reserved} Reserved</div>
                <div className="floor-stat"><div className="floor-stat-dot" style={{background:'var(--red)'}}></div>{statusCounts.bill} Bill</div>
              </div>
            </div>

            <div className="section-tabs">
              {SECTIONS.map(s => <button key={s} className={`section-tab ${section===s?'active':''}`} onClick={()=>setSection(s)}>{s}</button>)}
            </div>

            <div className="table-grid">
              {filteredTables.map(t => (
                <div key={t.id} className={`table-card ${t.status}`} onClick={()=>openTable(t)}>
                  <div className="table-icon">{tableIcon(t.status)}</div>
                  <div className="table-name">{t.name}</div>
                  <div className="table-seats"><Users size={12} style={{verticalAlign:'-2px'}}/> {t.seats} seats</div>
                  <div className={`table-status ${t.status}`}>{t.status==='bill'?'Bill Due':t.status}</div>
                  {t.time && <div className="table-time"><Clock size={11}/>{t.time}</div>}
                  {t.total && <div className="table-amount">${t.total.toFixed(2)}</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ACTIVE ORDERS */}
        {tab === 'orders' && (
          <>
            <div className="floor-header"><div className="floor-title"><ClipboardList size={20}/> Active Orders ({activeOrders.length})</div></div>
            <div className="orders-list">
              {activeOrders.map(o => (
                <div key={o.id} className="order-card">
                  <div className="oc-header">
                    <div><span className="oc-id">{o.id}</span> <span className="oc-table">• Table {o.table}</span></div>
                    <span className={`oc-badge ${o.status}`}>{o.status==='preparing'?'🔥 Preparing':o.status==='ready'?'✅ Ready':'🍽️ Served'}</span>
                  </div>
                  <div className="oc-items">{o.items.map((item,i) => (<div key={i} className="oc-item"><span className="oc-item-name">{item.qty}x {item.name}</span><span>${(item.price*item.qty).toFixed(2)}</span></div>))}</div>
                  <div className="oc-footer">
                    <div><div className="oc-total">${o.total.toFixed(2)}</div><div className="oc-time"><Clock size={12}/>{o.time}</div></div>
                    <div className="oc-actions">
                      {o.status==='ready'&&<button className="oc-btn serve" onClick={()=>markServed(o.id)}><Check size={14} style={{verticalAlign:'-2px'}}/> Mark Served</button>}
                      {o.status==='served'&&<button className="oc-btn bill" onClick={()=>generateBill(o.id)}><CreditCard size={14} style={{verticalAlign:'-2px'}}/> Generate Bill</button>}
                    </div>
                  </div>
                </div>
              ))}
              {activeOrders.length===0&&<div style={{textAlign:'center',color:'var(--text-muted)',padding:60}}>No active orders</div>}
            </div>
          </>
        )}

        {/* RESERVATIONS */}
        {tab === 'reservations' && (
          <>
            <div className="floor-header"><div className="floor-title"><CalendarClock size={20}/> Reservations ({reservations.length})</div></div>
            {reservations.map(r => (
              <div key={r.id} className="reservation-card">
                <div className="res-info">
                  <div className="res-avatar">{r.name.split(' ').map(w=>w[0]).join('')}</div>
                  <div><div className="res-name">{r.name}</div><div className="res-detail">{r.guests} guests • Table {r.table} • {r.phone}</div></div>
                </div>
                <div className="res-time">
                  <div className="res-time-main">{r.time}</div>
                  <div className="res-time-date">{r.date}</div>
                  <span className={`res-badge ${r.status}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Order Panel */}
      {activeTable && <OrderPanel table={activeTable} onClose={()=>setActiveTable(null)} onSubmit={handleSubmitOrder}/>}
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const saved = localStorage.getItem('erp_user');
    if (token && saved) { try { const p = JSON.parse(atob(token.split('.')[1])); if (p.exp*1000>Date.now()) { setUser(JSON.parse(saved)); setAuthed(true); } } catch {} }
  }, []);

  const logout = () => { localStorage.removeItem('erp_token'); localStorage.removeItem('erp_user'); setAuthed(false); setUser(null); };
  if (!authed) return <LoginScreen onLogin={d => { setUser(d.user); setAuthed(true); }}/>;
  return <WaiterDashboard user={user} onLogout={logout}/>;
}
