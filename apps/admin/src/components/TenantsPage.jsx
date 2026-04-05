import React, { useState } from 'react';
import { API, headers } from '../App.jsx';
import { Building, Plus, Edit, XCircle, X, Check } from 'lucide-react';

const PLAN_COLOR = { BASIC:'badge-default', PRO:'badge-cyan', ENTERPRISE:'badge-purple' };

export default function TenantsPage({ tenants, onRefresh }) {
  const [showModal, setShowModal] = useState(false);

  const createTenant = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      await fetch(`${API}/api/tenant`, {
        method:'POST', headers:headers(),
        body:JSON.stringify({ name:f.get('name'), subdomain:f.get('subdomain'), plan:f.get('plan') })
      });
      setShowModal(false); onRefresh();
    } catch {}
  };

  const suspend = async (id) => {
    if (!confirm('Suspend this tenant?')) return;
    try { await fetch(`${API}/api/tenant/${id}`, { method:'DELETE', headers:headers() }); onRefresh(); } catch {}
  };

  return (
    <div className="fade-in">
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Tenant</div>
              <button className="btn-icon" onClick={()=>setShowModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={createTenant} className="modal-body">
              <div className="form-group"><label>Business Name</label><input name="name" className="form-input" required /></div>
              <div className="form-group"><label>Subdomain</label>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <input name="subdomain" className="form-input" style={{flex:1}} required />
                  <span className="text-muted text-sm">.galaxyexpress.pk</span>
                </div>
              </div>
              <div className="form-group"><label>Subscription Plan</label>
                <select name="plan" className="form-input">
                  <option value="BASIC">Basic — $29/mo</option>
                  <option value="PRO">Pro — $79/mo</option>
                  <option value="ENTERPRISE">Enterprise — $199/mo</option>
                </select>
              </div>
              <div style={{background:'var(--bg-input)',borderRadius:10,padding:14,border:'1px solid var(--border-color)'}}>
                <div className="text-xs font-bold mb-8 text-muted">Plan Includes:</div>
                <div className="text-sm">POS · KDS · Inventory · Orders · Reports · Multi-Branch</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Check size={14}/>Create Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title"><Building size={20}/>Tenant Management</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}><Plus size={14}/>New Tenant</button>
      </div>

      <div className="stat-grid mb-20">
        <div className="stat-card green"><div className="stat-value">{tenants.filter(t=>t.isActive).length}</div><div className="stat-label">Active Tenants</div></div>
        <div className="stat-card cyan"><div className="stat-value">{tenants.filter(t=>t.plan==='PRO').length}</div><div className="stat-label">Pro Plan</div></div>
        <div className="stat-card purple"><div className="stat-value">{tenants.filter(t=>t.plan==='ENTERPRISE').length}</div><div className="stat-label">Enterprise</div></div>
        <div className="stat-card orange"><div className="stat-value">{tenants.filter(t=>!t.isActive).length}</div><div className="stat-label">Suspended</div></div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Business</th><th>Subdomain</th><th>Plan</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {tenants.length ? tenants.map(t=>(
              <tr key={t.id}>
                <td style={{fontWeight:700}}>{t.name}</td>
                <td className="text-muted text-sm">{t.subdomain}.galaxyexpress.pk</td>
                <td><span className={`badge ${PLAN_COLOR[t.plan]||'badge-default'}`}>{t.plan}</span></td>
                <td><span className={`badge ${t.isActive?'badge-success':'badge-danger'}`}>{t.isActive?'Active':'Suspended'}</span></td>
                <td className="text-muted text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-4">
                    <button className="btn-icon" title="Edit"><Edit size={13}/></button>
                    <button className="btn-icon" title="Suspend" onClick={()=>suspend(t.id)}><XCircle size={13}/></button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="6" className="table-empty">No tenants yet — create your first one above</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
