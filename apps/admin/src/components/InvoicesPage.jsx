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
  { id:'INV-00004', client:'Spice Route',      email:'spice@route.pk',   items:[{desc:'Platform License',qty:1,rate:5000}],                                                               subtotal:5000,  tax:450,  discount:0,   total:5450,  status:'OVERDUE',  issued:'2026-03-01', due:'2026-03-15', paidOn:null, deletedAt:null, renamedTo:null },
  { id:'INV-00005', client:'Metro Eats',       email:'metro@eats.pk',    items:[{desc:'Setup Fee',qty:1,rate:15000},{desc:'Monthly Plan',qty:1,rate:4900}],                                subtotal:19900, tax:1791, discount:900, total:20791, status:'PARTIAL',  issued:today(), due:dueIn(14), paidOn:null,         deletedAt:null, renamedTo:null },
  { id:'INV-00006', client:'Galaxy Kiosk Ltd', email:'gk@galaxy.pk',     items:[{desc:'Kiosk Hardware Rental',qty:2,rate:8500}],                                                          subtotal:17000, tax:1530, discount:0,   total:18530, status:'DRAFT',    issued:today(), due:dueIn(30), paidOn:null,         deletedAt:null, renamedTo:null },
];

const BLANK_ITEM = { desc:'', qty:1, rate:0 };

