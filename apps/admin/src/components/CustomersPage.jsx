import React, { useState } from 'react';
import { UserCog, Star, Eye, X, Gift, ShoppingCart } from 'lucide-react';

const CUSTOMERS = [
  { id:'1', name:'Fatima Ahmed', email:'fatima@email.com', phone:'+92 300 1111111', orders:14, spent:890, loyalty:420, lastOrder:'2026-04-05', segment:'VIP', rating: 4.8 },
  { id:'2', name:'Omar Khan', email:'omar@email.com', phone:'+92 312 2222222', orders:7, spent:340, loyalty:170, lastOrder:'2026-04-04', segment:'Regular', rating: 3.5 },
  { id:'3', name:'Aisha Malik', email:'aisha@email.com', phone:'+92 333 3333333', orders:2, spent:68, loyalty:34, lastOrder:'2026-04-01', segment:'New', rating: 5.0 },
  { id:'4', name:'Bilal Hussain', email:'bilal@email.com', phone:'+92 345 4444444', orders:25, spent:1840, loyalty:920, lastOrder:'2026-04-05', segment:'VIP', rating: 4.9 },
];

const REVIEWS = [
  { id: '1', customer: 'Fatima Ahmed', vendor: 'Pizza Palace', rating: 5, comment: 'Best pizza in town! Delivery was faster than expected.', date: '2026-04-05' },
  { id: '2', customer: 'Omar Khan', vendor: 'Burger Galaxy', rating: 3, comment: 'Food was a bit cold by the time it arrived.', date: '2026-04-04' },
  { id: '3', customer: 'Aisha Malik', vendor: 'Fresh Foods Co', rating: 5, comment: 'Very fresh ingredients, loved the salad.', date: '2026-04-01' },
];

const SEG_COLOR = { VIP:'badge-purple', Regular:'badge-cyan', New:'badge-lime' };

export default function CustomersPage() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('customers'); // customers | reviews

  const filtered = CUSTOMERS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.name}</div>
              <button className="btn-icon" onClick={()=>setSelected(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2" style={{gap:12}}>
                <div className="glass-card"><div className="text-xs text-muted">Email</div><div className="font-bold text-sm">{selected.email}</div></div>
                <div className="glass-card"><div className="text-xs text-muted">Phone</div><div className="font-bold">{selected.phone}</div></div>
                <div className="glass-card"><div className="text-xs text-muted">Total Orders</div><div className="font-bold"><ShoppingCart size={13} style={{marginRight:4}}/>  {selected.orders}</div></div>
                <div className="glass-card"><div className="text-xs text-muted">Total Spent</div><div className="font-bold text-accent">${selected.spent}</div></div>
                <div className="glass-card"><div className="text-xs text-muted">Loyalty Points</div><div className="font-bold"><Gift size={13} style={{marginRight:4}}/>{selected.loyalty} pts</div></div>
                <div className="glass-card"><div className="text-xs text-muted">Segment</div><span className={`badge ${SEG_COLOR[selected.segment]}`}>{selected.segment}</span></div>
              </div>
              <div className="wallet-card" style={{background:'linear-gradient(135deg,#8b5cf6,#7c3aed)'}}>
                <div className="wallet-label">💎 Loyalty Points</div>
                <div className="wallet-balance">{selected.loyalty}</div>
                <div style={{fontSize:'0.8rem',opacity:0.7,marginTop:4}}>Redeemable at any outlet · 1 pt = $0.01</div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={()=>setSelected(null)}>Close</button>
                <button className="btn btn-primary"><Gift size={14}/>Award Points</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title"><UserCog size={20}/>Customer Management</div>
        <div className="flex gap-8">
          <button className={`btn btn-sm ${activeTab === 'customers' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('customers')}>
            Customers Data
          </button>
          <button className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('reviews')}>
            Feedbacks & Reviews
          </button>
        </div>
      </div>

      {activeTab === 'customers' ? (
        <>
          <div className="stat-grid mb-20">
            <div className="stat-card purple"><div className="stat-value">{CUSTOMERS.filter(c=>c.segment==='VIP').length}</div><div className="stat-label">VIP Customers</div></div>
            <div className="stat-card cyan"><div className="stat-value">{CUSTOMERS.length}</div><div className="stat-label">Total Customers</div></div>
            <div className="stat-card green"><div className="stat-value">${CUSTOMERS.reduce((s,c)=>s+c.spent,0).toLocaleString()}</div><div className="stat-label">Total Lifetime Value</div></div>
            <div className="stat-card orange"><div className="stat-value">{CUSTOMERS.reduce((s,c)=>s+c.loyalty,0).toLocaleString()}</div><div className="stat-label">Loyalty Points Issued</div></div>
          </div>

          <div className="filter-bar">
            <input className="filter-input" placeholder="Search name or email…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>

          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Loyalty</th><th>Avg Rating</th><th>Segment</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id}>
                    <td style={{fontWeight:700}}>{c.name}</td>
                    <td className="text-muted text-sm">{c.email}</td>
                    <td>{c.orders}</td>
                    <td style={{fontWeight:700}}>${c.spent}</td>
                    <td><span style={{color:'var(--neon-purple)',fontWeight:700}}>💎 {c.loyalty} pts</span></td>
                    <td>
                      <div className="flex items-center gap-4">
                        <Star size={13} fill="var(--neon-yellow)" color="var(--neon-yellow)"/>
                        <span style={{fontWeight:700}}>{c.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${SEG_COLOR[c.segment]}`}>{c.segment}</span></td>
                    <td><button className="btn-icon" onClick={()=>setSelected(c)}><Eye size={13}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid-2">
          {REVIEWS.map(r => (
            <div key={r.id} className="glass-card">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div style={{fontWeight: 800, fontSize: '1.1rem'}}>{r.customer}</div>
                  <div className="text-xs text-muted mt-2">Purchased from <b>{r.vendor}</b> • {r.date}</div>
                </div>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} color={i < r.rating ? 'var(--neon-yellow)' : 'var(--border-color)'} fill={i < r.rating ? 'var(--neon-yellow)' : 'none'}/>
                  ))}
                </div>
              </div>
              <div style={{
                background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)', fontStyle: 'italic', borderLeft: '3px solid var(--accent-light)'
              }}>
                "{r.comment}"
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
