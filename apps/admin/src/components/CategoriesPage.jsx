import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, Search, Save, X, Tag } from 'lucide-react';
import { API, headers } from '../App.jsx';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [search, setSearch] = useState('');

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/categories`, { headers: headers() });
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCats(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingCat ? 'PUT' : 'POST';
    const url = editingCat ? `${API}/api/categories/${editingCat.id}` : `${API}/api/categories`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingCat(null);
        setFormData({ name: '', description: '' });
        fetchCats();
      }
    } catch (e) { alert('Failed to save category'); }
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${API}/api/categories/${id}`, { method: 'DELETE', headers: headers() });
      if (res.ok) fetchCats();
    } catch (e) { alert('Delete failed'); }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="section-title"><Layers size={20} /> Categories Management</div>
        <button className="btn btn-primary" onClick={() => { setEditingCat(null); setFormData({name:'', description:''}); setShowModal(true); }}>
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: 24, padding: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search categories..." className="form-input" style={{ paddingLeft: 40 }} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>Loading Categories...</div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(cat => (
            <div key={cat.id} className="glass-card fade-in" style={{ padding: 24, transition: '0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(57, 255, 20, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8de02c', marginBottom: 16 }}>
                  <Tag size={24} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(cat)} style={{ color: 'var(--text-muted)', border: 'none', background: 'none' }}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(cat.id)} style={{ color: '#ef4444', border: 'none', background: 'none' }}><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{cat.name}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', minHeight: 40 }}>{cat.description || 'No description provided.'}</p>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">Active</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created: {new Date(cat.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ width: 450 }}>
            <div className="modal-header">
              <h3>{editingCat ? 'Edit Category' : 'Create New Category'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Category Name</label>
                <input className="form-input" type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Beverages" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" style={{ minHeight: 100 }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe this category..."></textarea>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}><Save size={18} /> Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
