import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Search, Save, X, Tablet, Store } from 'lucide-react';
import { API, headers } from '../App.jsx';

export default function OutletsPage() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', taxRate: 0, serviceChg: 0 });
  const [search, setSearch] = useState('');

  const fetchOutlets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/outlets`, { headers: headers() });
      if (res.ok) setOutlets(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchOutlets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingOutlet ? 'PUT' : 'POST';
    const url = editingOutlet ? `${API}/api/outlets/${editingOutlet.id}` : `${API}/api/outlets`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingOutlet(null);
        setFormData({ name: '', address: '', phone: '', taxRate: 0, serviceChg: 0 });
        fetchOutlets();
      }
    } catch (e) { alert('Failed to save outlet'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this outlet?')) return;
    try {
      const res = await fetch(`${API}/api/outlets/${id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) fetchOutlets();
    } catch (e) { alert('Delete failed'); }
  };

  const filtered = outlets.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.address.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="section-title"><MapPin size={20} /> Outlets & Tables</div>
        <button className="btn btn-primary" onClick={() => { setEditingOutlet(null); setFormData({name:'', address:'', phone:'', taxRate:0, serviceChg:0}); setShowModal(true); }}>
          <Plus size={18} /> New Outlet
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: 24, padding: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search outlets..." className="form-input" style={{ paddingLeft: 40 }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>Loading Outlets...</div>
      ) : (
        <div className="grid grid-2">
          {filtered.map(outlet => (
            <div key={outlet.id} className="glass-card fade-in" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(57, 255, 20, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8de02c', marginBottom: 16 }}>
                  <Store size={22} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditingOutlet(outlet)} style={{ color: 'var(--text-muted)', border: 'none', background: 'none' }}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(outlet.id)} style={{ color: '#ef4444', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{outlet.name}</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {outlet.address}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <div style={{ background: 'rgba(57, 255, 20, 0.05)', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Tables</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8de02c' }}>{outlet.tables?.length || 0}</div>
                </div>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Tax Rate</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6' }}>{outlet.taxRate}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ width: 500 }}>
            <div className="modal-header">
              <h3>{editingOutlet ? 'Edit Outlet' : 'Create New Outlet'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-2" style={{ gap: 16 }}>
              <div className="col-span-2">
                <label className="form-label">Outlet Name</label>
                <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Address</label>
                <input className="form-input" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Tax Rate (%)</label>
                <input className="form-input" type="number" step="0.01" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: Number(e.target.value)})} />
              </div>
              <div className="col-span-2" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Save size={18} /> Save Outlet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
