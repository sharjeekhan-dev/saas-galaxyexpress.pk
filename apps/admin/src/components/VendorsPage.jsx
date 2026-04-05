import React, { useState } from 'react';
import { Store, Plus, Eye, Edit, Check, X, Shield, DollarSign, Star } from 'lucide-react';
import { API, headers } from '../App.jsx';

const VENDOR_TYPES = [
  { key:'SUPER', label:'Super Vendor', desc:'Full platform access — can manage inventory, orders, riders', color:'purple' },
  { key:'ERP',   label:'ERP Vendor',   desc:'ERP only — inventory, accounting, financial reports', color:'cyan' },
  { key:'B2B',   label:'B2B Vendor',   desc:'Bulk selling — supply to other vendors, no restrictions', color:'lime' },
];

const MOCK_VENDORS = [
  { id:'1', businessName:'Pizza Palace', owner:'Ali Khan', type:'SUPER', products:24, orders:156, commission:'10%', isVerified:true, commissionEarned:4820 },
  { id:'2', businessName:'Burger Galaxy', owner:'Sara Ahmed', type:'ERP', products:18, orders:89, commission:'12%', isVerified:false, commissionEarned:2100 },
  { id:'3', businessName:'Fresh Foods Co', owner:'Omar Sheikh', type:'B2B', products:200, orders:45, commission:'8%', isVerified:true, commissionEarned:7300 },
];

export default function VendorsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('all');

  const totalCommission = MOCK_VENDORS.reduce((s,v)=>s+v.commissionEarned,0);

  return (
    <div className="fade-in">
      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-card modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.businessName}</div>
              <button className="btn-icon" onClick={()=>setSelected(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="glass-card"><div className="text-muted text-xs mb-8">Owner</div><div className="font-bold">{selected.owner}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Vendor Type</div>
                  <div><span className={`badge badge-${selected.type==='SUPER'?'purple':selected.type==='ERP'?'cyan':'lime'}`}>{selected.type} Vendor</span></div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Commission Rate</div><div className="font-bold">{selected.commission}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Commission Earned</div><div className="font-bold text-accent">${selected.commissionEarned.toLocaleString()}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Total Products</div><div className="font-bold">{selected.products}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Total Orders</div><div className="font-bold">{selected.orders}</div></div>
              </div>
              <div className="flex gap-10">
                <div style={{flex:1,background:'rgba(141,224,44,0.08)',border:'1px solid var(--accent-border)',borderRadius:12,padding:14}}>
                  <div className="text-xs text-muted mb-4">FULL ACCOUNT</div>
                  <div className="font-bold text-sm">Complete platform access</div>
                  <div className="text-xs text-muted mt-4">Orders, inventory, reports, riders</div>
                </div>
                <div style={{flex:1,background:'rgba(14,165,233,0.08)',border:'1px solid rgba(14,165,233,0.2)',borderRadius:12,padding:14}}>
                  <div className="text-xs text-muted mb-4">LIMITED ACCOUNT</div>
                  <div className="font-bold text-sm">Purchase & inventory only</div>
                  <div className="text-xs text-muted mt-4">For admin purchasing use</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={()=>setSelected(null)}>Close</button>
                <button className="btn btn-primary"><Check size={14}/>Approve Vendor</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Vendor</div>
              <button className="btn-icon" onClick={()=>setShowModal(false)}><X size={16}/></button>
            </div>
            <form className="modal-body" onSubmit={e=>e.preventDefault()}>
              <div className="form-group"><label>Business Name</label><input className="form-input" required /></div>
              <div className="grid-2">
                <div className="form-group"><label>Owner Name</label><input className="form-input" required /></div>
                <div className="form-group"><label>Contact Phone</label><input className="form-input" type="tel" /></div>
              </div>
              <div className="form-group"><label>Email</label><input className="form-input" type="email" required /></div>
              <div className="form-group"><label>Vendor Type</label>
                <select className="form-input">
                  {VENDOR_TYPES.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Commission Rate (%)</label><input className="form-input" type="number" defaultValue="10" min="0" max="50" /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title"><Store size={20}/>Vendor Management</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}><Plus size={14}/>Add Vendor</button>
      </div>

      {/* Vendor Type Cards */}
      <div className="grid-3 mb-20">
        {VENDOR_TYPES.map(t=>(
          <div key={t.key} className="glass-card" style={{cursor:'pointer'}} onClick={()=>setTab(t.key.toLowerCase())}>
            <div className="flex items-center gap-10 mb-8">
              <Shield size={18} color={t.color==='purple'?'var(--neon-purple)':t.color==='cyan'?'var(--neon-cyan)':'var(--accent)'} />
              <span className={`badge badge-${t.color}`}>{t.label}</span>
            </div>
            <div className="text-sm text-muted">{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="stat-grid mb-20">
        <div className="stat-card green"><div className="stat-value">{MOCK_VENDORS.filter(v=>v.isVerified).length}</div><div className="stat-label">Verified Vendors</div></div>
        <div className="stat-card orange"><div className="stat-value">{MOCK_VENDORS.filter(v=>!v.isVerified).length}</div><div className="stat-label">Pending Verification</div></div>
        <div className="stat-card purple"><div className="stat-value">${totalCommission.toLocaleString()}</div><div className="stat-label">Total Commission</div></div>
        <div className="stat-card cyan"><div className="stat-value">{MOCK_VENDORS.reduce((s,v)=>s+v.orders,0)}</div><div className="stat-label">Total Orders Processed</div></div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Business</th><th>Owner</th><th>Type</th><th>Products</th><th>Orders</th><th>Commission Earned</th><th>Verification</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {MOCK_VENDORS.map(v=>(
              <tr key={v.id}>
                <td style={{fontWeight:700}}>{v.businessName}</td>
                <td>{v.owner}</td>
                <td><span className={`badge badge-${v.type==='SUPER'?'purple':v.type==='ERP'?'cyan':'lime'}`}>{v.type}</span></td>
                <td>{v.products}</td>
                <td>{v.orders}</td>
                <td style={{fontWeight:700,color:'var(--accent-dark)'}}>${v.commissionEarned.toLocaleString()}</td>
                <td><span className={`badge ${v.isVerified?'badge-success':'badge-warning'}`}>{v.isVerified?'Verified':'Pending'}</span></td>
                <td>
                  <div className="flex gap-4">
                    <button className="btn-icon" title="View" onClick={()=>setSelected(v)}><Eye size={13}/></button>
                    {!v.isVerified && <button className="btn-icon" title="Approve"><Check size={13}/></button>}
                    <button className="btn-icon" title="Edit"><Edit size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
