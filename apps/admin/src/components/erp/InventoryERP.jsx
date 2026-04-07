import React, { useState, useEffect } from 'react';
import { 
  Layers, Package, ShoppingCart, Truck, RefreshCw, BarChart3, 
  Plus, Printer, CheckCircle, Clock, X, Save, Search, 
  Factory, ShieldCheck, AlertTriangle, Trash2, ClipboardList 
} from 'lucide-react';
import { db } from '../../lib/firebase.js';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';

export default function InventoryERP({ tenant, headers }) {
  const [subTab, setSubTab] = useState('stock');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ 
    stock: [], invoices: [], issuances: [], logs: [], 
    products: [], outlets: [], departments: [], suppliers: [], 
    adjustments: [], wastage: [] 
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('invoice'); 
  const [formData, setFormData] = useState({ 
    storeId: '', tenantId: tenant?.id || '', departmentId: '', supplierId: '', 
    notes: '', reason: '', 
    lines: [{ productId: '', quantity: 1, rate: 0 }] 
  });

  useEffect(() => {
    if (!tenant?.id) return;

    const q = (coll) => query(collection(db, coll), where('tenantId', '==', tenant.id));
    
    const unsubs = [
      onSnapshot(q('inventory'), s => setData(p => ({ ...p, stock: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('purchase_invoices'), s => setData(p => ({ ...p, invoices: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('issuances'), s => setData(p => ({ ...p, issuances: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('audit_logs'), s => setData(p => ({ ...p, logs: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('products'), s => setData(p => ({ ...p, products: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('outlets'), s => setData(p => ({ ...p, outlets: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('departments'), s => setData(p => ({ ...p, departments: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('suppliers'), s => setData(p => ({ ...p, suppliers: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('adjustments'), s => setData(p => ({ ...p, adjustments: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
      onSnapshot(q('wastage'), s => setData(p => ({ ...p, wastage: s.docs.map(d => ({id: d.id, ...d.data()})) }))),
    ];

    return () => unsubs.forEach(u => u());
  }, [tenant]);

  const fetchData = () => console.log('Real-time sync handle...');
  
  // Update formData when tenant changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, tenantId: tenant?.id || '' }));
  }, [tenant]);
  
  // Update formData when tenant changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, tenantId: tenant?.id || '' }));
  }, [tenant]);

  const addLine = () => setFormData({ ...formData, lines: [...formData.lines, { productId: '', quantity: 1, rate: 0 }] });
  const removeLine = (idx) => setFormData({ ...formData, lines: formData.lines.filter((_, i) => i !== idx) });
  const updateLine = (idx, key, val) => {
    const nl = [...formData.lines];
    nl[idx][key] = val;
    setFormData({ ...formData, lines: nl });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let col = '';
    if (modalType === 'invoice') col = 'purchase_invoices';
    else if (modalType === 'issuance') col = 'issuances';
    else if (modalType === 'adjustment') col = 'adjustments';
    else if (modalType === 'wastage') col = 'wastage';

    try {
      await addDoc(collection(db, col), {
        ...formData,
        status: 'PENDING',
        createdAt: serverTimestamp()
      });
      setShowModal(false);
    } catch (e) { alert('Firestore Error: ' + e.message); }
  };

  const approve = async (type, id) => {
    if (!confirm('Approve this transaction and sync stock?')) return;
    
    let col = '';
    if (type === 'invoice') col = 'purchase_invoices';
    else if (type === 'issuance') col = 'issuances';
    else if (type === 'adjustment') col = 'adjustments';
    else if (type === 'wastage') col = 'wastage';

    try {
      const docRef = doc(db, col, id);
      await updateDoc(docRef, { status: 'APPROVED' });
      // Note: Stock update logic should ideally be in a Cloud Function triggered by this status change
    } catch (e) { alert('Approval Error: ' + e.message); }
  };

  const t = (id) => subTab === id;

  const cardStyle = { background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24, marginBottom: 20 };
  const tabSty = (active) => ({ padding: '10px 20px', borderRadius: 12, border: 'none', background: active ? '#8de02c' : 'rgba(0,0,0,0.1)', color: active ? '#000' : 'var(--text-main)', cursor: 'pointer', fontWeight: 700, transition: '0.3s', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' });

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: theme.text }}>Inventory Control Center</h2>
          <span style={{ fontSize: '0.85rem', color: theme.muted }}>Official Stock Flow & Audit Pipeline</span>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => { setModalType('invoice'); setFormData({ storeId: '', tenantId: tenant?.id, supplierId: '', notes: '', lines: [{ productId: '', quantity: 1, rate: 0 }] }); setShowModal(true); }} className="btn btn-primary">
            <ShoppingCart size={18} /> Purchase
          </button>
          <button onClick={() => { setModalType('issuance'); setFormData({ storeId: '', tenantId: tenant?.id, departmentId: '', notes: '', lines: [{ productId: '', quantity: 1, rate: 0 }] }); setShowModal(true); }} className="btn btn-cyan">
            <Truck size={18} /> Issuance
          </button>
          <button onClick={() => { setModalType('adjustment'); setFormData({ storeId: '', departmentId: '', reason: '', lines: [{ productId: '', quantity: 0 }] }); setShowModal(true); }} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={18} /> Adjustment
          </button>
          <button onClick={() => { setModalType('wastage'); setFormData({ storeId: '', departmentId: '', reason: '', lines: [{ productId: '', quantity: 1 }] }); setShowModal(true); }} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trash2 size={18} /> Wastage
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        <button style={tabSty(t('stock'))} onClick={() => setSubTab('stock')}><Package size={16} /> Live Stock</button>
        <button style={tabSty(t('purchase'))} onClick={() => setSubTab('purchase')}><ShoppingCart size={16} /> Purchases</button>
        <button style={tabSty(t('issuance'))} onClick={() => setSubTab('issuance')}><Truck size={16} /> Issuances</button>
        <button style={tabSty(t('adjustment'))} onClick={() => setSubTab('adjustment')}><ClipboardList size={16} /> Adjustments</button>
        <button style={tabSty(t('wastage'))} onClick={() => setSubTab('wastage')}><Trash2 size={16} /> Wastage</button>
        <button style={tabSty(t('logs'))} onClick={() => setSubTab('logs')}><BarChart3 size={16} /> Audit Trail</button>
      </div>

      {subTab === 'stock' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ margin: 0 }}>Real-time Stock Levels</h3>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 10, top: 10, color: theme.muted }} />
              <input type="text" placeholder="Search product..." style={{ padding: '8px 12px 8px 36px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
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
          </div>
          {data.stock.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: theme.muted }}>No real stock entries found.</div>}
        </div>
      )}

      {subTab === 'purchase' && (
        <div style={cardStyle}>
          <h3>Active Purchase List</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Invoice #</th>
                  <th style={{ padding: 12 }}>Supplier</th>
                  <th style={{ padding: 12 }}>Store</th>
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
                    <td style={{ padding: 12, fontWeight: 600 }}>{inv.supplier?.name || '--'}</td>
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
        </div>
      )}

      {subTab === 'adjustment' && (
        <div style={cardStyle}>
          <h3>Stock Adjustments</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Date</th>
                  <th style={{ padding: 12 }}>Location</th>
                  <th style={{ padding: 12 }}>Reason</th>
                  <th style={{ padding: 12 }}>Items</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.adjustments.map(adj => (
                  <tr key={adj.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: 12 }}>{new Date(adj.createdAt).toLocaleString()}</td>
                    <td style={{ padding: 12 }}>{adj.outlet?.name || adj.department?.name}</td>
                    <td style={{ padding: 12 }}>{adj.reason}</td>
                    <td style={{ padding: 12, fontWeight: 700 }}>{adj.lines?.length} lines</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: 20, background: adj.status === 'APPROVED' ? '#8de02c22' : '#f9731622', color: adj.status === 'APPROVED' ? '#8de02c' : '#f97316' }}>
                        {adj.status}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      {adj.status === 'PENDING' && (
                        <button onClick={() => approve('adjustment', adj.id)} style={{ padding: '6px 12px', borderRadius: 8, background: '#39FF14', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'wastage' && (
        <div style={cardStyle}>
          <h3>Wastage Reports</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.1)', textAlign: 'left' }}>
                  <th style={{ padding: 12 }}>Date</th>
                  <th style={{ padding: 12 }}>Location</th>
                  <th style={{ padding: 12 }}>Reason</th>
                  <th style={{ padding: 12 }}>Items</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.wastage.map(wst => (
                  <tr key={wst.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: 12 }}>{new Date(wst.createdAt).toLocaleString()}</td>
                    <td style={{ padding: 12 }}>{wst.outlet?.name || wst.department?.name}</td>
                    <td style={{ padding: 12 }}>{wst.reason}</td>
                    <td style={{ padding: 12, fontWeight: 700 }}>{wst.lines?.length} lines</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: 20, background: wst.status === 'APPROVED' ? '#8de02c22' : '#f9731622', color: wst.status === 'APPROVED' ? '#8de02c' : '#f97316' }}>
                        {wst.status}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      {wst.status === 'PENDING' && (
                        <button onClick={() => approve('wastage', wst.id)} style={{ padding: '6px 12px', borderRadius: 8, background: '#39FF14', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'logs' && (
        <div style={cardStyle}>
          <h3>Audit Trail</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
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
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20 }}>
          <div style={{ background: theme.card, width: '100%', maxWidth: 800, padding: 30, borderRadius: 24, border: `1px solid ${theme.border}`, maxHeight: '95vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>{modalType === 'invoice' ? 'Purchase Document' : modalType === 'issuance' ? 'Stock Issuance' : modalType === 'adjustment' ? 'Stock Adjustment' : 'Wastage Report'}</h2>
              <X onClick={() => setShowModal(false)} style={{ cursor: 'pointer' }} color={theme.text} />
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                {modalType !== 'issuance' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: theme.muted, marginBottom: 6, fontWeight: 700 }}>Stock Location</label>
                    <select required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={formData.storeId} onChange={e => setFormData({ ...formData, storeId: e.target.value })}>
                      <option value="">Select Store</option>
                      {data.outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: theme.muted, marginBottom: 6, fontWeight: 700 }}>Source Store</label>
                    <select required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={formData.storeId} onChange={e => setFormData({ ...formData, storeId: e.target.value })}>
                        <option value="">Select Store</option>
                        {data.outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                )}

                {modalType === 'invoice' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: theme.muted, marginBottom: 6, fontWeight: 700 }}>Account Party (Supplier)</label>
                    <select required style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })}>
                      <option value="">Select Supplier</option>
                      {data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.contactPerson})</option>)}
                    </select>
                  </div>
                )}

                {(modalType === 'issuance' || modalType === 'adjustment' || modalType === 'wastage') && (
                   <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: theme.muted, marginBottom: 6, fontWeight: 700 }}>Dept / Target</label>
                    <select style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}>
                      <option value="">Select Dept (Optional)</option>
                      {data.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                   </div>
                )}
              </div>

               <div style={{ marginBottom: 20 }}>
                 <label style={{ display: 'block', fontSize: '0.85rem', color: theme.muted, marginBottom: 6, fontWeight: 700 }}>Notes / Reason</label>
                 <textarea value={formData.notes || formData.reason} onChange={e => setFormData({ ...formData, notes: e.target.value, reason: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 12, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, height: 60 }} placeholder="Internal notes context..." />
               </div>

              <div style={{ marginBottom: 24, background: 'rgba(0,0,0,0.05)', padding: 20, borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                  <h4 style={{ margin: 0 }}>Itemized Entry Grid</h4>
                  <button type="button" onClick={addLine} style={{ padding: '8px 16px', background: '#39FF14', color: '#000', borderRadius: 10, cursor: 'pointer', border: 'none', fontWeight: 800 }}>+ Add Row</button>
                </div>
                {formData.lines.map((l, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 0.4fr', gap: 10, marginBottom: 10 }}>
                    <select required style={{ padding: 12, borderRadius: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={l.productId} onChange={e => updateLine(idx, 'productId', e.target.value)}>
                      <option value="">Item Name</option>
                      {data.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                    <input type="number" step="0.01" required placeholder="Qty" style={{ padding: 12, borderRadius: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={l.quantity} onChange={e => updateLine(idx, 'quantity', Number(e.target.value))} />
                    {modalType === 'invoice' && (
                      <input type="number" step="0.01" required placeholder="Rate" style={{ padding: 12, borderRadius: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} value={l.rate} onChange={e => updateLine(idx, 'rate', Number(e.target.value))} />
                    )}
                    <button type="button" onClick={() => removeLine(idx)} style={{ color: '#ef4444', border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                 <button type="button" onClick={() => setShowModal(false)} style={{ padding: '16px 30px', borderRadius: 14, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                 <button type="submit" style={{ flex: 1, padding: 16, borderRadius: 14, background: '#39FF14', color: '#000', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Save size={20} /> Save Document
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
