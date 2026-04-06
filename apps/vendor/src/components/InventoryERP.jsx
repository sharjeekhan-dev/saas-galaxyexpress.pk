import React, { useState, useEffect } from 'react';
import { Layers, Package, ShoppingCart, Truck, RefreshCw, BarChart3, Plus, Printer, CheckCircle, Clock, X, Save, Search, Factory, ShieldCheck, AlertTriangle } from 'lucide-react';
import { API } from '../App.jsx';

export default function InventoryERP({ vendor, theme }) {
  const [subTab, setSubTab] = useState('stock');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ stock: [], invoices: [], issuances: [], logs: [], products: [], outlets: [], departments: [] });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('invoice'); // invoice, issuance, receiving
  const [formData, setFormData] = useState({ storeId: '', vendorId: vendor.id, departmentId: '', notes: '', lines: [{ productId: '', quantity: 1, rate: 0 }] });

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('erp_token')}`
  });

  const fetchData = async () => {
    setLoading(true);
    const h = getHeaders();
    try {
      const [s, i, iss, l, p, o, d] = await Promise.all([
        fetch(`${API}/api/inventory/stock`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/inventory/purchase-invoices`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/inventory/issuances`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/inventory/audit-logs`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/products?tenantId=${vendor.tenantId || ''}`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/outlets`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/hr/departments`, { headers: h }).then(r => r.json())
      ]);
      setData({
        stock: Array.isArray(s) ? s : [],
        invoices: Array.isArray(i) ? i : [],
        issuances: Array.isArray(iss) ? iss : [],
        logs: Array.isArray(l) ? l : [],
        products: Array.isArray(p) ? (p.products || p) : [],
        outlets: Array.isArray(o) ? o : [],
        departments: Array.isArray(d) ? d : []
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [vendor]);

  const addLine = () => setFormData({ ...formData, lines: [...formData.lines, { productId: '', quantity: 1, rate: 0 }] });
  const removeLine = (idx) => setFormData({ ...formData, lines: formData.lines.filter((_, i) => i !== idx) });
  const updateLine = (idx, key, val) => {
    const nl = [...formData.lines];
    nl[idx][key] = val;
    setFormData({ ...formData, lines: nl });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = modalType === 'invoice' ? 'purchase-invoices' : 'issuances';
    try {
      const res = await fetch(`${API}/api/inventory/${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Check your stock levels');
      }
    } catch (e) { alert('API Error'); }
  };

  const approve = async (type, id) => {
    const endpoint = type === 'invoice' ? `purchase-invoices/${id}/approve` : `issuances/${id}/approve`;
    try {
      const res = await fetch(`${API}/api/inventory/${endpoint}`, { method: 'PATCH', headers: getHeaders() });
      if (res.ok) fetchData();
      else alert('Approval failed - Check stock constraints');
    } catch (e) { console.error(e); }
  };

  const t = (id) => subTab === id;

  const cardStyle = { background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24, marginBottom: 20 };
  const tabSty = (active) => ({ padding: '10px 20px', borderRadius: 12, border: 'none', background: active ? '#8de02c' : 'rgba(0,0,0,0.2)', color: active ? '#000' : theme.text, cursor: 'pointer', fontWeight: 700, transition: '0.3s' });

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: theme.text }}>Inventory & Pipeline Control</h2>
          <span style={{ fontSize: '0.85rem', color: theme.muted }}>Official Stock Flow: Vendor &gt; Store &gt; Departments</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { setModalType('invoice'); setFormData({ storeId: '', vendorId: vendor.id, departmentId: '', notes: '', lines: [{ productId: '', quantity: 1, rate: 0 }] }); setShowModal(true); }} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={18} /> New Purchase
          </button>
          <button onClick={() => { setModalType('issuance'); setFormData({ storeId: '', vendorId: vendor.id, departmentId: '', notes: '', lines: [{ productId: '', quantity: 1, rate: 0 }] }); setShowModal(true); }} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Truck size={18} /> Stock Issuance
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        <button style={tabSty(t('stock'))} onClick={() => setSubTab('stock')}><Package size={16} /> Live Stock Ledger</button>
        <button style={tabSty(t('purchase'))} onClick={() => setSubTab('purchase')}><ShoppingCart size={16} /> Purchase Invoices</button>
        <button style={tabSty(t('issuance'))} onClick={() => setSubTab('issuance')}><Truck size={16} /> Issuances</button>
        <button style={tabSty(t('logs'))} onClick={() => setSubTab('logs')}><BarChart3 size={16} /> Audit Trail</button>
      </div>

      {subTab === 'stock' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Real-time Stock Levels</h3>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 10, top: 10, color: theme.muted }} />
              <input type="text" placeholder="Search product..." style={{ padding: '8px 12px 8px 36px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} />
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.1)', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>Product</th>
                <th style={{ padding: 12 }}>Location</th>
                <th style={{ padding: 12 }}>Qty</th>
                <th style={{ padding: 12 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.stock.map(s => (
                <tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 800 }}>{s.product?.name}</div>
                    <div style={{ fontSize: '0.7rem', color: theme.muted }}>SKU: {s.product?.sku}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: s.outletId ? 'rgba(57,255,20,0.1)' : 'rgba(59,130,246,0.1)', color: s.outletId ? '#8de02c' : '#3b82f6' }}>
                      {s.outletId ? `STORE: ${s.outlet?.name}` : `DEPT: ${s.department?.name}`}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontWeight: 900, fontSize: '1.2rem', color: s.quantity < 5 ? '#ef4444' : theme.text }}>{s.quantity}</td>
                  <td style={{ padding: 12 }}>
                    {s.quantity > 0 ? <CheckCircle size={16} color="#10b981" /> : <AlertTriangle size={16} color="#ef4444" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.stock.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: theme.muted }}>No real stock entries found. Add a Purchase Invoice to begin.</div>}
        </div>
      )}

      {subTab === 'purchase' && (
        <div style={cardStyle}>
          <h3>Active Purchase List</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.1)', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>Invoice #</th>
                <th style={{ padding: 12 }}>Store / Outlet</th>
                <th style={{ padding: 12 }}>Total</th>
                <th style={{ padding: 12 }}>Status</th>
                <th style={{ padding: 12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 800 }}>{inv.invoiceNumber}</div>
                    <div style={{ fontSize: '0.7rem', color: theme.muted }}>{new Date(inv.createdAt).toLocaleString()}</div>
                  </td>
                  <td style={{ padding: 12 }}>{inv.store?.name}</td>
                  <td style={{ padding: 12, fontWeight: 800 }}>Rs {inv.totalAmount}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: 20, background: inv.status === 'APPROVED' ? '#8de02c22' : '#f9731622', color: inv.status === 'APPROVED' ? '#8de02c' : '#f97316' }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    {inv.status === 'PENDING' && (
                      <button onClick={() => approve('invoice', inv.id)} style={{ padding: '6px 12px', borderRadius: 8, background: '#39FF14', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'logs' && (
        <div style={cardStyle}>
          <h3>Stock Pipeline Audit Trail</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.1)', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>Action</th>
                <th style={{ padding: 12 }}>User</th>
                <th style={{ padding: 12 }}>Movement</th>
                <th style={{ padding: 12 }}>Notes</th>
                <th style={{ padding: 12 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.logs.map(log => (
                <tr key={log.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: 12, fontWeight: 800, color: '#8de02c' }}>{log.actionType}</td>
                  <td style={{ padding: 12 }}>{log.username}</td>
                  <td style={{ padding: 12 }}>{log.beforeQty} ➔ {log.afterQty} ({log.changeQty > 0 ? '+' : ''}{log.changeQty})</td>
                  <td style={{ padding: 12, fontSize: '0.85rem' }}>{log.details}</td>
                  <td style={{ padding: 12, fontSize: '0.75rem', color: theme.muted }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: theme.card, width: 700, padding: 30, borderRadius: 24, border: `1px solid ${theme.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>{modalType === 'invoice' ? 'New Purchase (GRN)' : 'Stock Issuance'}</h2>
              <X onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }} color={theme.text} />
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: theme.muted, marginBottom: 4 }}>Destination Store (Outlet)</label>
                  <select required style={{ width: '100%', padding: 12, borderRadius: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={formData.storeId} onChange={e => setFormData({ ...formData, storeId: e.target.value })}>
                    <option value="">Select Store</option>
                    {data.outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                {modalType === 'issuance' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: theme.muted, marginBottom: 4 }}>Target Department</label>
                    <select required style={{ width: '100%', padding: 12, borderRadius: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}>
                      <option value="">Select Dept</option>
                      {data.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>Itemized Entry</h4>
                  <button type="button" onClick={addLine} style={{ padding: '6px 12px', border: `1px solid ${theme.border}`, background: 'transparent', color: theme.text, borderRadius: 8, cursor: 'pointer' }}>+ Add Row</button>
                </div>
                {formData.lines.map((l, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 0.4fr', gap: 10, marginBottom: 10 }}>
                    <select required style={{ padding: 10, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={l.productId} onChange={e => updateLine(idx, 'productId', e.target.value)}>
                      <option value="">Choose Food/Material</option>
                      {data.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input type="number" step="0.01" required placeholder="Qty" style={{ padding: 10, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={l.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                    {modalType === 'invoice' && (
                      <input type="number" step="0.01" required placeholder="Rate" style={{ padding: 10, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={l.rate} onChange={e => updateLine(idx, 'rate', Number(e.target.value))} />
                    )}
                    <button type="button" onClick={() => removeLine(idx)} style={{ color: '#ef4444', border: 'none', background: 'transparent' }}>×</button>
                  </div>
                ))}
              </div>

              <button type="submit" style={{ width: '100%', padding: 16, borderRadius: 12, background: '#39FF14', color: '#000', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                <Save size={18} /> {modalType === 'invoice' ? 'Generate Purchase Invoice' : 'Finalize Issuance Note'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
