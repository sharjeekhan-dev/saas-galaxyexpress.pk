import React, { useState } from 'react';
import { 
  Building, Plus, Edit, XCircle, X, Check, Shield, 
  ToggleLeft, ToggleRight, Calendar, Package, Users, Store, Laptop, BarChart3, Receipt
} from 'lucide-react';
import { API } from '../App.jsx';

const PLAN_COLOR = { BASIC: 'badge-default', PRO: 'badge-cyan', ENTERPRISE: 'badge-purple' };

export default function TenantsPage({ tenants, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const saveTenant = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = {
      name: f.get('name'),
      subdomain: f.get('subdomain'),
      plan: f.get('plan'),
      billingExpiry: f.get('billingExpiry'),
      isActive: f.get('isActive') === 'on',
      featureToggles: {
        pos: f.get('toggle_pos') === 'on',
        inventory: f.get('toggle_inventory') === 'on',
        accounting: f.get('toggle_accounting') === 'on',
        reports: f.get('toggle_reports') === 'on',
        staff: f.get('toggle_staff') === 'on',
      },
      limits: {
        maxOutlets: parseInt(f.get('limit_outlets')),
        maxUsers: parseInt(f.get('limit_users')),
        maxProducts: parseInt(f.get('limit_products')),
      }
    };

    try {
      const url = editingTenant ? `${API}/api/tenant/${editingTenant.id}` : `${API}/api/tenant`;
      const res = await fetch(url, {
        method: editingTenant ? 'PUT' : 'POST',
        headers: headers(),
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingTenant(null);
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Operation failed');
      }
    } catch (err) { 
      alert('Network error'); 
    }
  };

  const suspend = async (id) => {
    if (!confirm('Suspend this tenant and block all access?')) return;
    try { 
      await fetch(`${API}/api/tenant/${id}/suspend`, {
        method: 'PUT',
        headers: headers()
      });
      onRefresh();
    } catch (err) { alert('Suspension failed'); }
  };

  return (
    <div className="fade-in">
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingTenant(null); }}>
          <div className="modal-card" style={{ width: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingTenant ? `Configure SaaS: ${editingTenant.name}` : 'Onboard New Tenant'}</div>
              <button className="btn-icon" onClick={() => { setShowModal(false); setEditingTenant(null); }}><X size={16} /></button>
            </div>
            <form onSubmit={saveTenant} className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="form-left">
                <h4 style={{ marginBottom: 16 }}>Core Profile</h4>
                <div className="form-group"><label>Business Registration Name</label><input name="name" defaultValue={editingTenant?.name} className="form-input" required /></div>
                <div className="form-group"><label>Assigned Subdomain</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input name="subdomain" defaultValue={editingTenant?.subdomain} className="form-input" style={{ flex: 1 }} required />
                    <span className="text-muted text-sm" style={{ fontWeight: 800 }}>.galaxy.pk</span>
                  </div>
                </div>
                <div className="form-group"><label>Subscription Architecture</label>
                  <select name="plan" defaultValue={editingTenant?.plan || 'BASIC'} className="form-input">
                    <option value="BASIC">BASIC (SME)</option>
                    <option value="PRO">PRO (Enterprise Growth)</option>
                    <option value="ENTERPRISE">UNLIMITED (Custom)</option>
                  </select>
                </div>
                <div className="form-group"><label>SaaS Expiry Date</label>
                  <input name="billingExpiry" type="date" defaultValue={editingTenant?.billingExpiry?.split('T')[0]} className="form-input" />
                </div>
                <div style={{ marginTop: 20 }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700 }}>
                     <input type="checkbox" name="isActive" defaultChecked={editingTenant ? editingTenant.isActive : true} /> Enable Access
                   </label>
                </div>
              </div>

              <div className="form-right" style={{ background: 'var(--bg-input)', padding: 20, borderRadius: 16 }}>
                <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={16} color="#39FF14"/> Feature Control Panel</h4>
                
                <div className="toggle-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { id: 'pos', label: 'POS Terminal Access', icon: Receipt },
                    { id: 'inventory', label: 'Inventory (B2B) ERP', icon: Package },
                    { id: 'accounting', label: 'Financial Accounting Hub', icon: BarChart3 },
                    { id: 'reports', label: 'Business Analytics', icon: BarChart3 },
                    { id: 'staff', label: 'HR / Staff Management', icon: Users },
                  ].map(ft => (
                    <label key={ft.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}><ft.icon size={14}/> {ft.label}</div>
                      <input type="checkbox" name={`toggle_${ft.id}`} defaultChecked={editingTenant?.featureToggles?.[ft.id]} />
                    </label>
                  ))}
                </div>

                <h4 style={{ marginTop: 30, marginBottom: 16 }}>Resource Quotas</h4>
                <div className="quota-grid" style={{ display: 'grid', gap: 10 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <Store size={14} className="text-muted"/> <label style={{ flex: 1, fontSize: '0.8rem' }}>Max Outlets</label>
                     <input name="limit_outlets" type="number" defaultValue={editingTenant?.limits?.maxOutlets || 1} className="form-input" style={{ width: 80 }} />
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <Users size={14} className="text-muted"/> <label style={{ flex: 1, fontSize: '0.8rem' }}>Max Staff/Users</label>
                     <input name="limit_users" type="number" defaultValue={editingTenant?.limits?.maxUsers || 5} className="form-input" style={{ width: 80 }} />
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                     <Package size={14} className="text-muted"/> <label style={{ flex: 1, fontSize: '0.8rem' }}>Max Items/SKUs</label>
                     <input name="limit_products" type="number" defaultValue={editingTenant?.limits?.maxProducts || 100} className="form-input" style={{ width: 80 }} />
                   </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setEditingTenant(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary"><Check size={14} /> PERSIST SAAS CONFIGURATION</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title"><Building size={20} />SaaS Tenant Infrastructure</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={14} />New Merchant</button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Business Infrastructure</th>
              <th>Subscription Architecture</th>
              <th>Feature Mesh</th>
              <th>Status</th>
              <th>Infrastructure Health</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length ? tenants.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>{t.name}</div>
                  <div className="text-muted text-xs">{t.subdomain}.galaxy.pk</div>
                </td>
                <td>
                  <span className={`badge ${PLAN_COLOR[t.plan] || 'badge-default'}`} style={{ padding: '4px 10px', fontSize: '0.7rem' }}>{t.plan}</span>
                  <div className="text-xs" style={{ marginTop: 4, color: 'var(--text-muted)' }}>Expiry: {t.billingExpiry ? new Date(t.billingExpiry).toLocaleDateString() : 'N/A'}</div>
                </td>
                <td>
                   <div style={{ display: 'flex', gap: 4 }}>
                     {t.featureToggles?.pos && <div title="POS Active" style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(57,255,20,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Receipt size={10} color="#39FF14"/></div>}
                     {t.featureToggles?.inventory && <div title="Inventory Active" style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(57,255,20,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={10} color="#39FF14"/></div>}
                     {t.featureToggles?.accounting && <div title="Accounting Active" style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(57,255,20,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart3 size={10} color="#39FF14"/></div>}
                   </div>
                </td>
                <td>
                  <span className={`badge ${t.isActive ? 'badge-success' : 'badge-danger'}`} style={{ borderRadius: 6, opacity: 0.9 }}>{t.isActive ? 'OPERATIONAL' : 'SUSPENDED'}</span>
                </td>
                <td>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SKUs: {t.limits?.maxProducts || 50}</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nodes: {t.limits?.maxOutlets || 1}</div>
                </td>
                <td>
                  <div className="flex gap-4">
                    <button className="btn-icon" style={{ background: 'var(--bg-input)' }} title="SAAS Config" onClick={() => { setEditingTenant(t); setShowModal(true); }}><Edit size={14} /></button>
                    <button className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} title="Emergency Suspend" onClick={() => suspend(t.id)}><XCircle size={14} /></button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="6" className="table-empty">No infrastructure nodes connected.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