// ── Print Invoice HTML ────────────────────────────────────────────────────────────
function buildPrintHTML(inv, mode) {
  const isThermal = mode === 'thermal';
  const rows = inv.items.map(i=>`<tr><td>${i.desc}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${fmt(Number(i.rate))}</td><td style="text-align:right">${fmt(i.qty*i.rate)}</td></tr>`).join('');
  
  if (isThermal) {
    return `<!DOCTYPE html><html><head><title>${inv.renamedTo||inv.id} - Receipt</title>
    <style>
      @page { margin: 0; }
      body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; box-sizing: border-box; background: white; color: black; }
      .center { text-align: center; }
      h2 { margin: 5px 0; font-size: 16px; }
      .divider { border-top: 1px dashed #000; margin: 10px 0; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11px; }
      th, td { text-align: left; padding: 4px 0; }
      .right { text-align: right; }
      .bold { font-weight: bold; }
    </style>
    </head><body>
      <div class="center">
        <h2>★ GalaxyExpress ★</h2>
        <div>NTN: 8234791-2</div>
        <div>Tel: +92-300-1234567</div>
        <div class="divider"></div>
        <div>Receipt #: ${inv.renamedTo||inv.id}</div>
        <div>Date: ${inv.issued}</div>
        <div>Customer: ${inv.client}</div>
      </div>
      <div class="divider"></div>
      <table>
        <thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Total</th></tr></thead>
        <tbody>
          ${inv.items.map(i=>`<tr><td>${i.desc}</td><td class="center">${i.qty}</td><td class="right">${fmt(i.qty*i.rate)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="divider"></div>
      <table>
        <tr><td>Subtotal</td><td class="right">${fmt(inv.subtotal)}</td></tr>
        <tr><td>Tax (9%)</td><td class="right">${fmt(inv.tax)}</td></tr>
        ${inv.discount ? `<tr><td>Discount</td><td class="right">-${fmt(inv.discount)}</td></tr>` : ''}
        <tr><td class="bold">TOTAL DUE</td><td class="right bold" style="font-size:14px;">${fmt(inv.total)}</td></tr>
      </table>
      <div class="divider"></div>
      <div class="center" style="margin-top:10px;">
        <svg width="100" height="40" style="background:#eee; margin-bottom:5px;"></svg>
        <div style="font-size:10px;">Thank you for your business!</div>
        <div style="font-size:9px; margin-top:10px;">Powered by GalaxyERP</div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body></html>`;
  }

  // A4 / PDF Format
  return `<!DOCTYPE html><html><head><title>${inv.renamedTo||inv.id} - Tax Invoice</title>
  <style>
    body{font-family:'Segoe UI',sans-serif;color:#222;margin:40px; line-height: 1.5; background: #fff;}
    .header { display: flex; justify-content: space-between; align-items:flex-start; margin-bottom: 40px; border-bottom:3px solid #39FF14; padding-bottom: 20px;}
    .brand h1{color:#1E4023; margin:0; font-size: 32px; letter-spacing: -1px;}
    .brand p { margin: 2px 0; color: #555; }
    .inv-details th, .inv-details td { text-align: left; padding: 4px; }
    .inv-details th { color: #888; font-weight: normal; }
    .inv-details td { font-weight: bold; }
    table.items{width:100%;border-collapse:collapse;margin:30px 0}
    table.items th, table.items td{padding:12px 16px;border-bottom:1px solid #ddd; text-align:right;}
    table.items th{background:#f4f4f4; color:#444; font-size: 13px; text-transform:uppercase;}
    table.items th:first-child, table.items td:first-child { text-align:left; }
    .total-box { width: 300px; margin-left: auto; border: 1px solid #eee; background: #fafafa; border-radius: 8px; padding: 20px; }
    .total-line { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .super-total { font-size: 1.4rem; font-weight: 800; color: #1E4023; border-top: 2px solid #ddd; padding-top: 12px; margin-top: 12px;}
    .badge{display:inline-block;padding:4px 12px;border-radius:4px;font-size:0.8rem;font-weight:bold;background:#d1fae5;color:#065f46;text-transform:uppercase;}
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 80px; padding-top: 40px; border-top: 1px solid #eee; }
  </style>
  </head><body>
  <div class="header">
    <div class="brand">
      <h1>GalaxyExpress SaaS</h1>
      <p>123 High Street, Business District</p>
      <p>NTN: 8234791-2</p>
      <p>Tel: +92 300 0000000</p>
    </div>
    <div>
      <h2 style="margin:0 0 10px 0; font-size:36px; color:#ddd; text-transform:uppercase; text-align:right;">INVOICE</h2>
      <table class="inv-details">
        <tr><th>Invoice #</th><td>${inv.renamedTo||inv.id}</td></tr>
        <tr><th>Date Issued</th><td>${inv.issued}</td></tr>
        <tr><th>Due Date</th><td>${inv.due}</td></tr>
        <tr><th>Status</th><td><span class="badge">${STATUS_MAP[inv.status].label}</span></td></tr>
      </table>
    </div>
  </div>
  
  <div style="margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-left: 4px solid #1E4023;">
    <p style="margin:0 0 5px 0; color:#666; font-size: 13px; text-transform:uppercase;">Billed To</p>
    <strong style="font-size: 18px;">${inv.client}</strong>
    <p style="margin: 4px 0 0 0; color:#555;">${inv.email}</p>
  </div>

  <table class="items">
    <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th>Unit Rate</th><th>Total Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="total-box">
    <div class="total-line"><span>Subtotal:</span><span>${fmt(inv.subtotal)}</span></div>
    <div class="total-line"><span>Tax (9%):</span><span>${fmt(inv.tax)}</span></div>
    ${inv.discount ? `<div class="total-line"><span>Discount:</span><span style="color:#ef4444;">-${fmt(inv.discount)}</span></div>` : ''}
    <div class="total-line super-total"><span>Total Due:</span><span>${fmt(inv.total)}</span></div>
  </div>

  <div class="footer">
    Thank you for your business. Please remit payment by the due date. <br>
    This is a system-generated PDF tax invoice.
  </div>
  <script>window.onload = function() { window.print(); }</script>
  </body></html>`;
}

// ── Line Item Component ───────────────────────────────────────────────────────
function LineItemRow({ item, onChange, onRemove }) {
  const lineTotal = (item.qty||0) * (item.rate||0);
  return (
    <div className="flex gap-8 items-center" style={{marginBottom:8}}>
      <input className="form-input" style={{flex:3}} placeholder="Description" value={item.desc} onChange={e=>onChange({...item,desc:e.target.value})}/>
      <input className="form-input" style={{width:70}} type="number" min={1} value={item.qty} onChange={e=>onChange({...item,qty:Number(e.target.value)})}/>
      <input className="form-input" style={{width:100}} type="number" min={0} value={item.rate} onChange={e=>onChange({...item,rate:Number(e.target.value)})}/>
      <div style={{minWidth:90,fontWeight:700,color:'var(--accent-dark)',textAlign:'right'}}>{fmt(lineTotal)}</div>
      <button className="btn-icon" onClick={onRemove}><X size={13}/></button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [invoices, setInvoices]       = useState(MOCK_INVOICES);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected]       = useState(null);   // view modal
  const [showForm, setShowForm]       = useState(false);  // create/edit modal
  const [editData, setEditData]       = useState(null);   // editing existing
  const [showRename, setShowRename]   = useState(null);
  const [renameVal, setRenameVal]     = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  // Form state
  const [formItems, setFormItems]    = useState([{ ...BLANK_ITEM }]);
  const [formClient, setFormClient]  = useState('');
  const [formEmail, setFormEmail]    = useState('');
  const [formDue, setFormDue]        = useState(dueIn(30));
  const [formDiscount, setFormDiscount] = useState(0);
  const [formStatus, setFormStatus]  = useState('DRAFT');

  const userRole = (() => { try { return JSON.parse(localStorage.getItem('erp_user'))?.role } catch { return 'CASHIER' } })();
  const isAdmin  = userRole === 'SUPER_ADMIN';

  const activeInvoices  = invoices.filter(i => !i.deletedAt);
  const recycledInvoices = invoices.filter(i =>  i.deletedAt);

  const filtered = activeInvoices.filter(i => {
    if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
    const s = search.toLowerCase();
    return !s || (i.renamedTo||i.id).toLowerCase().includes(s) || i.client.toLowerCase().includes(s) || i.email.toLowerCase().includes(s);
  });

  // ── Calculations ──────────────────────────────────────────────────────────
  const calcTotals = (items, discount=0) => {
    const subtotal = items.reduce((s,i)=>s+(i.qty*i.rate),0);
    const tax      = Math.round(subtotal * 0.09);
    const total    = subtotal + tax - Number(discount||0);
    return { subtotal, tax, total };
  };
  const formTotals = calcTotals(formItems, formDiscount);

  // ── Open Edit ─────────────────────────────────────────────────────────────
  const openEdit = (inv) => {
    setEditData(inv);
    setFormItems(inv.items.map(i=>({...i})));
    setFormClient(inv.client);
    setFormEmail(inv.email);
    setFormDue(inv.due);
    setFormDiscount(inv.discount||0);
    setFormStatus(inv.status);
    setShowForm(true);
    setContextMenu(null);
  };

  const openCreate = () => {
    setEditData(null);
    setFormItems([{ ...BLANK_ITEM }]);
    setFormClient(''); setFormEmail(''); setFormDue(dueIn(30));
    setFormDiscount(0); setFormStatus('DRAFT');
    setShowForm(true);
  };

  // ── Save Invoice ──────────────────────────────────────────────────────────
  const saveInvoice = () => {
    if (!formClient.trim()) return alert('Client name is required');
    const totals = calcTotals(formItems, formDiscount);
    if (editData) {
      setInvoices(prev => prev.map(i => i.id===editData.id
        ? { ...i, client:formClient, email:formEmail, due:formDue, discount:formDiscount, items:formItems, status:formStatus, ...totals }
        : i));
    } else {
      const newId = genId('INV', invoices.length + 1);
      setInvoices(prev => [{
        id:newId, client:formClient, email:formEmail, issued:today(), due:formDue,
        items:formItems, status:formStatus, discount:formDiscount,
        paidOn:null, deletedAt:null, renamedTo:null, ...totals
      }, ...prev]);
    }
    setShowForm(false);
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const duplicateInvoice = (inv) => {
    const newId = genId('INV', invoices.length + 1);
    setInvoices(prev => [{ ...inv, id:newId, status:'DRAFT', issued:today(), due:dueIn(30), paidOn:null, deletedAt:null, renamedTo:null }, ...prev]);
    setContextMenu(null);
  };

  const softDelete = (id) => {
    setInvoices(prev => prev.map(i => i.id===id ? { ...i, deletedAt:new Date().toISOString() } : i));
    setContextMenu(null);
  };

  const restore = (id) => setInvoices(prev => prev.map(i => i.id===id ? { ...i, deletedAt:null } : i));

  const permDelete = (id) => {
    if (!confirm('Permanently delete this invoice? This cannot be undone.')) return;
    setInvoices(prev => prev.filter(i => i.id!==id));
  };

  const renameInvoice = (id) => {
    if (!renameVal.trim()) return;
    setInvoices(prev => prev.map(i => i.id===id ? { ...i, renamedTo:renameVal.trim() } : i));
    setShowRename(null); setRenameVal('');
  };

  const markPaid = (id) => {
    setInvoices(prev => prev.map(i => i.id===id ? { ...i, status:'PAID', paidOn:today() } : i));
    setContextMenu(null);
  };

  const printInvoice = (inv, mode = 'a4') => {
    const html = buildPrintHTML(inv, mode);
    const winProps = mode === 'thermal' ? 'width=400,height=600' : '';
    const w = window.open('', '_blank', winProps);
    if (!w) return alert('Please allow popups to print invoices');
    w.document.write(html);
    w.document.close();
    // window.print() is inside the generated HTML script tag
  };

  const downloadCSV = () => {
    const rows = filtered.map(i=>`${i.renamedTo||i.id},${i.client},${i.status},${i.total},${i.issued},${i.due}`).join('\n');
    const blob = new Blob(['ID,Client,Status,Total,Issued,Due\n'+rows], {type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`invoices_${today()}.csv`; a.click();
  };

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = {
    total:    activeInvoices.length,
    paid:     activeInvoices.filter(i=>i.status==='PAID').reduce((s,i)=>s+i.total,0),
    pending:  activeInvoices.filter(i=>i.status==='SENT'||i.status==='DRAFT').reduce((s,i)=>s+i.total,0),
    overdue:  activeInvoices.filter(i=>i.status==='OVERDUE').length,
  };

  return (
    <div className="fade-in" onClick={()=>setContextMenu(null)}>

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="modal-card modal-xl" onClick={e=>e.stopPropagation()} style={{maxHeight:'90vh',overflowY:'auto'}}>
            <div className="modal-header">
              <div className="modal-title"><FileText size={16}/> {editData?`Edit ${editData.renamedTo||editData.id}`:'New Invoice'}</div>
              <button className="btn-icon" onClick={()=>setShowForm(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group"><label>Client / Business Name</label><input className="form-input" value={formClient} onChange={e=>setFormClient(e.target.value)} placeholder="e.g. Pizza Palace" required/></div>
                <div className="form-group"><label>Client Email</label><input className="form-input" type="email" value={formEmail} onChange={e=>setFormEmail(e.target.value)} placeholder="client@business.com"/></div>
                <div className="form-group"><label>Due Date</label><input className="form-input" type="date" value={formDue} onChange={e=>setFormDue(e.target.value)}/></div>
                <div className="form-group"><label>Status</label>
                  <select className="form-input" value={formStatus} onChange={e=>setFormStatus(e.target.value)}>
                    {Object.keys(STATUS_MAP).map(s=><option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div style={{marginTop:16}}>
                <div className="card-title mb-12">Line Items</div>
                <div className="flex gap-8 mb-8" style={{paddingRight:40}}>
                  <div style={{flex:3,fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:1}}>Description</div>
                  <div style={{width:70,fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:1}}>Qty</div>
                  <div style={{width:100,fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:1}}>Rate (Rs)</div>
                  <div style={{width:90,fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:1,textAlign:'right'}}>Total</div>
                </div>
                {formItems.map((item,idx)=>(
                  <LineItemRow key={idx} item={item}
                    onChange={(updated)=>setFormItems(prev=>prev.map((it,i)=>i===idx?updated:it))}
                    onRemove={()=>setFormItems(prev=>prev.filter((_,i)=>i!==idx))}
                  />
                ))}
                <button className="btn btn-outline btn-sm mt-8" onClick={()=>setFormItems(prev=>[...prev,{...BLANK_ITEM}])}>
                  <Plus size={13}/> Add Line Item
                </button>
              </div>

              {/* Totals */}
              <div style={{background:'var(--bg-input)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',padding:16,marginTop:16}}>
                <div className="flex justify-between items-center mb-8" style={{fontSize:'0.9rem'}}>
                  <span className="text-muted">Subtotal</span>
                  <span style={{fontWeight:600}}>{fmt(formTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-8" style={{fontSize:'0.9rem'}}>
                  <span className="text-muted">Tax (9%)</span>
                  <span style={{fontWeight:600}}>{fmt(formTotals.tax)}</span>
                </div>
                <div className="flex justify-between items-center mb-8" style={{fontSize:'0.9rem'}}>
                  <span className="text-muted">Discount (Rs)</span>
                  <input className="form-input" type="number" style={{width:120,textAlign:'right'}} value={formDiscount} onChange={e=>setFormDiscount(Number(e.target.value))}/>
                </div>
                <div className="flex justify-between items-center" style={{fontWeight:800,fontSize:'1.1rem',borderTop:'1px solid var(--border-color)',paddingTop:10}}>
                  <span>Total Due</span>
                  <span style={{color:'var(--accent-dark)'}}>{fmt(formTotals.total)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowForm(false)}>Cancel</button>
              <button className="btn btn-outline btn-sm" onClick={()=>{ saveInvoice(); }}><FileText size={13}/> Save as Draft</button>
              <button className="btn btn-primary" onClick={saveInvoice}><Check size={14}/> {editData?'Update Invoice':'Create Invoice'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Detail Modal ── */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-card modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.renamedTo||selected.id}</div>
                <div className="text-muted text-sm">{selected.client} · {selected.email}</div>
              </div>
              <button className="btn-icon" onClick={()=>setSelected(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2 mb-16">
                <div className="glass-card"><div className="text-muted text-xs mb-8">Status</div><span className={`badge ${STATUS_MAP[selected.status]?.badge}`}>{STATUS_MAP[selected.status]?.label}</span></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Total Due</div><div style={{fontWeight:800,fontSize:'1.2rem',color:'var(--accent-dark)'}}>{fmt(selected.total)}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Issue Date</div><div style={{fontWeight:600}}>{selected.issued}</div></div>
                <div className="glass-card"><div className="text-muted text-xs mb-8">Due Date</div><div style={{fontWeight:600,color:selected.status==='OVERDUE'?'var(--neon-red)':'inherit'}}>{selected.due}</div></div>
              </div>

              {/* Items Table */}
              <div className="table-wrapper" style={{marginBottom:16}}>
                <table>
                  <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
                  <tbody>
                    {selected.items.map((it,i)=>(
                      <tr key={i}>
                        <td style={{fontWeight:600}}>{it.desc}</td>
                        <td>{it.qty}</td>
                        <td>{fmt(it.rate)}</td>
                        <td style={{fontWeight:700}}>{fmt(it.qty*it.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{textAlign:'right',padding:'0 4px'}}>
                <div className="text-muted text-sm mb-4">Subtotal: {fmt(selected.subtotal)}</div>
                <div className="text-muted text-sm mb-4">Tax (9%): {fmt(selected.tax)}</div>
                {selected.discount>0 && <div className="text-muted text-sm mb-4">Discount: -{fmt(selected.discount)}</div>}
                <div style={{fontWeight:800,fontSize:'1.1rem',color:'var(--accent-dark)'}}>Total: {fmt(selected.total)}</div>
                {selected.paidOn && <div style={{color:'var(--neon-green)',fontWeight:600,fontSize:'0.82rem',marginTop:6}}>✅ Paid on {selected.paidOn}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setSelected(null)}>Close</button>
              <button className="btn btn-outline btn-sm" onClick={()=>printInvoice(selected)}><Printer size={13}/> Print</button>
              <button className="btn btn-cyan btn-sm" onClick={()=>printInvoice(selected)}><Download size={13}/> Download PDF</button>
              {selected.status!=='PAID' && <button className="btn btn-primary btn-sm" onClick={()=>{markPaid(selected.id);setSelected(null);}}><Check size={13}/> Mark as Paid</button>}
            </div>
          </div>
        </div>
      )}

      {/* ── Rename Modal ── */}
      {showRename && (
        <div className="modal-overlay" onClick={()=>setShowRename(null)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()} style={{maxWidth:420}}>
            <div className="modal-header">
              <div className="modal-title"><Pencil size={16}/> Rename Invoice</div>
              <button className="btn-icon" onClick={()=>setShowRename(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current ID</label>
                <input className="form-input" value={showRename.renamedTo||showRename.id} readOnly style={{opacity:0.5}}/>
              </div>
              <div className="form-group">
                <label>New Name / Label</label>
                <input className="form-input" value={renameVal} onChange={e=>setRenameVal(e.target.value)} placeholder="e.g. Pizza-Palace-Q1-2026" autoFocus/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setShowRename(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>renameInvoice(showRename.id)}>Rename</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Recycle Bin (Admin Only) ── */}
      {showRecycleBin && isAdmin && (
        <div className="modal-overlay" onClick={()=>setShowRecycleBin(false)}>
          <div className="modal-card modal-xl" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title"><Trash2 size={16}/> Recycle Bin — Invoices ({recycledInvoices.length})</div>
              <button className="btn-icon" onClick={()=>setShowRecycleBin(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              {recycledInvoices.length === 0 ? (
                <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
                  <Trash2 size={40} style={{opacity:0.3,marginBottom:12}}/><div>Recycle Bin is empty</div>
                </div>
              ) : (
                <div className="table-wrapper" style={{border:'none'}}>
                  <table>
                    <thead><tr><th>Invoice</th><th>Client</th><th>Total</th><th>Deleted At</th><th>Actions</th></tr></thead>
                    <tbody>
                      {recycledInvoices.map(i=>(
                        <tr key={i.id}>
                          <td style={{fontWeight:700,fontFamily:'monospace'}}>{i.renamedTo||i.id}</td>
                          <td>{i.client}</td>
                          <td style={{fontWeight:700}}>{fmt(i.total)}</td>
                          <td className="text-muted text-sm">{new Date(i.deletedAt).toLocaleString()}</td>
                          <td>
                            <div className="flex gap-4">
                              <button className="btn btn-sm btn-green" onClick={()=>restore(i.id)}><RotateCcw size={12}/> Restore</button>
                              <button className="btn btn-sm btn-red"   onClick={()=>permDelete(i.id)}><Trash2 size={12}/> Delete Forever</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="section-header">
        <div className="section-title"><FileText size={20}/> Invoices</div>
        <div className="flex gap-8">
          {isAdmin && recycledInvoices.length > 0 && (
            <button className="btn btn-sm btn-red" onClick={()=>setShowRecycleBin(true)}>
              <Trash2 size={13}/> Recycle Bin ({recycledInvoices.length})
            </button>
          )}
          <button className="btn btn-sm btn-green" onClick={downloadCSV}><Download size={13}/> Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14}/> New Invoice</button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="stat-grid mb-20">
        <div className="stat-card purple">
          <div className="stat-card-header"><div className="stat-icon purple"><FileText size={19}/></div></div>
          <div className="stat-value">{kpis.total}</div><div className="stat-label">Total Invoices</div>
        </div>
        <div className="stat-card green">
          <div className="stat-card-header"><div className="stat-icon green"><CheckCircle size={19}/></div><span className="stat-trend up">Paid</span></div>
          <div className="stat-value">{fmt(kpis.paid)}</div><div className="stat-label">Revenue Collected</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-card-header"><div className="stat-icon orange"><Clock size={19}/></div></div>
          <div className="stat-value">{fmt(kpis.pending)}</div><div className="stat-label">Pending Amount</div>
        </div>
        <div className="stat-card red" style={{'--red-card':'rgba(239,68,68,0.08)'}}>
          <div className="stat-card-header"><div className="stat-icon red"><XCircle size={19}/></div></div>
          <div className="stat-value">{kpis.overdue}</div><div className="stat-label">Overdue Invoices</div>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="tabs mb-20">
        {['ALL',...Object.keys(STATUS_MAP)].map(s=>(
          <button key={s} className={`tab ${statusFilter===s?'active':''}`} onClick={()=>setStatusFilter(s)}>
            {s==='ALL'?'All':STATUS_MAP[s]?.label}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="filter-bar">
        <div style={{position:'relative'}}>
          <Search size={14} style={{position:'absolute',left:10,top:10,color:'var(--text-light)'}}/>
          <input className="filter-input" style={{paddingLeft:30}} placeholder="Search invoice, client…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Invoice</th><th>Client</th><th>Issued</th><th>Due</th>
              <th>Subtotal</th><th>Tax</th><th>Discount</th><th>Total</th>
              <th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map(inv=>(
              <tr key={inv.id}>
                <td style={{fontWeight:700,fontFamily:'monospace'}}>
                  {inv.renamedTo
                    ? <><span style={{color:'var(--accent-dark)'}}>{inv.renamedTo}</span><br/><span className="text-xs text-muted">{inv.id}</span></>
                    : inv.id}
                </td>
                <td>
                  <div style={{fontWeight:600}}>{inv.client}</div>
                  <div className="text-xs text-muted">{inv.email}</div>
                </td>
                <td className="text-muted text-sm">{inv.issued}</td>
                <td className="text-sm" style={{color:inv.status==='OVERDUE'?'var(--neon-red)':'inherit',fontWeight:inv.status==='OVERDUE'?700:400}}>{inv.due}</td>
                <td className="text-sm">{fmt(inv.subtotal)}</td>
                <td className="text-sm text-muted">{fmt(inv.tax)}</td>
                <td className="text-sm text-muted">{inv.discount>0?`-${fmt(inv.discount)}`:'—'}</td>
                <td style={{fontWeight:800,color:'var(--accent-dark)'}}>{fmt(inv.total)}</td>
                <td><span className={`badge ${STATUS_MAP[inv.status]?.badge}`}>{STATUS_MAP[inv.status]?.label}</span></td>
                <td>
                  <div className="flex gap-4" style={{position:'relative'}}>
                    <button className="btn-icon" title="View" onClick={()=>setSelected(inv)}><Eye size={13}/></button>
                    <button className="btn-icon" title="More" onClick={e=>{e.stopPropagation();setContextMenu(contextMenu===inv.id?null:inv.id);}}>
                      <MoreHorizontal size={13}/>
                    </button>

                    {contextMenu===inv.id && (
                      <div onClick={e=>e.stopPropagation()} style={{
                        position:'absolute',right:0,top:36,zIndex:60,
                        background:'var(--bg-card)',border:'1px solid var(--border-color)',
                        borderRadius:'var(--radius-md)',padding:6,minWidth:200,
                        boxShadow:'var(--shadow-lg)',animation:'fadeIn 0.15s ease'
                      }}>
                        <div style={ctxStyle} onClick={()=>duplicateInvoice(inv)}><Copy size={13}/> Duplicate</div>
                        <div style={ctxStyle} onClick={()=>openEdit(inv)}><Edit size={13}/> Edit Invoice</div>
                        <div style={ctxStyle} onClick={()=>{setShowRename(inv);setRenameVal(inv.renamedTo||'');setContextMenu(null);}}><Pencil size={13}/> Rename</div>
                        <div style={ctxStyle} onClick={()=>printInvoice(inv, 'a4')}><Printer size={13}/> Print A4 / Save PDF</div>
                        <div style={ctxStyle} onClick={()=>printInvoice(inv, 'thermal')}><FileText size={13}/> Print Thermal (80mm)</div>
                        {inv.status!=='PAID' && <div style={{...ctxStyle,color:'var(--neon-green)'}} onClick={()=>markPaid(inv.id)}><Check size={13}/> Mark as Paid</div>}
                        <div style={{...ctxStyle,color:'var(--neon-red)',borderTop:'1px solid var(--border-color)',marginTop:4,paddingTop:8}} onClick={()=>softDelete(inv.id)}>
                          <Trash2 size={13}/> Move to Recycle Bin
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="10" className="table-empty">No invoices found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ctxStyle = {
  display:'flex',alignItems:'center',gap:8,padding:'8px 12px',
  borderRadius:6,cursor:'pointer',fontSize:'0.82rem',fontWeight:500,
  color:'var(--text-muted)',transition:'background 0.15s',
};
