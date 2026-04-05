import React, { useState } from 'react';
import { Bike, Plus, Eye, Edit, Trash2, X, Copy, Pencil, RotateCcw, Star, MapPin, Phone, Check, MoreHorizontal } from 'lucide-react';
import { API, headers } from '../App.jsx';

const STATUS_COLOR = { ONLINE: 'badge-success', OFFLINE: 'badge-default', DELIVERING: 'badge-purple', ON_BREAK: 'badge-warning' };

const MOCK_RIDERS = [
  { id:'R001', name:'Ahmed Khan',    phone:'+92 321 1234567', zone:'North Karachi', status:'DELIVERING', rating:4.8, deliveries:245, earnings:18400, joinedAt:'2026-01-10', deletedAt:null, renamedTo:null },
  { id:'R002', name:'Hassan Ali',    phone:'+92 300 9876543', zone:'Central',       status:'ONLINE',     rating:4.6, deliveries:189, earnings:14200, joinedAt:'2026-01-22', deletedAt:null, renamedTo:null },
  { id:'R003', name:'Bilal Sheikh',  phone:'+92 333 5551234', zone:'Defense DHA',   status:'OFFLINE',    rating:4.9, deliveries:312, earnings:23100, joinedAt:'2025-12-05', deletedAt:null, renamedTo:null },
  { id:'R004', name:'Usman Farooq',  phone:'+92 312 4445678', zone:'Gulshan',       status:'ON_BREAK',   rating:4.3, deliveries:98,  earnings:7400,  joinedAt:'2026-02-14', deletedAt:null, renamedTo:null },
  { id:'R005', name:'Kamran Mirza',  phone:'+92 345 8889012', zone:'Clifton',       status:'ONLINE',     rating:4.7, deliveries:176, earnings:13200, joinedAt:'2026-01-30', deletedAt:null, renamedTo:null },
];

