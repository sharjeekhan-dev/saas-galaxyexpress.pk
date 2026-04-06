import React, { useState, useRef } from 'react';
import {
  FileText, Plus, Eye, Edit, Trash2, X, Copy, Pencil,
  RotateCcw, Download, Printer, Send, Check, MoreHorizontal,
  DollarSign, Clock, CheckCircle, XCircle, Search
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────
const genId  = (prefix, n) => `${prefix}-${String(n).padStart(5,'0')}`;
const fmt    = (n) => `Rs ${Number(n).toLocaleString()}`;
const today  = () => new Date().toISOString().slice(0,10);
const dueIn  = (days) => { const d=new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); };

const STATUS_MAP = {
  DRAFT:     { label:'Draft',     badge:'badge-default',  icon: FileText },
  SENT:      { label:'Sent',      badge:'badge-info',     icon: Send },
  PAID:      { label:'Paid',      badge:'badge-success',  icon: CheckCircle },
  OVERDUE:   { label:'Overdue',   badge:'badge-danger',   icon: XCircle },
  PARTIAL:   { label:'Partial',   badge:'badge-warning',  icon: Clock },
  CANCELLED: { label:'Cancelled', badge:'badge-danger',   icon: XCircle },
};

const MOCK_INVOICES = [
  { id:'INV-00001', client:'Pizza Palace',     email:'pizza@palace.pk',  items:[{desc:'Platform Fee — March 2026',qty:1,rate:9900},{desc:'Order Commission (156 orders)',qty:156,rate:31}], subtotal:14736, tax:1326, discount:500, total:15562, status:'PAID',     issued:today(), due:dueIn(0),  paidOn:'2026-04-01', deletedAt:null, renamedTo:null },
  { id:'INV-00002', client:'Burger Galaxy',    email:'bg@galaxy.pk',     items:[{desc:'Platform Fee — March 2026',qty:1,rate:9900},{desc:'Order Commission (89 orders)',qty:89,rate:38}],  subtotal:13282, tax:1195, discount:0,   total:14477, status:'SENT',     issued:today(), due:dueIn(7),  paidOn:null,         deletedAt:null, renamedTo:null },
  { id:'INV-00003', client:'Fresh Foods Co',   email:'ff@fresh.pk',      items:[{desc:'B2B Bulk Order — March',qty:1,rate:32000}],                                                         subtotal:32000, tax:2880, discount:1500,total:33380, status:'PAID',     issued:today(), due:dueIn(0),  paidOn:'2026-04-03', deletedAt:null, renamedTo:null },
];

const BLANK_ITEM = { desc:'', qty:1, rate:0 };

