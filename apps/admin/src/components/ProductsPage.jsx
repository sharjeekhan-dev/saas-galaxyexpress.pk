import React, { useState } from 'react';
import { API, headers } from '../App.jsx';
import { Package, Plus, Edit, Trash2, X, Check } from 'lucide-react';

export default function ProductsPage({ products, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const categories = ['All', ...new Set(products.map(p=>p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchCat = catFilter==='All' || p.category===catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const saveProduct = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = {
      name:f.get('name'), sku:f.get('sku'), category:f.get('category'),
      price:+f.get('price'), cost:+f.get('cost'), description:f.get('description')
    };
    try {
      const url = editItem ? `${API}/api/products/${editItem.id}` : `${API}/api/products`;
      const method = editItem ? 'PUT' : 'POST';
      await fetch(url, { method, headers:headers(), body:JSON.stringify(body) });
      setShowModal(false); setEditItem(null); onRefresh();
    } catch {}
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await fetch(`${API}/api/products/${id}`, { method:'DELETE', headers:headers() }); onRefresh(); } catch {}
  };

  const openEdit = (p) => { setEditItem(p); setShowModal(true); };
  const openNew  = ()  => { setEditItem(null); setShowModal(true); };

  return (
    <div className="fade-in">
      {showModal && (
        <div className="modal-overlay" onClick={()=>{setShowModal(false);setEditItem(null);}}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editItem?'Edit Product':'Add Product'}</div>
              <button className="btn-icon" onClick={()=>{setShowModal(false);setEditItem(null);}}><X size={16}/></button>
            </div>
            <form onSubmit={saveProduct} className="modal-body">
              <div className="form-group"><label>Product Name</label>
                <input name="name" className="form-input" defaultValue={editItem?.name} required /></div>
              <div className="grid-2">
                <div className="form-group"><label>SKU</label>
                  <input name="sku" className="form-input" defaultValue={editItem?.sku} required /></div>
                <div className="form-group"><label>Category</label>
                  <input name="category" className="form-input" defaultValue={editItem?.category} required /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Selling Price</label>
                  <input name="price" type="number" step="0.01" className="form-input" defaultValue={editItem?.price} required /></div>
                <div className="form-group"><label>Cost Price</label>
                  <input name="cost" type="number" step="0.01" className="form-input" defaultValue={editItem?.cost} /></div>
              </div>
              <div className="form-group"><label>Description</label>
                <textarea name="description" className="form-input" rows="3" defaultValue={editItem?.description} /></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>{setShowModal(false);setEditItem(null);}}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Check size={14}/>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title"><Package size={20}/>Products</div>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={14}/>Add Product</button>
      </div>

      <div className="filter-bar">
        <input className="filter-input" placeholder="Search name or SKU…" value={search} onChange={e=>setSearch(e.target.value)} />
        {categories.map(c=>(
          <button key={c} className={`tab ${catFilter===c?'active':''}`} onClick={()=>setCatFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Cost</th><th>Margin</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map(p => {
              const margin = p.cost > 0 ? (((p.price-p.cost)/p.price)*100).toFixed(1) : '—';
              return (
                <tr key={p.id}>
                  <td style={{fontWeight:600}}>{p.name}</td>
                  <td className="text-muted text-sm">{p.sku}</td>
                  <td><span className="badge badge-purple">{p.category}</span></td>
                  <td style={{fontWeight:700}}>${p.price?.toFixed(2)}</td>
                  <td className="text-muted">${p.cost?.toFixed(2)}</td>
                  <td style={{color:!isNaN(margin)&&margin>30?'var(--neon-green)':'var(--neon-orange)'}}>{margin}%</td>
                  <td><span className={`badge ${p.isActive!==false?'badge-success':'badge-danger'}`}>{p.isActive!==false?'Active':'Inactive'}</span></td>
                  <td>
                    <div className="flex gap-4">
                      <button className="btn-icon" title="Edit" onClick={()=>openEdit(p)}><Edit size={13}/></button>
                      <button className="btn-icon" title="Delete" onClick={()=>deleteProduct(p.id)}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              );
            }) : <tr><td colSpan="8" className="table-empty">No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
