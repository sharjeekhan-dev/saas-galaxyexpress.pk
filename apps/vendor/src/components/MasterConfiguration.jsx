import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Server, Tags, Users, Settings } from 'lucide-react';

export default function MasterConfiguration({ theme, darkMode, showToast, API, vendor }) {
  const [activeTab, setActiveTab] = useState('units');

  const navs = [
    { id: 'units', label: 'Units (UOM)', icon: Server },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'general', label: 'General Info', icon: Settings },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: theme.text }}>Master Configuration</h2>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {navs.map(n => (
          <button
            key={n.id}
            onClick={() => setActiveTab(n.id)}
            style={{
              background: activeTab === n.id ? '#8de02c' : theme.card,
              color: activeTab === n.id ? '#000' : theme.muted,
              border: `1px solid ${theme.border}`,
              padding: '10px 24px', borderRadius: 20, fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <n.icon size={16} /> {n.label}
          </button>
        ))}
      </div>

      <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24, minHeight: 400 }}>
        {activeTab === 'units' && <UnitsTab theme={theme} showToast={showToast} API={API} vendor={vendor} />}
        {activeTab === 'categories' && <CategoriesTab theme={theme} showToast={showToast} API={API} vendor={vendor} />}
        {activeTab === 'users' && <div style={{ color: theme.muted }}>User & Role management coming soon... (In Progress)</div>}
        {activeTab === 'general' && <div style={{ color: theme.muted }}>General Info config coming soon... (In Progress)</div>}
      </div>
    </div>
  );
}

function UnitsTab({ theme, showToast, API, vendor }) {
  const [units, setUnits] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', shortName: '' });

  const fetchUnits = async () => {
    try {
      const res = await fetch(`${API}/api/products/units?tenantId=${vendor?.id || ''}`);
      if (res.ok) setUnits(await res.json());
    } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchUnits(); }, []);

  const handleSave = async () => {
    if(!formData.name || !formData.shortName) return showToast('Please fill all fields');
    try {
      const res = await fetch(`${API}/api/products/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tenantId: vendor?.id })
      });
      if(res.ok) {
        showToast('Unit Created Successfully');
        setFormData({ name: '', shortName: '' });
        setIsAdding(false);
        fetchUnits();
      } else {
        showToast('Error saving unit');
      }
    } catch(e) { showToast('Network Error'); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this unit?')) return;
    try {
      const res = await fetch(`${API}/api/products/units/${id}`, { method: 'DELETE' });
      if(res.ok) { showToast('Unit Deleted'); fetchUnits(); }
    } catch(e) {}
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: theme.text }}>Unit of Measurements (UOM)</h3>
        <button onClick={() => setIsAdding(!isAdding)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAdding ? <X size={16}/> : <Plus size={16}/>} {isAdding ? 'Cancel' : 'Add Unit'}
        </button>
      </div>

      {isAdding && (
        <div style={{ background: theme.bg, padding: 20, borderRadius: 12, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-end', border: `1px solid ${theme.border}`}}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: theme.muted, marginBottom: 6 }}>Unit Name</label>
            <input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. Kilogram" style={{ width: '100%', padding: '10px', borderRadius: 8, background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: theme.muted, marginBottom: 6 }}>Short Name</label>
            <input value={formData.shortName} onChange={e=>setFormData({...formData, shortName: e.target.value})} type="text" placeholder="e.g. kg" style={{ width: '100%', padding: '10px', borderRadius: 8, background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }} />
          </div>
          <button onClick={handleSave} style={{ background: '#39FF14', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, height: 42 }}>
            <Save size={16} /> Save
          </button>
        </div>
      )}

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead style={{ background: theme.bg, color: theme.muted, fontSize: '0.85rem' }}>
          <tr>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Unit Name</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Short Code</th>
            <th style={{ padding: '14px 16px', fontWeight: 700, width: 100 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.length === 0 && <tr><td colSpan={3} style={{ textAlign:'center', padding: 30, color: theme.muted }}>No units defined.</td></tr>}
          {units.map(u => (
            <tr key={u.id} style={{ borderTop: `1px solid ${theme.border}` }}>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: theme.text }}>{u.name}</td>
              <td style={{ padding: '14px 16px', color: theme.muted }}>
                  <span style={{ padding: '4px 8px', background: theme.bg, borderRadius: 6, border: `1px solid ${theme.border}` }}>{u.shortName}</span>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <button onClick={() => handleDelete(u.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoriesTab({ theme, showToast, API, vendor }) {
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCats = async () => {
    try {
      const res = await fetch(`${API}/api/products/categories/master?tenantId=${vendor?.id || ''}`);
      if (res.ok) setCategories(await res.json());
    } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchCats(); }, []);

  const handleSave = async () => {
    if(!formData.name) return showToast('Please provide category name');
    try {
      const res = await fetch(`${API}/api/products/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tenantId: vendor?.id })
      });
      if(res.ok) {
        showToast('Category Created');
        setFormData({ name: '', description: '' });
        setIsAdding(false);
        fetchCats();
      } else showToast('Error saving category');
    } catch(e) { showToast('Network Error'); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete category?')) return;
    try {
      const res = await fetch(`${API}/api/products/categories/${id}`, { method: 'DELETE' });
      if(res.ok) { showToast('Category Deleted'); fetchCats(); }
    } catch(e) {}
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: theme.text }}>Menu / Inventory Categories</h3>
        <button onClick={() => setIsAdding(!isAdding)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAdding ? <X size={16}/> : <Plus size={16}/>} {isAdding ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {isAdding && (
        <div style={{ background: theme.bg, padding: 20, borderRadius: 12, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', border: `1px solid ${theme.border}`}}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: theme.muted, marginBottom: 6 }}>Category Name</label>
            <input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. Burgers, Beverages, Raw Materials" style={{ width: '100%', padding: '10px', borderRadius: 8, background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: theme.muted, marginBottom: 6 }}>Description (Optional)</label>
            <input value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} type="text" placeholder="Describe category..." style={{ width: '100%', padding: '10px', borderRadius: 8, background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }} />
          </div>
          <div style={{ marginTop: 24 }}>
            <button onClick={handleSave} style={{ background: '#39FF14', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, height: 42 }}>
                <Save size={16} /> Save
            </button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead style={{ background: theme.bg, color: theme.muted, fontSize: '0.85rem' }}>
          <tr>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Category Name</th>
            <th style={{ padding: '14px 16px', fontWeight: 700 }}>Description</th>
            <th style={{ padding: '14px 16px', fontWeight: 700, width: 100 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 && <tr><td colSpan={3} style={{ textAlign:'center', padding: 30, color: theme.muted }}>No categories defined.</td></tr>}
          {categories.map(c => (
            <tr key={c.id} style={{ borderTop: `1px solid ${theme.border}` }}>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: theme.text }}>{c.name}</td>
              <td style={{ padding: '14px 16px', color: theme.muted }}>{c.description || '-'}</td>
              <td style={{ padding: '14px 16px' }}>
                <button onClick={() => handleDelete(c.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