// ── Modern Print Engine ────────────────────────────────────────────────────────────
function buildPrintHTML(inv, mode) {
  const isThermal = mode === 'thermal';
  const accentColor = '#39FF14'; 
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
  const rows = inv.items.map(i=>`<tr><td>${i.desc}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${fmt(Number(i.rate))}</td><td style="text-align:right">${fmt(i.qty*i.rate)}</td></tr>`).join('');
  
  if (isThermal) {
    return `<!DOCTYPE html><html><head><title>Receipt ${inv.id}</title>
    <style>
      @page { margin: 0; }
      body { font-family: 'Courier New', monospace; font-size: 13px; margin: 0; padding: 15px; width: 80mm; box-sizing: border-box; background: white; color: black; line-height: 1.2; }
      .center { text-align: center; }
      h2 { margin: 4px 0; font-size: 18px; font-weight: 900; letter-spacing: 1px; }
      .divider { border-top: 1px dashed #444; margin: 12px 0; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 12px; }
      th, td { text-align: left; padding: 4px 0; }
      .right { text-align: right; }
      .bold { font-weight: 900; }
      .qr-mock { width: 80px; height: 80px; background: #eee; margin: 15px auto; display: flex; align-items:center; justify-content:center; border: 1px solid #ccc; font-size: 10px; }
    </style>
    </head><body>
      <div class="center">
        <h2>GALAXY EXPRESS</h2>
        <div style="font-size:11px; text-transform:uppercase;">${inv.client || 'Authorized Partner'}</div>
        <div style="font-size:10px; margin-top:4px;">NTN: 8234791-2</div>
        <div class="divider"></div>
        <div style="display:flex; justify-content:space-between; font-size:11px;">
          <span>ORDER: ${inv.id}</span>
          <span>${fmtDate(inv.issued)}</span>
        </div>
      </div>
      <div class="divider"></div>
      <table>
        <thead><tr><th>ITEM</th><th class="center">QTY</th><th class="right">TOTAL</th></tr></thead>
        <tbody>
          ${inv.items.map(i=>`<tr><td>${i.desc.slice(0,20)}</td><td class="center">${i.qty}</td><td class="right">${fmt(i.qty*i.rate)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="divider"></div>
      <table style="font-size:13px;">
        <tr><td>SUBTOTAL</td><td class="right">${fmt(inv.subtotal)}</td></tr>
        <tr><td>TAX (16%)</td><td class="right">${fmt(inv.tax)}</td></tr>
        ${inv.discount ? `<tr><td>DISCOUNT</td><td class="right">-${fmt(inv.discount)}</td></tr>` : ''}
        <tr class="bold" style="font-size:16px;"><td style="padding-top:10px;">TOTAL</td><td class="right" style="padding-top:10px;">${fmt(inv.total)}</td></tr>
      </table>
      <div class="divider"></div>
      <div class="center" style="margin-top:15px;">
        <div class="qr-mock">QR CODE</div>
        <div style="font-size:11px; font-weight:700;">THANK YOU FOR YOUR VISIT!</div>
        <div style="font-size:9px; color:#555; margin-top:8px;">Powered by GalaxyExpress.pk</div>
      </div>
      <script>window.onload = function() { window.print(); window.close(); }</script>
    </body></html>`;
  }

  return `<!DOCTYPE html><html><head><title>Invoice ${inv.renamedTo||inv.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
    body{font-family:'Inter', sans-serif; color:#1a1a1a; margin:0; padding:60px; line-height: 1.6; background: #fff;}
    .content-wrap { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items:flex-start; margin-bottom: 60px;}
    .logo-box { display: flex; align-items: center; gap: 15px; }
    .logo-icon { width: 50px; height: 50px; background: ${accentColor}; color: #000; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; }
    .brand h1{ color:#000; margin:0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;}
    .brand p { margin: 2px 0; color: #666; font-size: 13px; font-weight: 500; }
    .inv-info { text-align: right; }
    .inv-title { font-size: 40px; font-weight: 800; color: #f3f4f6; margin: 0 0 10px 0; line-height: 0.8; }
    .inv-table-sm th { text-align: left; color: #666; font-size: 11px; text-transform: uppercase; padding: 4px 15px; font-weight: 700; }
    .inv-table-sm td { text-align: right; font-weight: 700; font-size: 14px; padding: 4px 0 4px 15px; }
    .bill-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px; }
    .bill-card { padding: 25px; background: #fafafa; border-radius: 16px; border: 1px solid #f0f0f0; }
    .bill-label { font-size: 10px; color: #999; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    table.items{width:100%; border-collapse:collapse; margin:40px 0;}
    table.items th{ padding: 15px; border-bottom: 2px solid #000; text-align: right; font-size: 11px; font-weight: 800; color: #000; text-transform: uppercase; }
    table.items td{ padding: 18px 15px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px; color: #333; font-weight: 500; }
    table.items th:first-child, table.items td:first-child { text-align: left; font-weight: 700; color: #000; }
    .summary-section { display: flex; justify-content: flex-end; margin-top: 30px; }
    .summary-box { width: 320px; }
    .summary-line { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #444; font-weight: 500; }
    .summary-total { border-top: 2px solid #000; margin-top: 15px; padding-top: 15px; font-size: 22px; font-weight: 800; color: #000; }
    .footer { margin-top: 100px; padding-top: 30px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .footer-text { font-size: 11px; color: #999; max-width: 400px; }
    .status-stamp { padding: 8px 16px; border: 3px solid ${inv.status === 'PAID' ? '#22c55e' : '#ef4444'}; color: ${inv.status === 'PAID' ? '#22c55e' : '#ef4444'}; border-radius: 8px; font-weight: 900; text-transform: uppercase; transform: rotate(-10deg); opacity: 0.6; font-size: 20px; }
  </style>
  </head><body>
  <div class="content-wrap">
    <div class="header">
      <div class="logo-box">
        <div class="logo-icon">GX</div>
        <div class="brand">
          <h1>GalaxyExpress</h1>
          <p>Enterprise Hub, Pakistan</p>
        </div>
      </div>
      <div class="inv-info">
        <div class="inv-title">INVOICE</div>
        <table class="inv-table-sm" style="margin-left:auto;">
          <tr><th>Date</th><td>${fmtDate(inv.issued)}</td></tr>
          <tr><th>REF</th><td>${inv.renamedTo || inv.id}</td></tr>
        </table>
      </div>
    </div>
    <div class="bill-section">
      <div class="bill-card"><div class="bill-label">Billed To</div><div style="font-size:18px; font-weight:800;">${inv.client}</div><div>${inv.email}</div></div>
      <div class="bill-card"><div class="bill-label">From</div><div style="font-weight:700;">GalaxyExpress SaaS</div><div>NTN: 8234791-2</div></div>
    </div>
    <table class="items">
      <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="summary-section">
      <div class="summary-box">
        <div class="summary-line"><span>Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
        <div class="summary-line"><span>Tax (16%)</span><span>${fmt(inv.tax)}</span></div>
        <div class="summary-line summary-total"><span>Total</span><span>${fmt(inv.total)}</span></div>
      </div>
    </div>
    <div class="footer"><div class="footer-text">Generated by GalaxyExpress ERP</div><div class="status-stamp">${inv.status}</div></div>
  </div>
  <script>window.onload = function() { window.print(); window.close(); }</script>
  </body></html>`;
}

// ── Components ──────────────────────────────────────────────────────────────────
function LineItemRow({ item, onChange, onRemove }) {
  return (
    <div className="flex gap-8 items-center" style={{marginBottom:8}}>
      <input className="form-input" style={{flex:3}} placeholder="Description" value={item.desc} onChange={e=>onChange({...item,desc:e.target.value})}/>
      <input className="form-input" style={{width:70}} type="number" min={1} value={item.qty} onChange={e=>onChange({...item,qty:Number(e.target.value)})}/>
      <input className="form-input" style={{width:100}} type="number" min={0} value={item.rate} onChange={e=>onChange({...item,rate:Number(e.target.value)})}/>
      <div style={{minWidth:90,fontWeight:700,textAlign:'right'}}>{fmt(item.qty * item.rate)}</div>
      <button className="btn-icon" onClick={onRemove}><X size={13}/></button>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const [formItems, setFormItems] = useState([{ ...BLANK_ITEM }]);
  const [formClient, setFormClient] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDue, setFormDue] = useState(dueIn(30));
  const [formDiscount, setFormDiscount] = useState(0);

  const filtered = invoices.filter(i => {
     if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
     const s = search.toLowerCase();
     return !s || i.client.toLowerCase().includes(s) || i.id.toLowerCase().includes(s);
  });

  const calcTotals = (items, disc) => {
    const subtotal = items.reduce((s,i)=>s+(i.qty*i.rate),0);
    const tax = Math.round(subtotal * 0.16);
    return { subtotal, tax, total: subtotal + tax - (disc||0) };
  };

  const saveInvoice = () => {
    const { subtotal, tax, total } = calcTotals(formItems, formDiscount);
    const inv = { id: editData?.id || genId('INV', invoices.length+1), client:formClient, email:formEmail, items:formItems, subtotal, tax, discount:formDiscount, total, status:'DRAFT', issued:today(), due:formDue };
    if (editData) setInvoices(prev => prev.map(i => i.id === editData.id ? inv : i));
    else setInvoices(prev => [inv, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><FileText size={20}/> Invoices</div>
        <button className="btn btn-primary btn-sm" onClick={()=>{ setEditData(null); setShowForm(true); }}><Plus size={14}/> New Invoice</button>
      </div>

      <div className="table-wrapper mt-20">
        <table>
          <thead><tr><th>ID</th><th>Client</th><th>Issued</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id}>
                <td style={{fontWeight:700}}>{inv.id}</td>
                <td>{inv.client}</td>
                <td>{inv.issued}</td>
                <td style={{fontWeight:800}}>{fmt(inv.total)}</td>
                <td><span className={`badge ${STATUS_MAP[inv.status]?.badge}`}>{inv.status}</span></td>
                <td>
                  <div className="flex gap-8">
                    <button className="btn-icon" onClick={()=>setSelected(inv)}><Eye size={14}/></button>
                    <button className="btn-icon" onClick={()=> {setEditData(inv); setFormItems(inv.items); setFormClient(inv.client); setFormEmail(inv.email); setShowForm(true); }}><Edit size={14}/></button>
                    <button className="btn-icon" onClick={()=> { const h = buildPrintHTML(inv, 'a4'); const w = window.open(); w.document.write(h); w.document.close(); }}><Printer size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card modal-lg">
            <div className="modal-header">
              <div className="modal-title">{editData ? 'Edit Invoice' : 'Create Invoice'}</div>
              <X cursor="pointer" onClick={()=>setShowForm(false)}/>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group"><label>Client Name</label><input className="form-input" value={formClient} onChange={e=>setFormClient(e.target.value)}/></div>
                <div className="form-group"><label>Email</label><input className="form-input" value={formEmail} onChange={e=>setFormEmail(e.target.value)}/></div>
              </div>
              <div className="mt-20">
                <label className="block mb-10 font-bold">Line Items</label>
                {formItems.map((it, idx) => (
                  <LineItemRow key={idx} item={it} onChange={upd => setFormItems(prev => prev.map((x,i)=>i===idx?upd:x))} onRemove={()=>setFormItems(prev=>prev.filter((_,i)=>i!==idx))}/>
                ))}
                <button className="btn btn-outline btn-sm mt-10" onClick={()=>setFormItems([...formItems, {...BLANK_ITEM}])}>Add Item</button>
              </div>
            </div>
            <div className="modal-footer">
               <button className="btn btn-primary" onClick={saveInvoice}>Save Invoice</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-card modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.id} - {selected.client}</div>
              <X cursor="pointer" onClick={()=>setSelected(null)}/>
            </div>
            <div className="modal-body">
               <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
                 <div><strong>Issued:</strong> {selected.issued}</div>
                 <div><strong>Due:</strong> {selected.due}</div>
               </div>
               <table className="w-full">
                 <thead><tr style={{borderBottom:'1px solid #eee'}}><th style={{textAlign:'left'}}>Desc</th><th>Qty</th><th>Rate</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
                 <tbody>
                   {selected.items.map((it, i) => (
                     <tr key={i} style={{borderBottom:'1px solid #eee'}}>
                       <td style={{padding:'10px 0'}}>{it.desc}</td>
                       <td style={{textAlign:'center'}}>{it.qty}</td>
                       <td style={{textAlign:'center'}}>{fmt(it.rate)}</td>
                       <td style={{textAlign:'right', fontWeight:700}}>{fmt(it.qty*it.rate)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               <div style={{textAlign:'right', marginTop:20, fontSize:'1.1rem'}}>
                  <div>Subtotal: {fmt(selected.subtotal)}</div>
                  <div>Tax: {fmt(selected.tax)}</div>
                  <div style={{fontWeight:900, color:'var(--accent-dark)', fontSize:'1.3rem'}}>Total: {fmt(selected.total)}</div>
               </div>
            </div>
            <div className="modal-footer">
               <button className="btn btn-primary" onClick={()=> { const h = buildPrintHTML(selected, 'a4'); const w = window.open(); w.document.write(h); w.document.close(); }}>Print Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
