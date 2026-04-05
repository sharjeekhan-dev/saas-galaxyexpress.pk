import React, { useState } from 'react';
import { Briefcase, Plus, Check, X, Clock, Package, ArrowRight, Building, ChevronRight } from 'lucide-react';

const B2B_ORDERS = [
  { id:'B2B-001', company:'Metro Stores Ltd', items:12, quantity:500, total:8200, status:'PENDING_APPROVAL', vendor:'Fresh Foods Co', date:'2026-04-05' },
  { id:'B2B-002', company:'Star Mart Chain', items:5, quantity:200, total:3400, status:'APPROVED', vendor:'Pizza Palace', date:'2026-04-04' },
  { id:'B2B-003', company:'Galaxy Hypermart', items:20, quantity:1000, total:15600, status:'DELIVERED', vendor:'Fresh Foods Co', date:'2026-04-03' },
];

const VENDORS_B2B = [
  { name:'Fresh Foods Co', moq:100, items:200, priceRange:'$8–$24', rating:4.8 },
  { name:'Pizza Palace', moq:50, items:24, priceRange:'$5–$18', rating:4.6 },
  { name:'Burger Galaxy', moq:50, items:18, priceRange:'$4–$15', rating:4.5 },
];

const STATUS_COLOR = {
  PENDING_APPROVAL:'badge-warning', APPROVED:'badge-info',
  IN_TRANSIT:'badge-cyan', DELIVERED:'badge-success', REJECTED:'badge-danger'
};

const WORKFLOW = ['Vendor Proposal','Head Review','Auto Approved','Order Executed'];

