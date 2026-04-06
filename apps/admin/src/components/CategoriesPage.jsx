import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, Search, Image as ImageIcon, Save, X, RefreshCw } from 'lucide-react';
import { API, headers as getHeaders } from '../App.jsx';

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ show: false, mode: 'add', data: null });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/categories`, { headers: getHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) { 
      console.error('Fetch categories error:', e);
      setCategories([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCats(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get('name'),
      description: fd.get('description'),
      image: fd.get('image'), // URL from gallery
      isActive: true
    };

    try {
      const method = modal.mode === 'add' ? 'POST' : 'PUT';
      const url = `${API}/api/categories${modal.mode === 'edit' ? `/${modal.data.id}` : ''}`;
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setModal({ show: false, mode: 'add', data: null });
        fetchCats();
      } else {
        const err = await res.json();
        alert('Failed to save category: ' + (err.error || 'Unknown error'));
      }
    } catch (e) { 
      console.error('Save category error:', e);
      alert('Network error while saving');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products in this category might be affected.')) return;
    try {
      const res = await fetch(`${API}/api/categories/${id}`, { 
        method: 'DELETE', 
        headers: getHeaders() 
      });
      if (res.ok) {
        fetchCats();
      } else {
        alert('Failed to delete');
      }
    } catch (e) { console.error(e); }
  };

  const filtered = categories.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Layers size={20}/>Master Categories</div>
        <button className="btn btn-sm btn-green" onClick={() => setModal({ show: true, mode: 'add', data: null })}>
          <Plus size={16}/> Create Category
        </button>
      </div>

      <div className="glass-card mb-20">
        <div className="relative">
          <Search size={16} className="absolute left-12 top-10 text-muted" />
          <input 
            className="form-input pl-36" 
            placeholder="Search categories..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-40">
          <RefreshCw className="spin" size={32} color="#8de02c"/>
          <p className="mt-12 text-muted">Loading Categories...</p>
        </div>
      ) : (
        <>
          <div className="grid-3">
            {filtered.length > 0 ? filtered.map(cat => (
              <div key={cat.id} className="glass-card flex flex-col gap-12">
                <div style={{ height: 120, background: '#1e293b', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                  {cat.image ? (
                    <img src={cat.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={cat.name} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted"><ImageIcon size={32}/></div>
                  )}
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                    <button className="btn-icon bg-glass sm" onClick={() => setModal({ show: true, mode: 'edit', data: cat })}><Edit size={12}/></button>
                    <button className="btn-icon bg-glass sm text-red" onClick={() => handleDelete(cat.id)}><Trash2 size={12}/></button>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{cat.name}</div>
                  <div className="text-xs text-muted mt-4">{cat.description || 'No description provided.'}</div>
                  <div className="text-xs font-bold mt-12" style={{ color: 'var(--neon-green)' }}>
                    {cat._count?.products || 0} Products
                  </div>
                </div>
              </div>
            )) : (
              <div className="table-empty" style={{ gridColumn: '1 / -1' }}>No categories found matching your search.</div>
            )}
          </div>
        </>
      )}

      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Create New Category' : 'Edit Category'}</h3>
              <X cursor="pointer" onClick={() => setModal({ show: false, mode: 'add', data: null })} />
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-16">
              <div>
                <label className="text-sm font-bold mb-4 block">Category Name</label>
                <input required name="name" className="form-input" defaultValue={modal.data?.name} placeholder="e.g. Italian Pizza" />
              </div>
              <div>
                <label className="text-sm font-bold mb-4 block">Description</label>
                <textarea name="description" className="form-input" defaultValue={modal.data?.description} style={{ height: 80 }} placeholder="Brief overview of items in this category" />
              </div>
              <div>
                <label className="text-sm font-bold mb-4 block">Image URL (from Media Gallery)</label>
                <input name="image" className="form-input" defaultValue={modal.data?.image} placeholder="Paste URL from Media Gallery" />
              </div>
              <button disabled={isSaving} type="submit" className="btn btn-green w-full py-12 mt-8">
                {isSaving ? <RefreshCw className="spin" size={16}/> : <Save size={16}/>}
                {modal.mode === 'add' ? 'Create Category' : 'Update Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
