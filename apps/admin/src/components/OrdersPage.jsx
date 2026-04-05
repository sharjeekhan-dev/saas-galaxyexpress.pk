import React, { useState } from 'react';
import { API, headers } from '../App.jsx';
import {
  ShoppingCart, Eye, Edit, Trash2, X, Copy, Pencil, RotateCcw,
  ChevronDown, Download, Filter, Search, Printer, FileText,
  Clock, CheckCircle, Truck, XCircle, MoreHorizontal
} from 'lucide-react';

const STATUS_MAP = {
  PENDING:    { label:'Pending',     badge:'badge-warning',  icon: Clock },
  PREPARING:  { label:'Preparing',   badge:'badge-info',     icon: Clock },
  READY:      { label:'Ready',       badge:'badge-cyan',     icon: CheckCircle },
  DELIVERING: { label:'Delivering',  badge:'badge-purple',   icon: Truck },
  COMPLETED:  { label:'Completed',   badge:'badge-success',  icon: CheckCircle },
  CANCELLED:  { label:'Cancelled',   badge:'badge-danger',   icon: XCircle },
};

const MOCK_ORDERS = [
  { id:'ORD-10041', customer:'Ali Khan', phone:'+92 321 1234567', items:3, total:2450, status:'PENDING', type:'DELIVERY', date:'2026-04-05 14:32', outlet:'Main Branch', rider:null, deletedAt:null, renamedTo:null },
  { id:'ORD-10040', customer:'Sara Ahmed', phone:'+92 300 9876543', items:2, total:1250, status:'PREPARING', type:'DINE_IN', date:'2026-04-05 14:10', outlet:'Main Branch', rider:null, deletedAt:null, renamedTo:null },
  { id:'ORD-10039', customer:'Omar Sheikh', phone:'+92 333 5551234', items:5, total:4800, status:'DELIVERING', type:'DELIVERY', date:'2026-04-05 13:45', outlet:'Branch 2', rider:'Ahmed Khan', deletedAt:null, renamedTo:null },
  { id:'ORD-10038', customer:'Hassan Ali', phone:'+92 312 4445678', items:1, total:750, status:'COMPLETED', type:'TAKEAWAY', date:'2026-04-05 12:30', outlet:'Main Branch', rider:null, deletedAt:null, renamedTo:null },
  { id:'ORD-10037', customer:'Fatima Noor', phone:'+92 345 8889012', items:4, total:3200, status:'COMPLETED', type:'DELIVERY', date:'2026-04-05 11:15', outlet:'Branch 2', rider:'Hassan Ali', deletedAt:null, renamedTo:null },
  { id:'ORD-10036', customer:'Zain Malik', phone:'+92 301 7773456', items:2, total:1800, status:'CANCELLED', type:'DELIVERY', date:'2026-04-04 22:00', outlet:'Main Branch', rider:null, deletedAt:null, renamedTo:null },
];