export default function B2BPage() {
  const [tab, setTab] = useState('orders');
  const [showNew, setShowNew] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const approve = (id) => alert(`Order ${id} approved — moving to fulfillment`);
  const reject  = (id) => alert(`Order ${id} rejected`);

  return (
    <div className="fade-in">
      {showNew && (
        <div className="modal-overlay" onClick={()=>setShowNew(false)}>
          <div className="modal-card modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New B2B Order Request</div>
              <button className="btn-icon" onClick={()=>setShowNew(false)}><X size={16}/></button>
            </div>
            <form className="modal-body" onSubmit={e=>e.preventDefault()}>
              <div className="form-group"><label>Company Name</label><input className="form-input" required /></div>
              <div className="grid-2">
                <div className="form-group"><label>Contact Person</label><input className="form-input" required /></div>
                <div className="form-group"><label>Contact Phone</label><input className="form-input" type="tel" /></div>
              </div>
              <div className="form-group"><label>Select Vendor Supplier</label>
                <select className="form-input">{VENDORS_B2B.map(v=><option key={v.name}>{v.name}</option>)}</select>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Total Quantity</label><input className="form-input" type="number" min="1" /></div>
                <div className="form-group"><label>Required By</label><input className="form-input" type="date" /></div>
              </div>
              <div className="form-group"><label>Special Requirements</label><textarea className="form-input" rows="3" /></div>
              <div style={{
                background:'rgba(141,224,44,0.08)',border:'1px solid var(--accent-border)',
                borderRadius:10,padding:14
              }}>
                <div className="text-sm font-bold mb-8">Approval Workflow</div>
                <div className="flex items-center gap-8">
                  {WORKFLOW.map((step,i)=>(
                    <React.Fragment key={i}>
                      <div className="text-xs" style={{
                        background: i===0?'var(--accent)':'var(--bg-input)',
                        color: i===0?'#000':'var(--text-muted)',
                        padding:'4px 10px',borderRadius:6,fontWeight:600,whiteSpace:'nowrap'
                      }}>{step}</div>
                      {i<WORKFLOW.length-1&&<ChevronRight size={14} color="var(--text-muted)"/>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowNew(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title"><Briefcase size={20}/>B2B Enterprise Portal</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowNew(true)}><Plus size={14}/>New B2B Order</button>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-20">
        <div className="stat-card purple"><div className="stat-value">{B2B_ORDERS.length}</div><div className="stat-label">B2B Orders</div></div>
        <div className="stat-card orange"><div className="stat-value">{B2B_ORDERS.filter(o=>o.status==='PENDING_APPROVAL').length}</div><div className="stat-label">Pending Approval</div></div>
        <div className="stat-card green"><div className="stat-value">${B2B_ORDERS.reduce((s,o)=>s+o.total,0).toLocaleString()}</div><div className="stat-label">Total B2B Revenue</div></div>
        <div className="stat-card cyan"><div className="stat-value">{VENDORS_B2B.length}</div><div className="stat-label">Active B2B Suppliers</div></div>
      </div>

      <div className="tabs mb-20">
        <button className={`tab ${tab==='orders'?'active':''}`} onClick={()=>setTab('orders')}>
          Orders {B2B_ORDERS.filter(o=>o.status==='PENDING_APPROVAL').length>0&&
            <span className="nav-badge">{B2B_ORDERS.filter(o=>o.status==='PENDING_APPROVAL').length}</span>}
        </button>
        <button className={`tab ${tab==='vendors'?'active':''}`} onClick={()=>setTab('vendors')}>Vendor Comparison</button>
        <button className={`tab ${tab==='workflow'?'active':''}`} onClick={()=>setTab('workflow')}>Approval Workflow</button>
      </div>

      {tab==='orders' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Company</th><th>Vendor Supplier</th><th>Items</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {B2B_ORDERS.map(o=>(
                <tr key={o.id}>
                  <td style={{fontWeight:700,fontFamily:'monospace'}}>{o.id}</td>
                  <td style={{fontWeight:600}}><Building size={13} style={{marginRight:5}}/>{o.company}</td>
                  <td>{o.vendor}</td>
                  <td>{o.items} SKUs</td>
                  <td style={{fontWeight:700}}>{o.quantity.toLocaleString()} units</td>
                  <td style={{fontWeight:700}}>${o.total.toLocaleString()}</td>
                  <td><span className={`badge ${STATUS_COLOR[o.status]||'badge-default'}`}>{o.status.replace('_',' ')}</span></td>
                  <td className="text-muted text-sm">{o.date}</td>
                  <td>
                    <div className="flex gap-4">
                      {o.status==='PENDING_APPROVAL' && <>
                        <button className="btn btn-sm btn-green" onClick={()=>approve(o.id)}><Check size={13}/>Approve</button>
                        <button className="btn btn-sm btn-red" onClick={()=>reject(o.id)}><X size={13}/>Reject</button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='vendors' && (
        <div className="grid-auto">
          {VENDORS_B2B.map(v=>(
            <div key={v.name}
              className={`b2b-vendor-card ${selectedVendor===v.name?'selected':''}`}
              onClick={()=>setSelectedVendor(v.name===selectedVendor?null:v.name)}
            >
              <div className="flex justify-between items-center mb-12">
                <div style={{fontWeight:700,fontSize:'1rem'}}>{v.name}</div>
                <span className="badge badge-lime">B2B Supplier</span>
              </div>
              <div className="grid-2" style={{gap:8}}>
                <div><div className="text-xs text-muted">Min Order Qty</div><div className="font-bold">{v.moq} units</div></div>
                <div><div className="text-xs text-muted">Active SKUs</div><div className="font-bold">{v.items}</div></div>
                <div><div className="text-xs text-muted">Price Range</div><div className="font-bold">{v.priceRange}</div></div>
                <div><div className="text-xs text-muted">Rating</div><div className="font-bold">⭐ {v.rating}</div></div>
              </div>
              {selectedVendor===v.name && (
                <button className="btn btn-primary w-full mt-16" style={{justifyContent:'center'}}>
                  <Plus size={14}/>Place Order with {v.name}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==='workflow' && (
        <div className="glass-card">
          <div className="card-title mb-20">Approval Workflow Configuration</div>
          {WORKFLOW.map((step, i) => (
            <div key={i} style={{
              display:'flex',alignItems:'center',gap:16,
              padding:'16px 20px',
              background: i===0?'var(--accent-bg)':'transparent',
              borderRadius:10,marginBottom:8,
              border:'1px solid var(--border-color)'
            }}>
              <div style={{
                width:32,height:32,borderRadius:'50%',
                background:'var(--gradient-primary)',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontWeight:800,color:'#000',flexShrink:0
              }}>{i+1}</div>
              <div>
                <div style={{fontWeight:700}}>{step}</div>
                <div className="text-xs text-muted">
                  {['Vendor submits bulk order request with quantities & pricing',
                    'Branch head or manager reviews and can approve/reject',
                    'System auto-approves if within configured limits',
                    'Order is placed with supplier and tracked to delivery'][i]}
                </div>
              </div>
              {i < WORKFLOW.length-1 && <ArrowRight size={18} color="var(--text-muted)" style={{marginLeft:'auto'}}/>}
              {i === WORKFLOW.length-1 && <Check size={18} color="var(--neon-green)" style={{marginLeft:'auto'}}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
