import React, { useState } from 'react';
import { Factory, AlertTriangle, TrendingDown, Plus, Edit, ArrowUpDown, Package } from 'lucide-react';

export default function InventoryPage({ products }) {
  const [tab, setTab] = useState('stock');
  const [search, setSearch] = useState('');

  // Simulate stock data based on products
  const stockData = products.map((p, i) => ({
    ...p,
    quantity: Math.floor(Math.random() * 200) + 1,
    lowThreshold: 10,
    outlet: 'Main Branch',
    lastUpdated: new Date(Date.now() - i * 3600000).toLocaleDateString()
  }));

  const lowStock = stockData.filter(p => p.quantity <= p.lowThreshold);
  const filtered = stockData.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const adjustments = [
    { date:'2026-04-05', product:'Chicken Breast', type:'IN', qty:50, reason:'Purchase Order #PO-001' },
    { date:'2026-04-04', product:'French Fries',  type:'OUT', qty:20, reason:'Production use' },
    { date:'2026-04-04', product:'Coca-Cola 500ml', type:'ADJUSTMENT', qty:-3, reason:'Damaged/Expired' },
    { date:'2026-04-03', product:'Burger Buns', type:'IN', qty:100, reason:'Purchase Order #PO-002' },
  ];

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Factory size={20}/>Inventory Management</div>
        <div className="flex gap-8">
          <button className="btn btn-sm btn-outline"><Plus size={13}/>Add Stock</button>
          <button className="btn btn-sm btn-primary"><ArrowUpDown size={13}/>Stock Adjustment</button>
        </div>
      </div>

      {/* Alert bar */}
      {lowStock.length > 0 && (
        <div style={{
          background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.25)',
          borderRadius:10,padding:'12px 16px',marginBottom:20,
          display:'flex',alignItems:'center',gap:10
        }}>
          <AlertTriangle size={18} color="var(--neon-orange)"/>
          <span style={{fontWeight:600,color:'var(--neon-orange)'}}>Low Stock Alert:</span>
          <span className="text-sm">{lowStock.map(p=>p.name).join(', ')} — below threshold</span>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid mb-20">
        <div className="stat-card green"><div className="stat-value">{stockData.length}</div><div className="stat-label">Total SKUs</div></div>
        <div className="stat-card orange"><div className="stat-value">{lowStock.length}</div><div className="stat-label">Low Stock Items</div></div>
        <div className="stat-card purple">
          <div className="stat-value">${stockData.reduce((s,p)=>s+(p.cost||0)*p.quantity,0).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
          <div className="stat-label">Stock Value (Cost)</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-value">{stockData.filter(p=>p.quantity>p.lowThreshold).length}</div>
          <div className="stat-label">In Stock (OK)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-20" style={{marginBottom:20}}>
        <button className={`tab ${tab==='stock'?'active':''}`} onClick={()=>setTab('stock')}>Stock Levels</button>
        <button className={`tab ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>Transaction History</button>
        <button className={`tab ${tab==='low'?'active':''}`} onClick={()=>setTab('low')}>
          Low Stock {lowStock.length>0&&<span className="nav-badge">{lowStock.length}</span>}
        </button>
      </div>

      {tab==='stock' && (
        <>
          <div className="filter-bar">
            <input className="filter-input" placeholder="Search product or SKU…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Quantity</th><th>Threshold</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id}>
                    <td style={{fontWeight:600}}>{p.name}</td>
                    <td className="text-muted text-sm">{p.sku||'—'}</td>
                    <td><span className="badge badge-default">{p.category||'General'}</span></td>
                    <td style={{fontWeight:700,color:p.quantity<=p.lowThreshold?'var(--neon-red)':'var(--text-main)'}}>{p.quantity}</td>
                    <td className="text-muted">{p.lowThreshold}</td>
                    <td>${((p.cost||0)*p.quantity).toFixed(2)}</td>
                    <td>
                      {p.quantity === 0
                        ? <span className="badge badge-danger">Out of Stock</span>
                        : p.quantity <= p.lowThreshold
                          ? <span className="badge badge-warning"><TrendingDown size={10}/>Low</span>
                          : <span className="badge badge-success">In Stock</span>
                      }
                    </td>
                    <td><button className="btn-icon" title="Adjust"><Edit size={13}/></button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="8" className="table-empty">No products found</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==='history' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>Reason</th></tr></thead>
            <tbody>
              {adjustments.map((a,i)=>(
                <tr key={i}>
                  <td className="text-muted text-sm">{a.date}</td>
                  <td style={{fontWeight:600}}>{a.product}</td>
                  <td><span className={`badge ${a.type==='IN'?'badge-success':a.type==='OUT'?'badge-orange':'badge-warning'}`}>{a.type}</span></td>
                  <td style={{fontWeight:700,color:a.type==='OUT'?'var(--neon-red)':'var(--neon-green)'}}>{a.type==='OUT'?'-':'+' }{Math.abs(a.qty)}</td>
                  <td className="text-muted">{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='low' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Product</th><th>Current Stock</th><th>Threshold</th><th>Shortage</th><th>Actions</th></tr></thead>
            <tbody>
              {lowStock.length ? lowStock.map(p=>(
                <tr key={p.id}>
                  <td style={{fontWeight:600}}><AlertTriangle size={13} color="var(--neon-orange)" style={{marginRight:6}}/>  {p.name}</td>
                  <td style={{fontWeight:700,color:'var(--neon-red)'}}>{p.quantity}</td>
                  <td>{p.lowThreshold}</td>
                  <td style={{color:'var(--neon-orange)'}}>{Math.max(0,p.lowThreshold-p.quantity)} units short</td>
                  <td><button className="btn btn-sm btn-orange"><Plus size={12}/>Reorder</button></td>
                </tr>
              )) : <tr><td colSpan="5" className="table-empty">No low stock items ✓</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