export default function OrdersPage({ orders: apiOrders, onRefresh }) {
  const [localOrders, setLocalOrders] = useState(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [showRename, setShowRename] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  // get user role
  const userRole = (() => { try { return JSON.parse(localStorage.getItem('erp_user'))?.role } catch { return 'CASHIER' } })();
  const isAdmin = userRole === 'SUPER_ADMIN';

  // active vs recycled
  const activeOrders = localOrders.filter(o => !o.deletedAt);
  const recycledOrders = localOrders.filter(o => !!o.deletedAt);

  const filtered = activeOrders.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (o.renamedTo || o.id).toLowerCase().includes(s) ||
        o.customer.toLowerCase().includes(s) ||
        o.phone.includes(s);
    }
    return true;
  });

  // ─── CRUD Actions ─────────────────
  const duplicateOrder = (order) => {
    const newId = `ORD-${(10000 + localOrders.length + 1)}`;
    setLocalOrders(prev => [{
      ...order, id: newId, status: 'PENDING',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      deletedAt: null, renamedTo: null
    }, ...prev]);
    setContextMenu(null);
  };

  const softDelete = (id) => {
    setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: new Date().toISOString() } : o));
    setContextMenu(null);
  };

  const restoreOrder = (id) => {
    setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, deletedAt: null } : o));
  };

  const permanentDelete = (id) => {
    if (!confirm('⚠️ This will permanently delete this order. Are you sure?')) return;
    setLocalOrders(prev => prev.filter(o => o.id !== id));
  };

  const renameOrder = (id) => {
    if (!renameVal.trim()) return;
    setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, renamedTo: renameVal.trim() } : o));
    setShowRename(null);
    setRenameVal('');
  };

  const changeStatus = (id, newStatus) => {
    setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setContextMenu(null);
  };

  const kpis = {
    total: activeOrders.length,
    pending: activeOrders.filter(o => o.status === 'PENDING').length,
    completed: activeOrders.filter(o => o.status === 'COMPLETED').length,
    revenue: activeOrders.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.total, 0),
  };

  return (
    <div className="fade-in" onClick={() => setContextMenu(null)}>
      {/* ── Rename Modal ── */}
      {showRename && (
        <div className="modal-overlay" onClick={() => setShowRename(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title"><Pencil size={16} /> Rename Order</div>
              <button className="btn-icon" onClick={() => setShowRename(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current ID</label>
                <input className="form-input" value={showRename.renamedTo || showRename.id} readOnly style={{ opacity: 0.5 }} />
              </div>
              <div className="form-group">
                <label>New Name / Alias</label>
                <input className="form-input" value={renameVal} onChange={e => setRenameVal(e.target.value)}
                  placeholder="e.g. VIP-ORDER-001" autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowRename(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => renameOrder(showRename.id)}>Rename</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.renamedTo || selected.id}</div>
              <button className="btn-icon" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="glass-card"><div className="text-muted text-xs mb-8">Customer</div><div className="font-bold">{selected.customer}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Phone</div><div className="font-bold">{selected.phone}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Order Type</div><div><span className={`badge ${selected.type === 'DELIVERY' ? 'badge-purple' : selected.type === 'DINE_IN' ? 'badge-cyan' : 'badge-lime'}`}>{selected.type.replace('_', ' ')}</span></div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Status</div><div><span className={`badge ${STATUS_MAP[selected.status]?.badge}`}>{STATUS_MAP[selected.status]?.label}</span></div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Outlet</div><div className="font-bold">{selected.outlet}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Total Amount</div><div className="font-bold text-accent">Rs {selected.total.toLocaleString()}</div></div>
                {selected.rider && <div className="glass-card"><div className="text-muted text-xs mb-8">Rider Assigned</div><div className="font-bold">{selected.rider}</div></div>}
                <div className="glass-card"><div className="text-muted text-xs mb-8">Date/Time</div><div className="font-bold">{selected.date}</div></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-cyan btn-sm" onClick={() => { window.print(); }}><Printer size={13} /> Print</button>
              <button className="btn btn-primary btn-sm"><FileText size={13} /> Generate Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Recycle Bin Modal (Admin only) ── */}
      {showRecycleBin && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowRecycleBin(false)}>
          <div className="modal-card modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title"><Trash2 size={16} /> Recycle Bin ({recycledOrders.length} items)</div>
              <button className="btn-icon" onClick={() => setShowRecycleBin(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {recycledOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <Trash2 size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <div>Recycle Bin is empty</div>
                </div>
              ) : (
                <div className="table-wrapper" style={{ border: 'none' }}>
                  <table>
                    <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Deleted At</th><th>Actions</th></tr></thead>
                    <tbody>
                      {recycledOrders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{o.renamedTo || o.id}</td>
                          <td>{o.customer}</td>
                          <td style={{ fontWeight: 700 }}>Rs {o.total.toLocaleString()}</td>
                          <td className="text-muted text-sm">{new Date(o.deletedAt).toLocaleString()}</td>
                          <td>
                            <div className="flex gap-4">
                              <button className="btn btn-sm btn-green" onClick={() => restoreOrder(o.id)}><RotateCcw size={12} /> Restore</button>
                              <button className="btn btn-sm btn-red" onClick={() => permanentDelete(o.id)}><Trash2 size={12} /> Delete Forever</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="section-header">
        <div className="section-title"><ShoppingCart size={20} /> Order Management</div>
        <div className="flex gap-8">
          {isAdmin && recycledOrders.length > 0 && (
            <button className="btn btn-sm btn-red" onClick={() => setShowRecycleBin(true)}>
              <Trash2 size={13} /> Recycle Bin ({recycledOrders.length})
            </button>
          )}
          <button className="btn btn-sm btn-outline" onClick={onRefresh}><RotateCcw size={13} /> Refresh</button>
          <button className="btn btn-sm btn-green"><Download size={13} /> Export</button>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="stat-grid mb-20">
        <div className="stat-card purple"><div className="stat-card-header"><div className="stat-icon purple"><ShoppingCart size={19} /></div></div><div className="stat-value">{kpis.total}</div><div className="stat-label">Total Orders</div></div>
        <div className="stat-card orange"><div className="stat-card-header"><div className="stat-icon orange"><Clock size={19} /></div></div><div className="stat-value">{kpis.pending}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card green"><div className="stat-card-header"><div className="stat-icon green"><CheckCircle size={19} /></div></div><div className="stat-value">{kpis.completed}</div><div className="stat-label">Completed</div></div>
        <div className="stat-card cyan"><div className="stat-card-header"><div className="stat-icon cyan"><FileText size={19} /></div></div><div className="stat-value">Rs {kpis.revenue.toLocaleString()}</div><div className="stat-label">Revenue</div></div>
      </div>

      {/* ── Filters ── */}
      <div className="filter-bar">
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-light)' }} />
          <input className="filter-input" style={{ paddingLeft: 30 }} placeholder="Search order, customer, phone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Order ID</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  {o.renamedTo ? <><span style={{ color: 'var(--accent-dark)' }}>{o.renamedTo}</span> <span className="text-xs text-muted">({o.id})</span></> : o.id}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.customer}</div>
                  <div className="text-xs text-muted">{o.phone}</div>
                </td>
                <td><span className={`badge ${o.type === 'DELIVERY' ? 'badge-purple' : o.type === 'DINE_IN' ? 'badge-cyan' : 'badge-lime'}`}>{o.type.replace('_', ' ')}</span></td>
                <td>{o.items}</td>
                <td style={{ fontWeight: 700 }}>Rs {o.total.toLocaleString()}</td>
                <td><span className={`badge ${STATUS_MAP[o.status]?.badge}`}>{STATUS_MAP[o.status]?.label}</span></td>
                <td className="text-muted text-sm">{o.date}</td>
                <td>
                  <div className="flex gap-4" style={{ position: 'relative' }}>
                    <button className="btn-icon" title="View" onClick={() => setSelected(o)}><Eye size={13} /></button>
                    <button className="btn-icon" title="More actions" onClick={(e) => { e.stopPropagation(); setContextMenu(contextMenu === o.id ? null : o.id); }}>
                      <MoreHorizontal size={13} />
                    </button>

                    {/* Context Menu */}
                    {contextMenu === o.id && (
                      <div onClick={e => e.stopPropagation()} style={{
                        position: 'absolute', right: 0, top: 36, zIndex: 60,
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)', padding: 6, minWidth: 190,
                        boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.15s ease'
                      }}>
                        <div style={ctxStyle} onClick={() => duplicateOrder(o)}><Copy size={13} /> Duplicate Order</div>
                        <div style={ctxStyle} onClick={() => { setShowEdit(o); setContextMenu(null); }}><Edit size={13} /> Edit Order</div>
                        <div style={ctxStyle} onClick={() => { setShowRename(o); setRenameVal(o.renamedTo || ''); setContextMenu(null); }}><Pencil size={13} /> Rename</div>
                        <div style={{ ...ctxStyle, borderTop: '1px solid var(--border-color)', marginTop: 4, paddingTop: 8 }}>
                          <ChevronDown size={13} /> Change Status
                        </div>
                        {Object.entries(STATUS_MAP).filter(([k]) => k !== o.status).map(([k, v]) => (
                          <div key={k} style={{ ...ctxStyle, paddingLeft: 28, fontSize: '0.75rem' }} onClick={() => changeStatus(o.id, k)}>
                            <span className={`badge ${v.badge}`} style={{ fontSize: '0.65rem' }}>{v.label}</span>
                          </div>
                        ))}
                        <div style={{ ...ctxStyle, color: 'var(--neon-red)', borderTop: '1px solid var(--border-color)', marginTop: 4, paddingTop: 8 }} onClick={() => softDelete(o.id)}>
                          <Trash2 size={13} /> Move to Recycle Bin
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="table-empty">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ctxStyle = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
  borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
  color: 'var(--text-muted)', transition: 'background 0.15s',
};
