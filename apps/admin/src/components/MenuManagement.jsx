import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, Camera, ChevronRight, Settings, BookOpen } from 'lucide-react';

export default function MenuManagement({ theme, API, vendor }) {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Broast Specialties', items: [
      { id: '101', name: 'Quarter Broast', price: 450, status: 'Active', variants: ['Leg', 'Chest'] },
      { id: '102', name: 'Full Broast', price: 1650, status: 'Active', variants: ['Single'] },
    ]},
    { id: '2', name: 'Sides & Dips', items: [
      { id: '201', name: 'French Fries', price: 200, status: 'Active', variants: ['S', 'M', 'L'] },
      { id: '202', name: 'Garlic Sauce', price: 50, status: 'Active', variants: ['Single'] },
    ]}
  ]);

  const [activeCat, setActiveCat] = useState('1');

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title"><BookOpen size={20} /> Menu Management</h2>
          <p className="text-muted text-sm">Manage your catalog, prices, and availability</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Add New Item
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
        
        {/* CATEGORIES SIDEBAR */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 0 16px', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
            <Search size={16} className="text-muted" />
            <input placeholder="Search categories..." className="form-input" style={{ border: 'none', background: 'transparent' }} />
          </div>
          {categories.map(cat => (
            <div 
              key={cat.id} 
              onClick={() => setActiveCat(cat.id)}
              className={`nav-item ${activeCat === cat.id ? 'active' : ''}`}
              style={{ marginBottom: 4 }}
            >
              {cat.name}
              <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: activeCat === cat.id ? 1 : 0 }} />
            </div>
          ))}
          <button className="btn btn-outline w-full" style={{ marginTop: 20, borderStyle: 'dotted' }}>
            + Add Category
          </button>
        </div>

        {/* ITEMS LIST */}
        <div className="flex flex-col gap-24">
          <div className="table-wrapper">
            <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <div className="card-title">Items in Selected Category</div>
              <div className="badge badge-info">Found {categories.find(c => c.id === activeCat)?.items.length} items</div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>DETAILS</th>
                  <th className="right">PRICE</th>
                  <th>STATUS</th>
                  <th className="right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {categories.find(c => c.id === activeCat)?.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                          <Camera size={20} className="text-light" />
                        </div>
                        <div className="font-bold">{item.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-6">
                        {item.variants.map(v => (
                          <span key={v} className="badge badge-default">{v}</span>
                        ))}
                      </div>
                    </td>
                    <td className="right">
                      <div className="font-800" style={{ color: 'var(--accent)' }}>Rs. {item.price}</div>
                    </td>
                    <td>
                      <span className="badge badge-lime">{item.status}</span>
                    </td>
                    <td className="right">
                      <div className="flex justify-end gap-6">
                        <button className="btn-icon"><Edit2 size={14} /></button>
                        <button className="btn-icon"><MoreVertical size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="badge badge-orange" style={{ padding: 24, whiteSpace: 'normal', display: 'flex', gap: 16 }}>
             <Settings className="text-accent" />
             <div>
               <div className="font-bold">Operational Sync Notice</div>
               <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Contact our support team if you want to update branch-specific menus or pricing modifiers across the multi-tenant landscape.</p>
             </div>
          </div>
        </div>

      </div>
    </div>

  );
}