export default function RidersPage() {
  const [riders, setRiders]         = useState(MOCK_RIDERS);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected]     = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [showRename, setShowRename] = useState(null);
  const [renameVal, setRenameVal]   = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const userRole = (() => { try { return JSON.parse(localStorage.getItem('erp_user'))?.role } catch { return 'CASHIER' } })();
  const isAdmin  = userRole === 'SUPER_ADMIN';

  const active   = riders.filter(r => !r.deletedAt);
  const recycled = riders.filter(r =>  r.deletedAt);

  const filtered = active.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    const s = search.toLowerCase();
    return !s || (r.renamedTo||r.name).toLowerCase().includes(s) || r.phone.includes(s) || r.zone.toLowerCase().includes(s);
  });

  const duplicateRider = (r) => {
    const newId = `R${String(riders.length + 1).padStart(3,'0')}`;
    setRiders(prev => [{ ...r, id:newId, status:'OFFLINE', deliveries:0, earnings:0, deletedAt:null, renamedTo:null }, ...prev]);
    setContextMenu(null);
  };

  const softDelete = (id) => {
    setRiders(prev => prev.map(r => r.id===id ? { ...r, deletedAt: new Date().toISOString() } : r));
    setContextMenu(null);
  };

  const restore = (id) => setRiders(prev => prev.map(r => r.id===id ? { ...r, deletedAt:null } : r));

  const permDelete = (id) => {
    if (!confirm('Permanently delete this rider? This cannot be undone.')) return;
    setRiders(prev => prev.filter(r => r.id!==id));
  };

  const renameRider = (id) => {
    if (!renameVal.trim()) return;
    setRiders(prev => prev.map(r => r.id===id ? { ...r, renamedTo:renameVal.trim() } : r));
    setShowRename(null); setRenameVal('');
  };

  const createRider = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const newId = `R${String(riders.length + 1).padStart(3,'0')}`;
    setRiders(prev => [{
      id:newId, name:f.get('name'), phone:f.get('phone'), zone:f.get('zone'),
      status:'OFFLINE', rating:5.0, deliveries:0, earnings:0,
      joinedAt:new Date().toISOString().slice(0,10), deletedAt:null, renamedTo:null
    }, ...prev]);
    setShowModal(false);
  };

  const kpis = {
    online:    active.filter(r=>r.status==='ONLINE').length,
    delivering:active.filter(r=>r.status==='DELIVERING').length,
    total:     active.length,
    earnings:  active.reduce((s,r)=>s+r.earnings,0),
  };

  return (
    <div className="fade-in" onClick={()=>setContextMenu(null)}>

      {/* ── Rename Modal ── */}
      {showRename && (
        <div className="modal-overlay" onClick={()=>setShowRename(null)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()} style={{maxWidth:420}}>
            <div className="modal-header">
              <div className="modal-title"><Pencil size={16}/> Rename Rider</div>
              <button className="btn-icon" onClick={()=>setShowRename(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Name</label>
                <input className="form-input" value={showRename.renamedTo||showRename.name} readOnly style={{opacity:0.5}}/>
              </div>
              <div className="form-group">
                <label>New Display Name</label>
                <input className="form-input" value={renameVal} onChange={e=>setRenameVal(e.target.value)} placeholder="e.g. Senior Rider — Ahmed" autoFocus/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowRename(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>renameRider(showRename.id)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-card modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.renamedTo||selected.name}</div>
              <button className="btn-icon" onClick={()=>setSelected(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="glass-card"><div className="text-muted text-xs mb-8">Rider ID</div><div className="font-bold font-mono">{selected.id}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Status</div><span className={`badge ${STATUS_COLOR[selected.status]}`}>{selected.status.replace('_',' ')}</span></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Phone</div><div className="font-bold">{selected.phone}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Zone</div><div className="font-bold">{selected.zone}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Total Deliveries</div><div className="font-bold">{selected.deliveries}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Total Earnings</div><div className="font-bold text-accent">Rs {selected.earnings.toLocaleString()}</div></div>
                <div className="glass-card">
                  <div className="text-muted text-xs mb-8">Rating</div>
                  <div className="flex items-center gap-6">
                    <Star size={16} color="var(--neon-yellow)" fill="var(--neon-yellow)"/>
                    <span className="font-bold">{selected.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Joined</div><div className="font-bold">{selected.joinedAt}</div></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setSelected(null)}>Close</button>
              <button className="btn btn-primary btn-sm" onClick={()=>{setSelected(null);}}><Check size={13}/> Approve Payout</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Rider Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title"><Plus size={16}/> Add New Rider</div>
              <button className="btn-icon" onClick={()=>setShowModal(false)}><X size={16}/></button>
            </div>
            <form className="modal-body" onSubmit={createRider}>
              <div className="form-group"><label>Full Name</label><input name="name" className="form-input" required placeholder="e.g. Ahmed Khan"/></div>
              <div className="form-group"><label>Phone Number</label><input name="phone" className="form-input" type="tel" required placeholder="+92 3XX XXXXXXX"/></div>
              <div className="form-group"><label>Delivery Zone</label>
                <select name="zone" className="form-input">
                  {['North Karachi','Central','Defense DHA','Gulshan','Clifton','PECHS','Saddar'].map(z=><option key={z}>{z}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Rider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Recycle Bin (Admin Only) ── */}
      {showRecycleBin && isAdmin && (
        <div className="modal-overlay" onClick={()=>setShowRecycleBin(false)}>
          <div className="modal-card modal-xl" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title"><Trash2 size={16}/> Recycle Bin — Riders ({recycled.length})</div>
              <button className="btn-icon" onClick={()=>setShowRecycleBin(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              {recycled.length === 0 ? (
                <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
                  <Trash2 size={40} style={{opacity:0.3,marginBottom:12}}/><div>Recycle Bin is empty</div>
                </div>
              ) : (
                <div className="table-wrapper" style={{border:'none'}}>
                  <table>
                    <thead><tr><th>Name</th><th>Phone</th><th>Zone</th><th>Deleted At</th><th>Actions</th></tr></thead>
                    <tbody>
                      {recycled.map(r=>(
                        <tr key={r.id}>
                          <td style={{fontWeight:700}}>{r.renamedTo||r.name}</td>
                          <td>{r.phone}</td>
                          <td>{r.zone}</td>
                          <td className="text-muted text-sm">{new Date(r.deletedAt).toLocaleString()}</td>
                          <td>
                            <div className="flex gap-4">
                              <button className="btn btn-sm btn-green" onClick={()=>restore(r.id)}><RotateCcw size={12}/> Restore</button>
                              <button className="btn btn-sm btn-red"   onClick={()=>permDelete(r.id)}><Trash2 size={12}/> Delete Forever</button>
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
        <div className="section-title"><Bike size={20}/> Rider Management</div>
        <div className="flex gap-8">
          {isAdmin && recycled.length > 0 && (
            <button className="btn btn-sm btn-red" onClick={()=>setShowRecycleBin(true)}>
              <Trash2 size={13}/> Recycle Bin ({recycled.length})
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}><Plus size={14}/> Add Rider</button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="stat-grid mb-20">
        <div className="stat-card green"><div className="stat-value">{kpis.online}</div><div className="stat-label">Online Now</div></div>
        <div className="stat-card purple"><div className="stat-value">{kpis.delivering}</div><div className="stat-label">Delivering</div></div>
        <div className="stat-card cyan"><div className="stat-value">{kpis.total}</div><div className="stat-label">Total Riders</div></div>
        <div className="stat-card orange"><div className="stat-value">Rs {kpis.earnings.toLocaleString()}</div><div className="stat-label">Total Earnings Paid</div></div>
      </div>

      {/* ── Filters ── */}
      <div className="filter-bar">
        <input className="filter-input" placeholder="Search name, phone, zone…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="form-input" style={{width:160}} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          {Object.keys(STATUS_COLOR).map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Rider</th><th>Phone</th><th>Zone</th><th>Status</th><th>Rating</th><th>Deliveries</th><th>Total Earnings</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map(r=>(
              <tr key={r.id}>
                <td>
                  <div style={{fontWeight:700}}>{r.renamedTo||r.name}</div>
                  {r.renamedTo && <div className="text-xs text-muted">{r.name}</div>}
                </td>
                <td className="text-muted text-sm"><Phone size={11} style={{marginRight:4}}/>{r.phone}</td>
                <td><span className="flex items-center gap-4 text-sm"><MapPin size={11}/>{r.zone}</span></td>
                <td><span className={`badge ${STATUS_COLOR[r.status]}`}>{r.status.replace('_',' ')}</span></td>
                <td>
                  <div className="flex items-center gap-4">
                    <Star size={13} color="var(--neon-yellow)" fill="var(--neon-yellow)"/>
                    <span style={{fontWeight:700}}>{r.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td style={{fontWeight:600}}>{r.deliveries}</td>
                <td style={{fontWeight:700, color:'var(--accent-dark)'}}>Rs {r.earnings.toLocaleString()}</td>
                <td>
                  <div className="flex gap-4" style={{position:'relative'}}>
                    <button className="btn-icon" title="View" onClick={()=>setSelected(r)}><Eye size={13}/></button>
                    <button className="btn-icon" title="More" onClick={e=>{e.stopPropagation();setContextMenu(contextMenu===r.id?null:r.id);}}>
                      <MoreHorizontal size={13}/>
                    </button>
                    {contextMenu===r.id && (
                      <div onClick={e=>e.stopPropagation()} style={{
                        position:'absolute',right:0,top:36,zIndex:60,
                        background:'var(--bg-card)',border:'1px solid var(--border-color)',
                        borderRadius:'var(--radius-md)',padding:6,minWidth:180,
                        boxShadow:'var(--shadow-lg)',animation:'fadeIn 0.15s ease'
                      }}>
                        {[
                          { icon:<Copy size={13}/>, label:'Duplicate', action:()=>duplicateRider(r) },
                          { icon:<Edit size={13}/>, label:'Edit', action:()=>setContextMenu(null) },
                          { icon:<Pencil size={13}/>, label:'Rename', action:()=>{setShowRename(r);setRenameVal(r.renamedTo||'');setContextMenu(null);} },
                        ].map((item,i)=>(
                          <div key={i} style={ctxStyle} onClick={item.action}>{item.icon} {item.label}</div>
                        ))}
                        <div style={{...ctxStyle,color:'var(--neon-red)',borderTop:'1px solid var(--border-color)',marginTop:4,paddingTop:8}}
                          onClick={()=>softDelete(r.id)}>
                          <Trash2 size={13}/> Move to Recycle Bin
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="8" className="table-empty">No riders found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ctxStyle = {
  display:'flex',alignItems:'center',gap:8,padding:'8px 12px',
  borderRadius:6,cursor:'pointer',fontSize:'0.82rem',fontWeight:500,
  color:'var(--text-muted)',transition:'background 0.15s',
};
