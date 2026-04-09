import React, { useState, useEffect } from 'react';
import {
  Store, Package, ShoppingCart, BarChart3, Settings, LogOut,
  Plus, Edit, Trash2, CheckCircle, Clock, Bell, DollarSign, Target, Menu, X, Star, MessageSquare, Send, PhoneCall, Info, Paperclip,
  Users2, UserCheck, Calendar, Printer, Moon, Sun, Loader2, Workflow, BookOpen, Receipt, Building, Layers, Search, RefreshCw, ClipboardCheck, Image
} from 'lucide-react';
import MasterConfiguration from './components/MasterConfiguration.jsx';
import InventoryERP from './components/InventoryERP.jsx';
import AccountsERP from './components/AccountsERP.jsx';
import DailyClosingERP from './components/DailyClosingERP.jsx';
import LoginPage from '../../../shared/LoginPage.jsx';

export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [vendor, setVendor] = useState(null); 
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [reportTab, setReportTab] = useState('gallery');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('vendor_dark') !== 'false');
  const [toastMessage, setToastMessage] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [activeOutletId, setActiveOutletId] = useState(null);

  // Auth & Initial Data Link
  useEffect(() => {
    const savedUser = localStorage.getItem('erp_user');
    const token = localStorage.getItem('erp_token');
    if (savedUser && token) {
      const u = JSON.parse(savedUser);
      setVendor(u);
      setCurrentUser({
        id: u.id, name: u.name, role: u.role,
        permissions: ['SUPER_ADMIN', 'VENDOR_ADMIN'].includes(u.role) ? ['ALL'] : ['pos', 'orders']
      });
    }
  }, []);

  const fetchOutlets = async () => {
    if (!vendor) return;
    try {
      const res = await fetch(`${API}/api/outlets`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setOutlets(data);
        setActiveOutletId(data[0].id);
      }
    } catch (e) { console.error('Outlets sync error', e); }
  };

  useEffect(() => { if (vendor) fetchOutlets(); }, [vendor]);

  if (!vendor) {
    return (
      <LoginPage 
        title="Vendor ERP Node" 
        subtitle="Access your business control center" 
        icon="🚀" 
        allowedRoles={['VENDOR_ADMIN', 'SUPER_ADMIN', 'MANAGER']}
        onSuccess={(data) => {
          setVendor(data.user);
          setCurrentUser({
            id: data.user.id, name: data.user.name, role: data.user.role,
            permissions: ['SUPER_ADMIN', 'VENDOR_ADMIN'].includes(data.user.role) ? ['ALL'] : ['pos', 'orders']
          });
        }}
      />
    );
  }

  const hasPerm = (p) => currentUser?.permissions?.includes('ALL') || currentUser?.permissions?.includes(p);

  // Communication & POS State
  const [activeChat, setActiveChat] = useState('c-1');
  const [chatInput, setChatInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [posCart, setPosCart] = useState([]);
  const [posType, setPosType] = useState('Takeaway');
  
  const [posDiscount, setPosDiscount] = useState({ type: 'amount', value: 0 });
  const [fpCode, setFpCode] = useState('');
  const [riderAssigned, setRiderAssigned] = useState('');
  const [posCustomer, setPosCustomer] = useState('Walk-in Customer');
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [isSalesReturn, setIsSalesReturn] = useState(false);
  const [posServiceCharge, setPosServiceCharge] = useState(0);
  const [posTaxRate, setPosTaxRate] = useState(16);
  const [posBillSplit, setPosBillSplit] = useState(1);
  const [deliveryCustomer, setDeliveryCustomer] = useState({ name: '', phone: '', address: '' });

  // A4 / Thermal Print System For POS
  const triggerPOSPrint = (mode = 'thermal') => {
    let subtotal = posCart.reduce((s, c) => s + (c.price * c.qty), 0);
    let discountAmt = posDiscount.type === 'amount' ? Number(posDiscount.value) : (subtotal * (Number(posDiscount.value) / 100));
    let taxable = subtotal - discountAmt;
    let tax = Math.round(taxable * 0.16);
    let grandTotal = taxable + tax;

    // Reverse for Sales Return
    if (isSalesReturn) { grandTotal = -grandTotal; subtotal = -subtotal; tax = -tax; discountAmt = -discountAmt; }

    const invId = `${isSalesReturn ? 'RET' : 'INV'}-${Math.floor(Math.random() * 90000) + 10000}`;
    const date = new Date().toLocaleString();
    let html = '';

    const getMetaHeader = () => {
      if (posType === 'Foodpanda') return `(#${fpCode})`;
      if (posType === 'Delivery') return `(Rider: ${riderAssigned || 'Pending'})`;
      return '';
    };

    if (mode === 'thermal') {
      html = `<!DOCTYPE html><html><head><title>Receipt</title>
      <style>body{font-family:'Courier New',monospace; font-size:12px; margin:0; padding:10px; width:80mm;} .center{text-align:center;} .divider{border-top:1px dashed #000; margin:8px 0;} table{width:100%;font-size:11px;} .right{text-align:right;} th{text-align:left;}</style>
      </head><body>
      <div class="center"><h2>★ ${vendor?.name || 'GALAXY EXPRESS'} ★</h2>
      ${isSalesReturn ? '<h3 style="margin:0;color:red;">*** SALES RETURN ***</h3>' : ''}
      <div>Receipt #: ${invId}</div><div>Date: ${date}</div><div>Type: ${posType} ${getMetaHeader()}</div><div>Customer: ${posCustomer}</div></div>
      <div class="divider"></div>
      <table><thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Total</th></tr></thead><tbody>
      ${posCart.map(c => `<tr><td>${c.name}</td><td class="center">${c.qty}</td><td class="right">${isSalesReturn ? '-' : ''}${c.qty * c.price}</td></tr>`).join('')}
      </tbody></table>
      <div class="divider"></div>
      <table>
        <tr><td>Subtotal</td><td class="right">${subtotal}</td></tr>
        ${discountAmt != 0 ? `<tr><td>Discount</td><td class="right">-${Math.abs(discountAmt)}</td></tr>` : ''}
        <tr><td>Tax (16%)</td><td class="right">${tax}</td></tr>
        <tr><td style="font-weight:bold;font-size:14px;">TOTAL</td><td class="right" style="font-weight:bold;font-size:14px;">${grandTotal}</td></tr>
      </table>
      <div class="divider"></div><div class="center">${isSalesReturn ? 'Return Processed' : 'Thank you!'} Powered by GalaxyERP</div>
      <script>window.onload=function(){window.print();}</script></body></html>`;
    } else {
      // A4
      html = `<!DOCTYPE html><html><head><title>Tax Invoice</title>
      <style>body{font-family:sans-serif; margin:40px;} .header{border-bottom:3px solid #39FF14; padding-bottom:20px; margin-bottom:30px; display:flex; justify-content:space-between;} table{width:100%; border-collapse:collapse;} th,td{padding:10px; border-bottom:1px solid #eee; text-align:left;} .right{text-align:right;}</style>
      </head><body>
      <div class="header"><div><h1 style="color:#1E4023;margin:0;">${vendor?.name || 'GALAXY EXPRESS ERP'}</h1><p>${isSalesReturn ? 'Credit Note / Return' : 'Tax Invoice'} - ${posType}</p></div>
      <div class="right"><h2 style="${isSalesReturn ? 'color:red;' : ''}">${isSalesReturn ? 'SALES RETURN' : 'INVOICE'}</h2><p>${invId}<br>${date}</p></div></div>
      <div style="margin-bottom:30px;"><b>Billed To:</b><br>${posCustomer} <br>${getMetaHeader()}</div>
      <table><thead><tr><th>Description</th><th>Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead><tbody>
      ${posCart.map(c => `<tr><td>${c.name}</td><td>${c.qty}</td><td class="right">${c.price}</td><td class="right">${isSalesReturn ? '-' : ''}${c.qty * c.price}</td></tr>`).join('')}
      </tbody></table>
      <div style="width:300px; margin-left:auto; margin-top:30px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Subtotal:</span><span>${subtotal}</span></div>
        ${discountAmt != 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Discount:</span><span>-${Math.abs(discountAmt)}</span></div>` : ''}
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>Tax (16%):</span><span>${tax}</span></div>
        <div style="display:flex; justify-content:space-between; font-size:1.5em; font-weight:bold; border-top:2px solid #000; padding-top:10px; color:${isSalesReturn ? 'red' : 'inherit'};"><span>Total:</span><span>Rs ${grandTotal}</span></div>
      </div>
      <script>window.onload=function(){window.print();}</script></body></html>`;
    }

    const winProps = mode === 'thermal' ? 'width=400,height=600' : '';
    const w = window.open('', '_blank', winProps);
    w.document.write(html);
    w.document.close();

    const orderMeta = posType === 'Delivery' 
      ? { customer: deliveryCustomer.name, contact: deliveryCustomer.phone, address: deliveryCustomer.address } 
      : posType === 'Dine-In' 
      ? { customer: 'Dine-In Guest', table: posCustomer } 
      : { customer: 'Walk-in Customer' };

    const newOrder = {
      id: invId,
      customer: orderMeta.customer,
      contact: orderMeta.contact || '',
      table: orderMeta.table || null,
      address: orderMeta.address || '',
      items: posCart.map(c => `${c.qty}x ${c.name}`).join(', '),
      total: grandTotal,
      status: isSalesReturn ? 'refunded' : 'new',
      time: new Date().toLocaleTimeString(),
      source: posType
    };

    setOrders(prev => [newOrder, ...prev]);

    // Send silently to Backend API
    fetch(`${API}/api/pos/orders`, {
       method: 'POST',
       headers: { 
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('erp_token')}`
       },
       body: JSON.stringify({ 
         outletId: activeOutletId,
         type: posType.toUpperCase().replace('DINE-IN', 'DINE_IN'),
         totalAmount: grandTotal,
         items: posCart.map(c => ({
           productId: c.id,
           quantity: c.qty,
           unitPrice: c.price
         })),
         payments: [{
           method: 'CASH',
           amount: grandTotal,
           status: 'PAID'
         }],
         tableId: posType === 'Dine-In' ? posCustomer : null,
         deliveryAddress: posType === 'Delivery' ? deliveryCustomer.address : null
       })
    }).then(res => {
      if (res.ok) fetchOrders();
    }).catch(e => console.error("Could not post order.", e));

    setPosCart([]);
    setCheckoutModal(false);
    setIsSalesReturn(false);
    setPosDiscount({ type: 'amount', value: 0 });
    showToast(isSalesReturn ? 'Sales Return Approved & Posted!' : 'Order Saved & Printed!');
  };

  // Responsive listener
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Persist dark mode & toggle body class
  useEffect(() => {
    localStorage.setItem('vendor_dark', darkMode);
    document.body.classList.toggle('dark', darkMode);
    document.body.classList.toggle('light', !darkMode);
  }, [darkMode]);

  const theme = {
    bg: darkMode ? '#020817' : '#f1f5f9',
    card: darkMode ? '#0f172a' : 'white',
    text: darkMode ? '#f8fafc' : '#0f172a',
    muted: darkMode ? '#94a3b8' : '#64748b',
    border: darkMode ? '#1e293b' : '#e2e8f0',
    navBg: darkMode ? '#020817' : 'white'
  };

  // Theme-aware style helpers
  const tabBtn = (isActive) => ({
    background: isActive ? '#8de02c' : theme.card,
    color: isActive ? '#000' : theme.muted,
    border: `1px solid ${theme.border}`,
    padding: '8px 20px', borderRadius: 20, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.2s'
  });
  const cardBg = { background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}` };
  const theadBg = { background: theme.bg, color: theme.muted, fontSize: '0.85rem' };
  const trBdr = { borderTop: `1px solid ${theme.border}` };
  const actBtn = { background: darkMode ? '#1e293b' : '#0f172a', color: darkMode ? '#f8fafc' : 'white', border: 'none', padding: '8px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600 };

  const handleGenerateLiveReport = (type) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewMode(type);
    }, 1500);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [tables, setTables] = useState([]);
  
  const fetchTablesData = async () => {
    if (!vendor) return;
    try {
      const res = await fetch(`${API}/api/tables?tenantId=${vendor.id}`);
      if (res.ok) {
        const data = await res.json();
        setTables((Array.isArray(data) ? data : []).map(t => ({
          id: t.id,
          label: t.name,
          status: 'available',
          orderId: null,
          guests: 0
        })));
      }
    } catch(e) {}
  };
  
  useEffect(() => { if(vendor) fetchTablesData(); }, [vendor]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [reprintOrderId, setReprintOrderId] = useState(null);

  const assignTable = (tableId, orderId) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied', orderId, guests: 2 } : t));
    showToast(`Order ${orderId} assigned to ${tableId}`);
  };
  const clearTable = (tableId) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'available', orderId: null, guests: 0 } : t));
    showToast(`${tableId} cleared & available`);
  };

  const [orders, setOrders] = useState([]);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);

  useEffect(() => {
    if (vendor) localStorage.setItem('vendor_auth', JSON.stringify(vendor));
    else localStorage.removeItem('vendor_auth');
  }, [vendor]);

  // Live Data Synchronization
  const fetchOrders = async () => {
    if (!vendor) return;
    setIsFetchingOrders(true);
    try {
      const res = await fetch(`${API}/api/pos/orders${activeOutletId ? `?outletId=${activeOutletId}` : ''}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data.map(o => ({
            id: o.id,
            customer: o.customerInfo?.name || 'Walk-in',
            contact: o.customerInfo?.phone || '',
            items: o.items?.map(i => `${i.quantity}x ${i.product?.name || 'Item'}`).join(', '),
            total: o.totalAmount,
            status: o.status.toLowerCase(),
            time: new Date(o.createdAt).toLocaleTimeString(),
            source: o.type
          })));
        }
      }
    } catch (e) {
      console.error("Order fetch error", e);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  useEffect(() => {
    let alive = true;
    if (vendor && alive) fetchOrders();
    const interval = setInterval(() => { if (vendor && alive) fetchOrders(); }, 5000);
    return () => { alive = false; clearInterval(interval); };
  }, [vendor]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setProcessingId(orderId);

    // Optimistic UI Update
    const originalOrders = [...orders];
    setOrders(p => p.map(x => x.id === orderId ? { ...x, status: newStatus } : x));

    try {
      const res = await fetch(`${API}/api/pos/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('erp_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('API Error');
      showToast(`Order status updated to ${newStatus}`);
      fetchOrders(); // Sync with actual source of truth
    } catch (e) {
      // Revert if failed
      setOrders(originalOrders);
      showToast(`Error updating order. Check connection.`);
    } finally {
      setProcessingId(null);
    }
  };

  const [products, setProducts] = useState([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [productModal, setProductModal] = useState({ show: false, mode: 'add', data: null });

  const fetchProducts = async () => {
    if (!vendor) return;
    setIsFetchingProducts(true);
    try {
      const res = await fetch(`${API}/api/pos/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  useEffect(() => { if (vendor) fetchProducts(); }, [vendor]);

  const handleDeleteProduct = async (id) => {
    const backup = [...products];
    setProducts(products.filter(p => p.id !== id));
    showToast('Product deleted from view (Optimistic update)');
    try {
      await fetch(`${API}/products/${id}?tenantId=${vendor.id}`, { method: 'DELETE' });
    } catch (e) {
      showToast('API issue, but UI handled optimistically');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newProd = {
      id: productModal.mode === 'add' ? `P-${Date.now()}` : productModal.data.id,
      name: fd.get('name'),
      price: Number(fd.get('price')),
      category: fd.get('category'),
      stock: fd.get('stock')
    };

    setProductModal({ show: false, mode: 'add', data: null });
    const backup = [...products];

    if (productModal.mode === 'add') {
      setProducts([newProd, ...products]);
      showToast('Product added successfully!');
    } else {
      setProducts(products.map(p => p.id === newProd.id ? newProd : p));
      showToast('Product updated!');
    }

    try {
      await fetch(`${API}/products${productModal.mode === 'edit' ? `/${newProd.id}` : ''}`, {
        method: productModal.mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProd, tenantId: vendor.id })
      });
    } catch (e) {
      // Optimistic updates keep the UI feeling live even if backend route is missing
    }
  };

  const [reviews, setReviews] = useState([]);
  const [applications, setApplications] = useState([]);

  if (!vendor) {
    return <LoginPage 
             title="ERP Vendor Portal" 
             subtitle="erp.galaxyexpress.pk" 
             icon={<Store size={48} color="#8de02c" />} 
             onSuccess={(data) => setVendor({ ...data.user, id: data.user.tenantId || data.user.id })} 
             allowedRoles={['VENDOR', 'VENDOR_ADMIN', 'SUPER_ADMIN', 'CASHIER']} 
           />;
  }

  // --- REPORT PREVIEW MODAL (INVOICE / FAST PRINT) ---
  const renderPreviewBox = () => {
    if (!previewMode) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, overflowY: 'auto' }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; margin: 0 !important; padding: 0 !important;}
            @page { size: A4; margin: 20mm; }
          }
        `}</style>
        <div className="no-print" style={{ width: '100%', maxWidth: 850, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{previewMode === 'purchase' ? 'Purchase Report Preview' : 'Sales V/S Consumption Analysis'}</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ background: 'white', color: 'black', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => window.print()}><Printer size={16} /> Print A4</button>
            <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }} onClick={() => setPreviewMode(null)}>Close Preview</button>
          </div>
        </div>

        {/* A4 Document Area */}
        <div className="print-area" style={{ background: 'white', width: '100%', maxWidth: 816, minHeight: 1056, padding: 40, borderRadius: 8, color: '#000', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontFamily: 'Arial, sans-serif' }}>

          <div style={{ borderBottom: '2px solid #000', paddingBottom: 16, marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase' }}>GALAXY EXPRESS (PRIVATE) LIMITED</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#444' }}>VENDOR: {vendor?.name.toUpperCase()} (ID: {vendor?.id})</p>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', background: '#f1f5f9', display: 'inline-block', padding: '6px 16px', border: '1px solid #000' }}>
              {previewMode === 'purchase' ? 'Party Wise Items Detailed Purchase Report' : 'Department Wise Sales V/S Consumption'}
            </h2>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 8 }}>FROM : 06/04/2026 TO: 06/04/2026</div>
          </div>

          {previewMode === 'purchase' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' }}>
                  <th style={{ padding: '8px 4px', textAlign: 'left' }}>ITEM DESCRIPTION</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>UOM</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>QTY</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>RATE</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={5} style={{ fontWeight: 800, padding: '12px 4px 4px' }}>HAFIZ TRADER</td></tr>
                <tr>
                  <td style={{ padding: '4px' }}>BEEF MINCE</td><td style={{ textAlign: 'center' }}>KG</td><td style={{ textAlign: 'right' }}>10.000</td><td style={{ textAlign: 'right' }}>1,350.00</td><td style={{ textAlign: 'right' }}>13,500.00</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px' }}>CHICKEN BONELESS</td><td style={{ textAlign: 'center' }}>KG</td><td style={{ textAlign: 'right' }}>30.000</td><td style={{ textAlign: 'right' }}>724.00</td><td style={{ textAlign: 'right' }}>21,720.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td colSpan={4} style={{ textAlign: 'right', fontWeight: 800, padding: '8px 4px' }}>HAFIZ TRADER TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 800, padding: '8px 4px' }}>35,220.00</td></tr>

                <tr><td colSpan={5} style={{ fontWeight: 800, padding: '12px 4px 4px' }}>NAZIR MILK SHOP</td></tr>
                <tr>
                  <td style={{ padding: '4px' }}>MILK, FRESH</td><td style={{ textAlign: 'center' }}>LTR</td><td style={{ textAlign: 'right' }}>56.000</td><td style={{ textAlign: 'right' }}>200.00</td><td style={{ textAlign: 'right' }}>11,200.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td colSpan={4} style={{ textAlign: 'right', fontWeight: 800, padding: '8px 4px' }}>NAZIR MILK SHOP TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 800, padding: '8px 4px' }}>11,200.00</td></tr>
              </tbody>
            </table>
          )}

          {previewMode === 'consumption' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000', background: '#f8fafc' }}>
                  <th style={{ padding: '8px 4px', textAlign: 'left' }}>CODE</th>
                  <th style={{ padding: '8px 4px', textAlign: 'left' }}>DEPARTMENT NAME</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>SALES (RS)</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>CONSUMPTION (RS)</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>% VARIANCE</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '8px 4px' }}>603</td><td style={{ padding: '8px 4px' }}>B.B.Q & GRILL</td><td style={{ textAlign: 'right' }}>485,200</td><td style={{ textAlign: 'right' }}>352,726</td><td style={{ textAlign: 'right' }}>27.3%</td>
                </tr>
                <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '8px 4px' }}>607</td><td style={{ padding: '8px 4px' }}>DESSERT & SWEETS</td><td style={{ textAlign: 'right' }}>89,400</td><td style={{ textAlign: 'right' }}>39,648</td><td style={{ textAlign: 'right' }}>55.6%</td>
                </tr>
                <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '8px 4px' }}>601</td><td style={{ padding: '8px 4px' }}>FAST FOOD</td><td style={{ textAlign: 'right' }}>150,000</td><td style={{ textAlign: 'right' }}>90,000</td><td style={{ textAlign: 'right' }}>40.0%</td>
                </tr>
                <tr><td colSpan={5} style={{ padding: '20px 4px' }}></td></tr>
                <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                  <td colSpan={2} style={{ textAlign: 'right', fontWeight: 900, padding: '10px 4px' }}>GRAND TOTAL :</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, padding: '10px 4px' }}>724,600</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, padding: '10px 4px' }}>482,374</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, padding: '10px 4px' }}>33.4%</td>
                </tr>
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <div>Printed on: {new Date().toLocaleString()}</div>
            <div>Generated by GalaxyERP Reporting Engine v2</div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, color: theme.text, fontFamily: 'system-ui, sans-serif' }}>
      {renderPreviewBox()}
      {/* PRODUCT MODAL */}
      {productModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(16px)' }}>
          <div style={{ background: theme.card, padding: 32, borderRadius: 24, width: '100%', maxWidth: 460, border: `1px solid ${theme.border}`, animation: 'floatIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0 }}>{productModal.mode === 'add' ? 'Create Product' : 'Edit Product'}</h2>
              <X cursor="pointer" onClick={() => setProductModal({ show: false })} />
            </div>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: theme.muted }}>Product Name</label>
                <input required name="name" defaultValue={productModal.data?.name || ''} style={{ width: '100%', padding: '12px 16px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: theme.muted }}>Price (Rs)</label>
                  <input required type="number" name="price" defaultValue={productModal.data?.price || ''} style={{ width: '100%', padding: '12px 16px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: theme.muted }}>Category</label>
                  <input required name="category" defaultValue={productModal.data?.category || ''} placeholder="e.g. Pizza" style={{ width: '100%', padding: '12px 16px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: theme.muted }}>Stock Status</label>
                <select name="stock" defaultValue={productModal.data?.stock || 'In Stock'} style={{ width: '100%', padding: '12px 16px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12 }}>
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: 16, marginTop: 10, background: '#39FF14', color: '#000', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
                {productModal.mode === 'add' ? 'Save Product' : 'Update Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REAL-TIME TOAST */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 30, right: 30, background: '#39FF14', color: '#000', padding: '16px 24px', borderRadius: 12, fontWeight: 800, zIndex: 9999, boxShadow: '0 10px 30px rgba(57,255,20,0.3)', animation: 'floatIn 0.3s ease' }}>
          {toastMessage}
        </div>
      )}      {/* SIDEBAR (Adaptive Drawer) */}
      {(isMobile && mobileMenu) && (
        <div 
          onClick={() => setMobileMenu(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, animation: 'fadeIn 0.2s' }} 
        />
      )}
      <aside style={{ 
        width: 280, background: theme.navBg, borderRight: `1px solid ${theme.border}`, 
        display: isMobile ? (mobileMenu ? 'flex' : 'none') : 'flex', 
        flexDirection: 'column', position: isMobile ? 'fixed' : 'relative', 
        top: 0, left: 0, bottom: 0, zIndex: 101, 
        boxShadow: isMobile ? '4px 0 30px rgba(0,0,0,0.4)' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isMobile && !mobileMenu ? 'translateX(-100%)' : 'none'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: 'var(--gradient-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 0 15px rgba(141,224,44,0.3)' }}>GX</div>
            <div>
              <div style={{ fontWeight: 900, color: theme.text, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>ERP Portal</div>
              <div style={{ fontSize: '0.65rem', color: '#8de02c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{vendor.slug || 'VENDOR'} NODE</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '20px 14px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { section: 'OPERATIONS' },
            { id: 'orders', label: 'Live Pipeline', icon: ShoppingCart, badge: orders.filter(o => o.status === 'PENDING').length || null },
            { id: 'pos', label: 'POS Terminal', icon: Receipt },
            { section: 'RECORDS' },
            { id: 'products', label: 'Menu Catalog', icon: Package },
            { id: 'inventory', label: 'Inventory ERP', icon: Layers },
            { id: 'accounts', label: 'Finance Hub', icon: DollarSign },
            { id: 'closings', label: 'Daily Closings', icon: ClipboardCheck },
            { section: 'SYSTEM' },
            { id: 'gallery', label: 'Media Gallery', icon: Image },
            { id: 'reports', label: 'Performance', icon: BarChart3 },
            { id: 'settings', label: 'Configuration', icon: Settings }
          ].map((item, i) => item.section ? (
            <div key={i} style={{ fontSize: '0.68rem', color: theme.muted, fontWeight: 800, padding: '16px 12px 6px', textTransform: 'uppercase', letterSpacing: 1.5 }}>{item.section}</div>
          ) : (
            <div 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); setMobileMenu(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(141,224,44,0.1)' : 'transparent',
                color: activeTab === item.id ? '#8de02c' : theme.muted,
                fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s',
                borderLeft: activeTab === item.id ? '4px solid #39FF14' : '4px solid transparent'
              }}
              onMouseOver={e => { if(activeTab !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseOut={e => { if(activeTab !== item.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <item.icon size={18} color={activeTab === item.id ? '#39FF14' : 'currentColor'} /> 
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: 20, fontWeight: 900 }}>{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: 20, borderTop: `1px solid ${theme.border}` }}>
          <div onClick={() => setVendor(null)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem' }}>
            <LogOut size={16} /> Sign Out Securely
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100vh', overflow: 'hidden', background: theme.bg }}>
        
        <header style={{ 
          background: theme.card, padding: '0 24px', height: 72, borderBottom: `1px solid ${theme.border}`, 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 40,
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isMobile && (
              <button onClick={() => setMobileMenu(true)} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, padding: 8, borderRadius: 10, cursor: 'pointer', display: 'flex' }}>
                <Menu size={20} color={theme.text} />
              </button>
            )}
            <div>
               <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.68rem', color: theme.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                 <span>{vendor.name}</span> <span style={{ opacity: 0.3 }}>/</span> 
                 <span style={{ color: '#8de02c' }}>{activeTab === 'pos' ? 'Terminal' : 'Operations'}</span>
               </div>
               <h1 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                 {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
               </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Bell size={18} color={theme.text} />
              <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, background: '#39FF14', borderRadius: '50%', border: `2px solid ${theme.card}`, boxShadow: '0 0 8px rgba(57,255,20,0.5)' }}></div>
            </div>
            
            <div style={{ height: 32, width: 1, background: theme.border, margin: '0 4px' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 14, border: `1px solid ${theme.border}` }}>
               <div style={{ width: 32, height: 32, background: 'var(--gradient-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: '0.8rem' }}>VA</div>
               <div style={{ display: isMobile ? 'none' : 'block' }}>
                 <div style={{ fontSize: '0.8rem', fontWeight: 800, color: theme.text }}>Vendor Admin</div>
                 <div style={{ fontSize: '0.6rem', color: theme.muted, fontWeight: 700 }}>VERIFIED SESSION</div>
               </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>

          {/* ORDERS VIEW */}
          {activeTab === 'orders' && (
            <div>
              <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
              `}</style>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Live Orders Pipeline (Real-time)</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ background: 'rgba(141,224,44,0.1)', color: '#65a30d', padding: '6px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8de02c' }}></div> System Monitoring Active
                  </div>
                  <button onClick={fetchOrders} className="btn-icon"><RefreshCw size={16} className={isFetchingOrders ? 'spin' : ''} /></button>
                </div>
              </div>

              {/* ORDER PIPELINE */}
              <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 20 }}>
                {[
                  { id: 'PENDING', label: 'New Requests', color: '#f97316', icon: Bell },
                  { id: 'PREPARING', label: 'In Kitchen', color: '#3b82f6', icon: Clock },
                  { id: 'READY', label: 'Ready', color: '#8b5cf6', icon: CheckCircle },
                  { id: 'DELIVERED', label: 'Delivered', color: '#16a34a', icon: CheckCircle },
                  { id: 'CANCELLED', label: 'Cancelled', color: '#ef4444', icon: X }
                ].map(col => (
                  <div key={col.id} style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 20, minWidth: 320, flex: '0 0 auto' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: col.color, marginBottom: 16 }}>
                      <col.icon size={18} /> {col.label} ({orders.filter(o => o.status === col.id).length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
                      {orders.filter(o => o.status === col.id).length === 0 && <div style={{ color: theme.muted, textAlign: 'center', padding: '40px 0', border: `1px dashed ${theme.border}`, borderRadius: 12 }}>No {col.label}</div>}
                      {orders.filter(o => o.status === col.id).map(o => (
                        <div key={o.id} style={{ background: theme.bg, border: `1px solid ${theme.border}`, padding: 16, borderRadius: 12, transition: '0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                            <div>
                               <div style={{ fontWeight: 900, color: theme.text, fontSize: '1.2rem' }}>#{o.orderNumber || o.id.slice(-5)}</div>
                               <div style={{ fontSize: '0.7rem', color: theme.muted }}>{o.time}</div>
                            </div>
                            <span style={{ 
                               fontSize: '0.65rem', fontWeight: 900, padding: '4px 8px', borderRadius: 6, 
                               background: o.source === 'DELIVERY' ? 'rgba(249,115,22,0.1)' : (o.source === 'DINE_IN' ? 'rgba(59,130,246,0.1)' : (o.source === 'ONLINE' ? 'rgba(226,27,112,0.1)' : 'rgba(141,224,44,0.1)')), 
                               color: o.source === 'DELIVERY' ? '#f97316' : (o.source === 'DINE_IN' ? '#3b82f6' : (o.source === 'ONLINE' ? '#e21b70' : '#65a30d')), 
                               border: `1px solid ${o.source === 'DELIVERY' ? '#f97316' : (o.source === 'DINE_IN' ? '#3b82f6' : (o.source === 'ONLINE' ? '#e21b70' : '#8de02c'))}`
                            }}>{o.source || 'POS'}</span>
                          </div>
                          
                          <div style={{ fontSize: '0.85rem', marginBottom: 12 }}>
                            <div style={{ fontWeight: 800 }}>{o.customer || 'Guest Customer'}</div>
                            {o.table && <div style={{ color: '#3b82f6', fontWeight: 700 }}>Table: {o.table}</div>}
                            <div style={{ marginTop: 8, padding: 8, background: 'rgba(0,0,0,0.1)', borderRadius: 8, borderLeft: `3px solid ${col.color}`, color: theme.muted }}>{o.items}</div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#8de02c' }}>Rs {o.total}</span>
                          </div>

                          <div style={{ display: 'flex', gap: 6 }}>
                             {col.id === 'PENDING' && (
                               <button onClick={() => updateOrderStatus(o.id.replace('ORD-',''), 'PREPARING')} style={{ flex: 1, padding: '8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Accept</button>
                             )}
                             {col.id === 'PREPARING' && (
                               <button onClick={() => updateOrderStatus(o.id.replace('ORD-',''), 'READY')} style={{ flex: 1, padding: '8px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Ready</button>
                             )}
                             {col.id === 'READY' && (
                               <button onClick={() => updateOrderStatus(o.id.replace('ORD-',''), 'DELIVERED')} style={{ flex: 1, padding: '8px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Deliver</button>
                             )}
                             <button onClick={() => showToast('Printing invoice...')} style={{ padding: '8px', background: theme.card, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, cursor: 'pointer' }}><Printer size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS VIEW */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>Menu Catalog {isFetchingProducts && <Loader2 size={16} className="spin text-muted" />}</h2>
                <button onClick={() => setProductModal({ show: true, mode: 'add', data: null })} style={{ background: '#39FF14', color: '#000', fontWeight: 700, border: 'none', padding: '10px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 14px rgba(57,255,20,0.2)' }}>
                  <Plus size={18} /> Add Item
                </button>
              </div>

              <div style={{ background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'rgba(0,0,0,0.1)' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Item Name</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Price</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Stock Status</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: theme.muted }}>No products found. Click "Add Item" to initialize.</td></tr>}
                    {products.map((p, i) => (
                      <tr key={p.id} style={{ borderTop: `1px solid ${theme.border}`, transition: '0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '18px 24px', fontWeight: 700 }}>{p.name}</td>
                        <td style={{ padding: '18px 24px', color: theme.muted }}>{p.category}</td>
                        <td style={{ padding: '18px 24px', fontWeight: 800 }}>Rs {p.price}</td>
                        <td style={{ padding: '18px 24px' }}>
                          <span style={{ background: p.stock === 'In Stock' ? 'rgba(57,255,20,0.1)' : 'rgba(239,68,68,0.1)', color: p.stock === 'In Stock' ? '#39FF14' : '#ef4444', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>
                            {p.stock}
                          </span>
                        </td>
                        <td style={{ padding: '18px 24px' }}>
                          <div style={{ display: 'flex', gap: 14 }}>
                            <button onClick={() => setProductModal({ show: true, mode: 'edit', data: p })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.text }} title="Edit"><Edit size={18} /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <InventoryERP vendor={vendor} theme={theme} />
          )}

          {/* CLOUD ACCOUNTING ERP */}
          {activeTab === 'accounts' && (
            <AccountsERP theme={theme} showToast={showToast} API={API} vendor={vendor} />
          )}

          {/* DAILY CLOSINGS & SHIFTS */}
          {activeTab === 'closings' && (
            <DailyClosingERP theme={theme} showToast={showToast} API={API} vendor={vendor} />
          )}

          {/* REPORTS VIEW — FULL ERP CLONE */}

          {activeTab === 'reports' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
                <button onClick={() => setReportTab('overview')} style={tabBtn(reportTab === 'overview')}>Overview</button>
                <button onClick={() => setReportTab('purchases')} style={tabBtn(reportTab === 'purchases')}>Purchase Reports</button>
                <button onClick={() => setReportTab('consumptions')} style={tabBtn(reportTab === 'consumptions')}>Consumption Reports</button>
                <button onClick={() => setReportTab('stocks')} style={tabBtn(reportTab === 'stocks')}>Stock Reports</button>
                <button onClick={() => setReportTab('invoices')} style={tabBtn(reportTab === 'invoices')}>Invoices & Vouchers</button>
              </div>

              {reportTab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
                    <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                      <div style={{ color: theme.muted, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.9rem' }}><DollarSign size={16} /> Today's Revenue</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: theme.text }}>Rs 14,500</div>
                    </div>
                    <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                      <div style={{ color: theme.muted, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: '0.9rem' }}><Target size={16} /> Pending Payouts</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f97316' }}>Rs 4,200</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: 24, borderRadius: 16, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>Need more visibility?</h3>
                      <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0, marginBottom: 16 }}>Upgrade your B2B account to get detailed analytics and priority listing.</p>
                      <button style={{ background: '#8de02c', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, alignSelf: 'flex-start', cursor: 'pointer' }}>Upgrade Plan</button>
                    </div>
                  </div>
                </div>
              )}

              {reportTab === 'purchases' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {/* LEFT: Selection Criteria */}
                    <div style={{ width: 340, flexShrink: 0, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24 }}>
                      <h3 style={{ margin: '0 0 20px 0', color: '#8de02c', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: 2 }}>Selection Criteria</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>From Date</label><input type="date" defaultValue="2026-04-06" style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} /></div>
                        <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>To Date</label><input type="date" defaultValue="2026-04-06" style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} /></div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>B.Pro</label><select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>ALL</option></select></div>
                        <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>B.Ind</label><select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>ALL</option></select></div>
                      </div>
                      <h3 style={{ margin: '0 0 12px 0', color: '#8de02c', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: 2 }}>Group Information</h3>
                      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
                        <select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>All Departments</option><option>Kitchen</option></select>
                        <select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>Group / Category</option><option>Raw Materials</option></select>
                        <select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>Sub Group</option></select>
                        <input placeholder="Title Search..." style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} />
                      </div>
                      <h3 style={{ margin: '0 0 12px 0', color: '#8de02c', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: 2 }}>Report Type</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {['Party Wise Consolidated', 'Item Wise Consolidated', 'Party Wise Items Detailed', 'Item Wise Partys Detailed', 'Item Detailed (Party & Voucher)', 'Purchase Register / Ledger', 'Items Rate Update History'].map((r, i) => (
                          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: theme.text, fontWeight: i === 2 ? 800 : 400 }}><input type="radio" name="purRpt" defaultChecked={i === 2} style={{ accentColor: '#8de02c' }} />{r}</label>
                        ))}
                      </div>
                      <button onClick={() => setPreviewMode('purchase')} style={{ width: '100%', marginTop: 20, padding: 14, background: '#39FF14', color: '#000', border: 'none', borderRadius: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(57,255,20,0.3)' }}><Printer size={18} /> Generate & Print</button>
                    </div>

                    {/* RIGHT: Live Report Preview */}
                    <div style={{ flex: 1, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24, overflowX: 'auto' }}>
                      <div style={{ borderBottom: '3px solid #000', paddingBottom: 12, marginBottom: 16 }}>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: theme.text }}>{vendor?.name?.toUpperCase() || 'GALAXY EXPRESS'} (PRIVATE) LIMITED</h2>
                        <div style={{ textAlign: 'center', marginTop: 8 }}><span style={{ background: '#fef9c3', color: '#000', padding: '4px 16px', fontWeight: 900, border: '1px solid #000', fontSize: '0.95rem' }}>PARTY WISE ITEMS DETAILED PURCHASE REPORT</span></div>
                        <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.85rem', fontWeight: 700, color: theme.muted }}>FROM : 06/04/2026 TO: 06/04/2026</div>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead><tr style={{ borderTop: '2px solid', borderBottom: '2px solid', background: '#fef9c3' }}>
                          <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 900, fontStyle: 'italic' }}>ITEM DESCRIPTION</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 900, fontStyle: 'italic' }}>UOM</th>
                          <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>QTY</th>
                          <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>R.QTY</th>
                          <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>N.Qty</th>
                          <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>RATE</th>
                          <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>AMOUNT</th>
                        </tr></thead>
                        <tbody>
                          {/* HAFIZ TRADER */}
                          <tr><td colSpan={7} style={{ padding: '12px 6px 4px', fontWeight: 900, color: theme.text }}>HAFIZ TRADER</td></tr>
                          {[{ n: 'BEEF MUQADAM,BEEF MINCE', u: 'KG', q: '10.000', rq: '', nq: '10.000', r: '1,350.00', a: '13,500.00' }, { n: 'CHICKEN BONE', u: 'KG', q: '5.900', rq: '', nq: '5.900', r: '150.00', a: '885.00' }, { n: 'CHICKEN KARAHI, WHOLE CHICKEN', u: 'KG', q: '30.000', rq: '', nq: '30.000', r: '724.00', a: '21,720.00' }, { n: 'CHICKEN THAI,CHICKEN QEEMA,BREAST', u: 'KG', q: '59.400', rq: '', nq: '59.400', r: '966.00', a: '57,380.40' }, { n: 'MUTTON BONELESS', u: 'KG', q: '4.450', rq: '', nq: '4.450', r: '2,750.00', a: '12,237.50' }, { n: 'MUTTON KARAHI, WHOLE MUTTON', u: 'KG', q: '25.240', rq: '', nq: '25.240', r: '2,350.00', a: '59,314.00' }].map((item, i) => (
                            <tr key={i}><td style={{ padding: '4px 6px 4px 20px', color: theme.text }}>{item.n}</td><td style={{ textAlign: 'center', color: theme.muted }}>{item.u}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.q}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.rq}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.nq}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.r}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.a}</td></tr>
                          ))}
                          <tr style={{ borderTop: '1px solid #e2e8f0' }}><td colSpan={6} style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>HAFIZ TRADER TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>165,118</td></tr>

                          {/* NAZIR MILK SHOP */}
                          <tr><td colSpan={7} style={{ padding: '12px 6px 4px', fontWeight: 900, color: theme.text }}>NAZIR MILK SHOP</td></tr>
                          {[{ n: 'MILK, FRESH MILK', u: 'LTR', q: '56.000', rq: '', nq: '56.000', r: '200.00', a: '11,200.00' }, { n: 'YOGURT FRESH', u: 'KG', q: '32.000', rq: '', nq: '32.000', r: '220.00', a: '7,040.00' }].map((item, i) => (
                            <tr key={i}><td style={{ padding: '4px 6px 4px 20px', color: theme.text }}>{item.n}</td><td style={{ textAlign: 'center', color: theme.muted }}>{item.u}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.q}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.rq}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.nq}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.r}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.a}</td></tr>
                          ))}
                          <tr style={{ borderTop: '1px solid #e2e8f0' }}><td colSpan={6} style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>NAZIR MILK SHOP TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>18,240</td></tr>

                          {/* SHEIKH VEGETABLES */}
                          <tr><td colSpan={7} style={{ padding: '12px 6px 4px', fontWeight: 900, color: theme.text }}>SHEIKH VEGETABLES</td></tr>
                          {[{ n: 'APPLE', u: 'KG', q: '2.000', rq: '', nq: '2.000', r: '420.00', a: '840.00' }, { n: 'BANANA', u: 'NO/PCS', q: '12.000', rq: '', nq: '12.000', r: '16.66', a: '199.92' }, { n: 'CABBAGE', u: 'KG', q: '5.000', rq: '', nq: '5.000', r: '40.00', a: '200.00' }, { n: 'CAPSICUM', u: 'KG', q: '2.000', rq: '', nq: '2.000', r: '80.00', a: '160.00' }, { n: 'GARLIC', u: 'KG', q: '1.500', rq: '', nq: '1.500', r: '270.00', a: '405.00' }].map((item, i) => (
                            <tr key={i}><td style={{ padding: '4px 6px 4px 20px', color: theme.text }}>{item.n}</td><td style={{ textAlign: 'center', color: theme.muted }}>{item.u}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.q}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.rq}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.nq}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.r}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.a}</td></tr>
                          ))}
                          <tr style={{ borderTop: '1px solid #e2e8f0' }}><td colSpan={6} style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>SHEIKH VEGETABLES TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>1,804.92</td></tr>

                          {/* GRAND TOTAL */}
                          <tr style={{ borderTop: '3px double #000', borderBottom: '3px double #000' }}><td colSpan={6} style={{ textAlign: 'right', fontWeight: 900, padding: '12px 6px', fontSize: '1rem', color: theme.text }}>GRAND TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1rem', padding: '12px 6px', color: '#39FF14' }}>185,162.92</td></tr>
                        </tbody>
                      </table>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, fontSize: '0.75rem', color: theme.muted }}>
                        <span>Printed on: {new Date().toLocaleString()}</span>
                        <span>GalaxyERP Report Engine v2</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {reportTab === 'consumptions' && (
                <div style={{ animation: 'fadeIn 0.3s', display: 'flex', gap: 24 }}>
                  <div style={{ width: 340, flexShrink: 0, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24 }}>
                    <h3 style={{ margin: '0 0 20px 0', color: '#8de02c', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: 2 }}>Selection Criteria</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                      <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>From Date</label><input type="date" defaultValue="2026-04-05" style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} /></div>
                      <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>To Date</label><input type="date" defaultValue="2026-04-05" style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                      <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>B.Pro</label><select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>ALL</option></select></div>
                      <div><label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>B.Ind</label><select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8 }}><option>ALL</option></select></div>
                    </div>
                    <h3 style={{ margin: '0 0 12px 0', color: '#8de02c', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: 2 }}>Group Info</h3>
                    <select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, marginBottom: 20 }}><option>All Departments</option><option>B.B.Q</option><option>FAST FOOD</option></select>
                    <button onClick={() => handleGenerateLiveReport('consumption')} disabled={isGenerating} style={{ width: '100%', padding: 14, background: '#39FF14', color: '#000', border: 'none', borderRadius: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(57,255,20,0.3)' }}>{isGenerating ? <><Loader2 size={18} className="spin" /> Fetching...</> : <><Printer size={18} /> Generate & Print</>}</button>
                  </div>
                  <div style={{ flex: 1, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24, overflowX: 'auto' }}>
                    <div style={{ borderBottom: '3px solid #000', paddingBottom: 12, marginBottom: 16 }}>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: theme.text }}>{vendor?.name?.toUpperCase() || 'GALAXY EXPRESS'} (PRIVATE) LIMITED</h2>
                      <div style={{ textAlign: 'center', marginTop: 8 }}><span style={{ background: '#fef9c3', color: '#000', padding: '4px 16px', fontWeight: 900, border: '1px solid #000', fontSize: '0.95rem' }}>DEPARTMENT WISE ITEMS DETAILED CONSUMPTION REPORT</span></div>
                      <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.85rem', fontWeight: 700, color: theme.muted }}>FROM : 05/04/2026 TO: 05/04/2026 BI : ALL</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead><tr style={{ borderTop: '2px solid', borderBottom: '2px solid', background: '#fef9c3' }}>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 900, fontStyle: 'italic' }}>ITEM DESCRIPTION</th>
                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 900, fontStyle: 'italic' }}>UOM</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>QTY</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>R.QTY</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>N.Qty</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>RATE</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>AMOUNT</th>
                      </tr></thead>
                      <tbody>
                        <tr><td colSpan={7} style={{ padding: '12px 6px 4px', fontWeight: 900, color: theme.text }}>B.B.Q</td></tr>
                        {[{ n: 'AJWAIN,CAROM SEED', u: 'KG', q: '1.40', r: '', nq: '1.40', rt: '', a: '' }, { n: 'BAKRA RAW', u: 'KG', q: '57.00', r: '36.00', nq: '21.00', rt: '2,250.00', a: '47,250.00' }, { n: 'BEEF MUQADAM,BEEF MINCE', u: 'KG', q: '17.00', r: '15.00', nq: '2.00', rt: '1,350.00', a: '2,700.00' }, { n: 'CHARCOAL', u: 'BAG', q: '120.00', r: '80.00', nq: '40.00', rt: '130.00', a: '5,200.00' }, { n: 'CHICKEN THAI,CHICKEN QEEMA', u: 'KG', q: '196.00', r: '145.00', nq: '53.00', rt: '867.62', a: '45,984.00' }, { n: 'COOKING OIL, CANOLA OIL', u: 'KG', q: '22.00', r: '5.00', nq: '17.00', rt: '459.89', a: '7,818.06' }].map((item, i) => (
                          <tr key={i}><td style={{ padding: '4px 6px 4px 20px', color: theme.text }}>{item.n}</td><td style={{ textAlign: 'center', color: theme.muted }}>{item.u}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.q}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.r}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.nq}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.rt}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.a}</td></tr>
                        ))}
                        <tr style={{ borderTop: '1px solid #e2e8f0' }}><td colSpan={6} style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>B.B.Q TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>108,952.06</td></tr>

                        <tr><td colSpan={7} style={{ padding: '12px 6px 4px', fontWeight: 900, color: theme.text }}>FAST FOOD</td></tr>
                        {[{ n: 'BURGER BUN', u: 'NO/PCS', q: '450', r: '', nq: '450', rt: '15.00', a: '6,750.00' }, { n: 'CHICKEN BONELESS', u: 'KG', q: '30.00', r: '', nq: '30.00', rt: '724.00', a: '21,720.00' }, { n: 'CHEESE SLICE', u: 'NO/PCS', q: '200', r: '', nq: '200', rt: '12.50', a: '2,500.00' }].map((item, i) => (
                          <tr key={i}><td style={{ padding: '4px 6px 4px 20px', color: theme.text }}>{item.n}</td><td style={{ textAlign: 'center', color: theme.muted }}>{item.u}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.q}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.r}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.nq}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.rt}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.a}</td></tr>
                        ))}
                        <tr style={{ borderTop: '1px solid #e2e8f0' }}><td colSpan={6} style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>FAST FOOD TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 900, padding: '8px 6px', color: theme.text }}>30,970.00</td></tr>

                        <tr style={{ borderTop: '3px double #000', borderBottom: '3px double #000' }}><td colSpan={6} style={{ textAlign: 'right', fontWeight: 900, padding: '12px 6px', fontSize: '1rem', color: theme.text }}>GRAND TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1rem', padding: '12px 6px', color: '#39FF14' }}>139,922.06</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* STOCK REPORTS — Baranh ERP Clone */}
              {reportTab === 'stocks' && (
                <div style={{ animation: 'fadeIn 0.3s', display: 'flex', gap: 24 }}>
                  <div style={{ width: 420, flexShrink: 0, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 30 }}>
                    <div style={{ textAlign: 'right', marginBottom: 20 }}><h2 style={{ margin: 0, color: theme.text, fontSize: '1.4rem', fontWeight: 900 }}>STOCKS</h2></div>
                    <h3 style={{ margin: '0 0 16px 0', color: '#8de02c', fontSize: '0.95rem', letterSpacing: 2 }}>SELECTION CRITERIA</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                      <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>From Date</label><input type="date" defaultValue="2026-04-06" style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} /></div>
                      <div><label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: theme.muted, marginBottom: 4 }}>To Date</label><input type="date" defaultValue="2026-04-06" style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                      <label style={{ fontWeight: 700, color: theme.muted, fontSize: '0.85rem', textAlign: 'right' }}>Location :</label>
                      <select style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, fontWeight: 700 }}><option>ALL</option><option>BARANH Y-BLOCK</option><option>ELYSIAN SWEETS JHANG</option><option>HD DOLMEN</option><option>HD GULBERG</option><option>HD RAYA</option><option>HD Y-BLOCK</option><option>WAREHOUSE / HQ</option></select>
                      <label style={{ fontWeight: 700, color: theme.muted, fontSize: '0.85rem', textAlign: 'right' }}>Department :</label>
                      <input style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} placeholder="All" />
                      <label style={{ fontWeight: 700, color: theme.muted, fontSize: '0.85rem', textAlign: 'right' }}>Group :</label>
                      <input style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} placeholder="All" />
                      <label style={{ fontWeight: 700, color: theme.muted, fontSize: '0.85rem', textAlign: 'right' }}>Sub Group :</label>
                      <input style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} placeholder="All" />
                      <label style={{ fontWeight: 700, color: theme.muted, fontSize: '0.85rem', textAlign: 'right' }}>Type :</label>
                      <input style={{ width: '100%', padding: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, boxSizing: 'border-box' }} placeholder="All" />
                    </div>

                    <h3 style={{ margin: '0 0 16px 0', color: '#8de02c', fontSize: '0.95rem', letterSpacing: 2 }}>STOCK REPORTS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                      {['Stock In Hand', 'Stock In Hand (With Last Cost Rate)', 'Stock In Hand (COMPARISON)'].map((r, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: theme.text, fontSize: '0.9rem', fontWeight: i === 0 ? 800 : 400, background: i === 0 ? 'rgba(57,255,20,0.08)' : 'transparent', padding: '6px 10px', borderRadius: 8 }}><input type="radio" name="stkRpt" defaultChecked={i === 0} style={{ accentColor: '#8de02c' }} />{r}</label>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                      {['Stock Inquires (ItemWise)', 'Stock Inquires (GroupWise And ItemWise)'].map((r, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 700, padding: '6px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.08)' }}><input type="radio" name="stkRpt" style={{ accentColor: '#3b82f6' }} />{r}</label>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: theme.text, fontSize: '0.9rem' }}><input type="radio" name="stkRpt" style={{ accentColor: '#8de02c' }} />Rate Change History</label>
                      <button style={{ padding: '8px 20px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, fontWeight: 800, color: theme.text, cursor: 'pointer' }}>Stock Grid</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {['Item Ledger', 'Item Ledger (Consolidated)', 'Stock Audit History'].map((r, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: theme.text, fontSize: '0.9rem', padding: '6px 10px', borderRadius: 8 }}><input type="radio" name="stkRpt" style={{ accentColor: '#8de02c' }} />{r}</label>
                      ))}
                    </div>
                    <button onClick={() => showToast('Stock Report Generated!')} style={{ width: '100%', marginTop: 20, padding: 14, background: '#39FF14', color: '#000', border: 'none', borderRadius: 10, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(57,255,20,0.3)' }}><Printer size={18} /> Generate Report</button>
                  </div>

                  {/* Stock In Hand Preview */}
                  <div style={{ flex: 1, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24, overflowX: 'auto' }}>
                    <div style={{ borderBottom: '3px solid #000', paddingBottom: 12, marginBottom: 16 }}>
                      <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: theme.text }}>{vendor?.name?.toUpperCase() || 'GALAXY EXPRESS'} (PRIVATE) LIMITED</h2>
                      <div style={{ textAlign: 'center', marginTop: 8 }}><span style={{ background: '#fef9c3', color: '#000', padding: '4px 16px', fontWeight: 900, border: '1px solid #000', fontSize: '0.95rem' }}>STOCK IN HAND REPORT</span></div>
                      <div style={{ textAlign: 'center', marginTop: 6, fontSize: '0.85rem', fontWeight: 700, color: theme.muted }}>AS ON : 06/04/2026 | LOCATION : ALL</div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead><tr style={{ borderTop: '2px solid', borderBottom: '2px solid', background: '#fef9c3' }}>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 900, fontStyle: 'italic' }}>ITEM CODE</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 900, fontStyle: 'italic' }}>ITEM DESCRIPTION</th>
                        <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 900, fontStyle: 'italic' }}>UOM</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>QTY</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>RATE</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontWeight: 900, fontStyle: 'italic' }}>VALUE</th>
                      </tr></thead>
                      <tbody>
                        {[{ c: 'RW-001', n: 'BEEF MUQADAM,BEEF MINCE', u: 'KG', q: '45.500', r: '1,350.00', v: '61,425.00' }, { c: 'RW-002', n: 'CHICKEN BONELESS', u: 'KG', q: '82.000', r: '724.00', v: '59,368.00' }, { c: 'RW-003', n: 'COOKING OIL, CANOLA', u: 'KG', q: '35.000', r: '459.89', v: '16,096.15' }, { c: 'RW-004', n: 'MILK, FRESH MILK', u: 'LTR', q: '24.000', r: '200.00', v: '4,800.00' }, { c: 'RW-005', n: 'BURGER BUN', u: 'NO/PCS', q: '320', r: '15.00', v: '4,800.00' }, { c: 'RW-006', n: 'CHARCOAL', u: 'BAG', q: '15', r: '130.00', v: '1,950.00' }, { c: 'RW-007', n: 'GARLIC', u: 'KG', q: '3.500', r: '270.00', v: '945.00' }, { c: 'PK-001', n: 'BURGER BOX STANDARD', u: 'NO/PCS', q: '450', r: '18.00', v: '8,100.00' }].map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}><td style={{ padding: '6px', color: theme.muted }}>{item.c}</td><td style={{ padding: '6px', color: theme.text, fontWeight: 600 }}>{item.n}</td><td style={{ textAlign: 'center', color: theme.muted }}>{item.u}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.q}</td><td style={{ textAlign: 'right', color: theme.text }}>{item.r}</td><td style={{ textAlign: 'right', color: theme.text, fontWeight: 700 }}>{item.v}</td></tr>
                        ))}
                        <tr style={{ borderTop: '3px double #000', borderBottom: '3px double #000' }}><td colSpan={5} style={{ textAlign: 'right', fontWeight: 900, padding: '12px 6px', fontSize: '1rem', color: theme.text }}>GRAND TOTAL :</td><td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1rem', padding: '12px 6px', color: '#39FF14' }}>157,484.15</td></tr>
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, fontSize: '0.75rem', color: theme.muted }}><span>Printed on: {new Date().toLocaleString()}</span><span>GalaxyERP Report Engine v2</span></div>
                  </div>
                </div>
              )}

              {reportTab === 'invoices' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, color: theme.text }}>Invoices & Vouchers</h2>
                    <button style={actBtn}><Plus size={16} /> Create Voucher</button>
                  </div>
                  <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead style={{ background: theme.bg, color: theme.muted, fontSize: '0.85rem' }}><tr><th style={{ padding: '16px 20px', fontWeight: 600 }}>Voucher #</th><th style={{ padding: '16px 20px', fontWeight: 600 }}>Type</th><th style={{ padding: '16px 20px', fontWeight: 600 }}>Party / Supplier</th><th style={{ padding: '16px 20px', fontWeight: 600 }}>Amount</th><th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th></tr></thead>
                      <tbody>
                        {[{ id: 'PV-2026-001', t: 'Purchase Invoice', p: 'Fresh Farms Supplies', a: '- Rs 4,500', s: 'Pending Approval', sc: '#f97316', sb: 'rgba(249,115,22,0.1)' }, { id: 'CP-2026-092', t: 'Cash Payment Voucher', p: 'Local Dairy Co.', a: '- Rs 1,200', s: 'Paid', sc: '#16a34a', sb: 'rgba(34,197,94,0.1)' }, { id: 'BR-2026-004', t: 'Bank Receipt Voucher', p: 'GalaxyExpress Settlement', a: '+ Rs 12,000', s: 'Cleared', sc: '#16a34a', sb: 'rgba(34,197,94,0.1)' }].map((v, i) => (
                          <tr key={i} style={{ borderTop: `1px solid ${theme.border}` }}><td style={{ padding: '16px 20px', fontWeight: 700, color: theme.text }}>{v.id}</td><td style={{ padding: '16px 20px', color: theme.muted }}>{v.t}</td><td style={{ padding: '16px 20px', fontWeight: 600, color: theme.text }}>{v.p}</td><td style={{ padding: '16px 20px', fontWeight: 800, color: v.a.startsWith('+') ? '#16a34a' : '#ef4444' }}>{v.a}</td><td style={{ padding: '16px 20px' }}><span style={{ background: v.sb, color: v.sc, padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>{v.s}</span></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROCUREMENT & INVENTORY FORMS (Unified Panel) */}
          {['po', 'pur_inv', 'grn', 'issuance', 'production', 'wastage', 'transfer', 'adjustment', 'audit'].includes(activeTab) && (
            <div style={{ animation: 'fadeIn 0.3s', display: 'flex', gap: 24, height: 'calc(100vh - 120px)' }}>

              {/* LEFT PANEL: RECENT ENTRIES & DAY-WISE FIND */}
              <div style={{ width: 340, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flexShrink: 0, overflow: 'hidden' }}>
                <div style={{ padding: 20, borderBottom: `1px solid ${theme.border}`, background: 'rgba(0,0,0,0.02)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text, display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={18} /> Recent Entries</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: theme.bg, borderRadius: 8, border: `1px solid ${theme.border}`, padding: '4px 12px' }}>
                      <span style={{ fontSize: '0.75rem', color: theme.muted, marginRight: 8, fontWeight: 700, width: 45 }}>DATE:</span>
                      <input type="date" title="Recent Day Wise Filter" style={{ width: '100%', padding: '8px 4px', background: 'transparent', color: theme.text, border: 'none', outline: 'none', fontWeight: 600 }} defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} color={theme.muted} style={{ position: 'absolute', top: 10, left: 12 }} />
                      <input placeholder={`Search ${activeTab.replace('_', ' ')}...`} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {/* Mock Recent Entries */}
                  {[1, 2, 3].map((item, idx) => (
                    <div key={idx} style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(57,255,20,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: theme.text }}>{activeTab.toUpperCase()}-104{idx}</span>
                        <span style={{ fontSize: '0.75rem', color: theme.muted }}>06 Apr 2026</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: theme.muted, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {['grn', 'pur_inv', 'po'].includes(activeTab) ? 'From: Fresh Farms Supplies' : 'To: Fast Food Dept'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ background: idx === 0 ? 'rgba(57,255,20,0.1)' : 'rgba(239,68,68,0.1)', color: idx === 0 ? '#39FF14' : '#ef4444', padding: '4px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800 }}>
                          {idx === 0 ? 'POSTED' : 'PENDING'}
                        </span>
                        <span style={{ fontWeight: 800, color: theme.text }}>Rs {(4500 * (idx + 1)).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT PANEL: DATA ENTRY FORM */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, color: theme.text, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Layers size={24} color="#8de02c" /> New {activeTab.replace('_', ' ')}
                  </h2>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button style={{ ...actBtn, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }}><Printer size={16} /> Print</button>
                    <button style={{ ...actBtn, background: '#39FF14', color: '#000', padding: '10px 24px', fontSize: '1rem' }} onClick={() => showToast(`${activeTab.replace('_', ' ').toUpperCase()} Document Saved & Auto-Posted to GL!`)}><CheckCircle size={18} /> Save & Process</button>
                  </div>
                </div>

                {/* Form Main Area */}
                <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: window.innerWidth < 768 ? 16 : 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: window.innerWidth < 768 ? 20 : 30 }}>

                    {/* Left Columns of Entry details */}
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: theme.muted, fontWeight: 700 }}>Document No.</label>
                          <input type="text" readOnly defaultValue={`${activeTab.toUpperCase()}-${Math.floor(Math.random() * 90000) + 10000}`} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 800, boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: theme.muted, fontWeight: 700 }}>Date</label>
                          <input type="date" defaultValue={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 600, boxSizing: 'border-box' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                        {['grn', 'pur_inv', 'po'].includes(activeTab) && (
                          <>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: theme.muted, fontWeight: 700 }}>Supplier / Party Account</label>
                              <select style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 600, boxSizing: 'border-box', borderLeft: '4px solid #f97316' }}>
                                <option>Hafiz Traders (A/C: 2001)</option>
                                <option>Nazir Milk Shop (A/C: 2002)</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: theme.muted, fontWeight: 700 }}>Receive To (Stock Location)</label>
                              <select style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 800, color: '#39FF14', boxSizing: 'border-box', borderLeft: '4px solid #39FF14' }}>
                                <option>Main Store (HQ)</option>
                                <option>Kitchen Cold Storage</option>
                              </select>
                            </div>
                          </>
                        )}
                        {['issuance', 'transfer', 'production'].includes(activeTab) && (
                          <>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: theme.muted, fontWeight: 700 }}>Source Location (Issue From)</label>
                              <select style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 800, color: '#f97316', boxSizing: 'border-box', borderLeft: '4px solid #f97316' }}>
                                <option>Main Store (HQ)</option>
                                <option>Warehouse B</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: theme.muted, fontWeight: 700 }}>Destination Dept. / Project</label>
                              <select style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 800, color: '#39FF14', boxSizing: 'border-box', borderLeft: '4px solid #39FF14' }}>
                                <option>Fast Food Department</option>
                                <option>BBQ & Grill</option>
                              </select>
                            </div>
                          </>
                        )}
                        {['wastage', 'adjustment', 'audit'].includes(activeTab) && (
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: theme.muted, fontWeight: 700 }}>Stock Location</label>
                            <select style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 800, boxSizing: 'border-box' }}>
                              <option>Main Store (HQ)</option>
                              <option>Kitchen Ops</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Integrations side */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ background: theme.bg, borderRadius: 12, border: `1px solid ${theme.border}`, padding: 16 }}>
                        <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}><Target size={16} color="#8de02c" /> Business Configuration</h4>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8rem', color: theme.muted }}>Business Project</label>
                          <select style={{ width: '100%', padding: '8px', borderRadius: 6, background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                            <option>Default Branch (HQ)</option>
                            <option>Branch 2 (DHA Phase 6)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.8rem', color: theme.muted }}>Business Indicator</label>
                          <select style={{ width: '100%', padding: '8px', borderRadius: 6, background: theme.card, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                            <option>General Operations</option>
                            <option>Special Event Catering</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(59, 130, 246, 0.05)', borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.2)', padding: 16 }}>
                        <h4 style={{ margin: '0 0 12px 0', color: theme.text, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}><BookOpen size={16} color="#3b82f6" /> Auto Accounts Link (COA)</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.8rem', color: theme.muted, fontWeight: 700 }}>DR:</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.text }}>{['grn', 'pur_inv'].includes(activeTab) ? '10-01-100 (Store Inventory)' : '40-02-200 (Dept Expense)'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8rem', color: theme.muted, fontWeight: 700 }}>CR:</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.text }}>{['grn', 'pur_inv'].includes(activeTab) ? '20-00-405 (A/C Payable)' : '10-01-100 (Store Inventory)'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid Table */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 20 }}>
                    <h3 style={{ margin: 0, color: theme.text, fontSize: '1.1rem' }}>Line Items Detail</h3>
                    {activeTab === 'audit' && <button style={{ background: 'rgba(57,255,20,0.1)', color: '#65a30d', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>Auto-Load System Stock</button>}
                  </div>

                  <div style={{ overflowX: 'auto', border: `1px solid ${theme.border}`, borderRadius: 12 }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: 700 }}>
                      <thead style={{ background: theme.bg, fontSize: '0.8rem', color: theme.muted, textTransform: 'uppercase' }}>
                        <tr>
                          <th style={{ padding: '14px 16px', fontWeight: 800 }}>Item Code & Description</th>
                          <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'center' }}>System Qty</th>
                          <th style={{ padding: '14px 16px', fontWeight: 800 }}>UOM</th>
                          {activeTab !== 'audit' && <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'right' }}>Rate (Rs)</th>}
                          {activeTab !== 'audit' && <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'right' }}>Total Value</th>}
                          {activeTab === 'audit' && <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'center' }}>Physical Qty</th>}
                          {activeTab === 'audit' && <th style={{ padding: '14px 16px', fontWeight: 800, textAlign: 'center' }}>Variance</th>}
                          <th style={{ padding: '14px 16px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: `1px solid ${theme.border}`, transition: '0.2s', background: theme.card }} onMouseOver={e => e.currentTarget.style.background = theme.bg} onMouseOut={e => e.currentTarget.style.background = theme.card}>
                          <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                            <input type="text" defaultValue="Beef Patty (Grade A)" style={{ width: '100%', padding: '8px', background: 'transparent', color: theme.text, border: 'none', outline: 'none', fontWeight: 700 }} />
                            <div style={{ fontSize: '0.75rem', color: theme.muted, paddingLeft: 8 }}>Available: 45.5 kg in Main Store</div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'top' }}><input type="number" defaultValue="10" style={{ width: '70px', padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, textAlign: 'center', fontWeight: 800 }} /></td>
                          <td style={{ padding: '12px 16px', color: theme.muted, fontWeight: 600, verticalAlign: 'top', paddingTop: 20 }}>kg</td>
                          {activeTab !== 'audit' && <td style={{ padding: '12px 16px', textAlign: 'right', verticalAlign: 'top' }}><input type="number" defaultValue="1200" style={{ width: '100%', maxWidth: 100, padding: '10px', background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 8, textAlign: 'right' }} /></td>}
                          {activeTab !== 'audit' && <td style={{ padding: '12px 16px', fontWeight: 900, textAlign: 'right', color: theme.text, verticalAlign: 'top', paddingTop: 20 }}>12,000</td>}
                          {activeTab === 'audit' && <td style={{ padding: '12px 16px', textAlign: 'center', verticalAlign: 'top' }}><input type="number" defaultValue="8" style={{ width: '70px', padding: '10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: `1px solid #ef4444`, borderRadius: 8, textAlign: 'center', fontWeight: 800 }} /></td>}
                          {activeTab === 'audit' && <td style={{ padding: '12px 16px', fontWeight: 900, textAlign: 'center', color: '#ef4444', verticalAlign: 'top', paddingTop: 20 }}>-2 kg</td>}
                          <td style={{ padding: '12px 16px', verticalAlign: 'top', paddingTop: 20 }}><Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} /></td>
                        </tr>
                        <tr style={{ background: theme.bg }}>
                          <td style={{ padding: '16px' }}><input type="text" placeholder="+ Scan Barcode or Type Item Name..." style={{ width: '100%', padding: '8px', background: 'transparent', color: theme.text, border: 'none', outline: 'none', fontWeight: 600 }} /></td>
                          <td colSpan={activeTab === 'audit' ? 5 : 5} style={{ padding: '16px', textAlign: 'right' }}>
                            <button style={{ background: '#39FF14', color: '#000', border: 'none', fontWeight: 800, cursor: 'pointer', padding: '10px 20px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 14px rgba(57,255,20,0.2)' }}><Plus size={16} /> Add Row</button>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <tr>
                          <td colSpan={activeTab === 'audit' ? 2 : 3} style={{ padding: '16px', fontWeight: 800, textAlign: 'right' }}>GRAND TOTAL:</td>
                          {activeTab !== 'audit' && <td style={{ padding: '16px', fontWeight: 900, textAlign: 'right', fontSize: '1.2rem', color: '#3b82f6' }} colSpan={2}>Rs 12,000</td>}
                          {activeTab === 'audit' && <td style={{ padding: '16px', fontWeight: 900, textAlign: 'center', fontSize: '1rem', color: '#ef4444' }} colSpan={2}>-2 kg Variance</td>}
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Remarks */}
                  <div style={{ marginTop: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', color: theme.muted, fontWeight: 700 }}>Internal Notes / Narration</label>
                    <textarea rows={3} style={{ width: '100%', padding: '16px', borderRadius: 12, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', resize: 'none', boxSizing: 'border-box' }} placeholder="Additional notes, gate pass numbers, or descriptions..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS & FEEDBACK VIEW */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0 }}>Customer Feedback</h2>
                <div style={{ background: theme.card, padding: '8px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: theme.text }}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" /> 4.8 / 5.0 Average
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: theme.card, padding: 20, borderRadius: 16, border: `1px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: theme.text }}>{r.customer}</div>
                        <div style={{ color: theme.muted, fontSize: '0.85rem', marginTop: 2 }}>Order: {r.orderId} • {r.date}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} color={i < r.rating ? '#fbbf24' : '#e2e8f0'} fill={i < r.rating ? '#fbbf24' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: 0, color: theme.text, background: theme.bg, padding: 12, borderRadius: 8, borderLeft: '4px solid #8de02c' }}>
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR & HIRING VIEW */}
          {activeTab === 'hr' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, color: theme.text }}>Staff Applications</h2>
                <button style={actBtn}>
                  <Plus size={16} /> Post New Job
                </button>
              </div>

              <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, padding: 24, marginBottom: 24 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, color: theme.text }}>Active Job Listings</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ background: theme.bg, padding: '8px 16px', borderRadius: 20, border: `1px solid ${theme.border}`, fontSize: '0.9rem', fontWeight: 600, color: theme.text }}>Assistant Chef</span>
                  <span style={{ background: theme.bg, padding: '8px 16px', borderRadius: 20, border: `1px solid ${theme.border}`, fontSize: '0.9rem', fontWeight: 600, color: theme.text }}>Pizza Maker</span>
                </div>
              </div>

              <div style={{ background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ background: theme.bg, color: theme.muted, fontSize: '0.85rem' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Applicant</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Applied Role</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((a, i) => (
                      <tr key={a.id} style={{ borderTop: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, color: theme.text }}>{a.applicant}</div>
                          <div style={{ fontSize: '0.8rem', color: theme.muted }}>{a.email}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: theme.text }}>{a.role}</td>
                        <td style={{ padding: '16px 20px', color: theme.muted }}><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{a.date}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: a.status === 'Pending' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: a.status === 'Pending' ? '#ef4444' : '#16a34a', padding: '4px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                            {a.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <button style={{ background: theme.bg, border: `1px solid ${theme.border}`, padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600, color: theme.text }}>
                            <UserCheck size={14} /> Interview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}



          {/* -------- CHAT SYSTEM ------- */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 20, animation: 'fadeIn 0.3s' }}>

              {/* Contact List */}
              <div style={{ width: 340, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: 20, borderBottom: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: '0 0 16px 0', color: theme.text }}>Messages</h3>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color={theme.muted} style={{ position: 'absolute', top: 12, left: 12 }} />
                    <input className="form-input" placeholder="Search chats..." style={{ width: '100%', padding: '10px 10px 10px 36px', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.text }} />
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {conversations.map(chat => (
                    <div key={chat.id} onClick={() => setActiveChat(chat.id)}
                      style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer', background: activeChat === chat.id ? 'rgba(57,255,20,0.05)' : 'transparent', borderLeft: activeChat === chat.id ? '4px solid #39FF14' : '4px solid transparent', display: 'flex', gap: 12, alignItems: 'center', transition: 'all 0.2s' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: chat.type === 'Rider' ? '#3b82f6' : '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', position: 'relative' }}>
                        {chat.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: theme.text, fontSize: '0.9rem' }}>{chat.participant}</span>
                          <span style={{ fontSize: '0.7rem', color: theme.muted }}>{chat.messages[chat.messages.length - 1]?.time}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                            {chat.messages[chat.messages.length - 1]?.sender === 'vendor' ? 'You: ' : ''}{chat.messages[chat.messages.length - 1]?.text}
                          </span>
                          {chat.unread > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 10, fontWeight: 800 }}>{chat.unread}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat View */}
              <div style={{ flex: 1, background: theme.card, borderRadius: 16, border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {(() => {
                  const currChat = conversations.find(c => c.id === activeChat);
                  if (!currChat) return <div style={{ margin: 'auto', color: theme.muted }}>Select a chat to view messages</div>;

                  return (
                    <>
                      {/* Header */}
                      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: currChat.type === 'Rider' ? '#3b82f6' : '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>
                            {currChat.avatar}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: theme.text, fontSize: '1.05rem' }}>{currChat.participant}</div>
                            <div style={{ fontSize: '0.75rem', color: '#39FF14', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 10px #39FF14' }}></div> {currChat.type} • {currChat.order}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button className="btn-icon"><PhoneCall size={18} /></button>
                          <button className="btn-icon"><Info size={18} /></button>
                        </div>
                      </div>

                      {/* Messages Flow */}
                      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {currChat.messages.map(msg => {
                          const isMe = msg.sender === 'vendor';
                          return (
                            <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                              <div style={{ background: isMe ? '#39FF14' : theme.bg, color: isMe ? '#000' : theme.text, padding: '12px 18px', borderRadius: isMe ? '18px 18px 0 18px' : '18px 18px 18px 0', border: isMe ? 'none' : `1px solid ${theme.border}`, fontSize: '0.9rem', lineHeight: '1.4', fontWeight: isMe ? 600 : 400, boxShadow: isMe ? '0 4px 14px rgba(57,255,20,0.2)' : 'none' }}>
                                {msg.text}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: theme.muted, marginTop: 6, textAlign: isMe ? 'right' : 'left' }}>{msg.time}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Input Box */}
                      <div style={{ padding: 20, borderTop: `1px solid ${theme.border}` }}>
                        <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <button type="button" style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.muted, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <Paperclip size={18} />
                          </button>
                          <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '12px 16px', outline: 'none' }} />
                          <button type="submit" disabled={!chatInput.trim()} style={{ background: chatInput.trim() ? '#39FF14' : theme.bg, color: chatInput.trim() ? '#000' : theme.muted, border: `1px solid ${chatInput.trim() ? '#39FF14' : theme.border}`, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: chatInput.trim() ? 1 : 0.6, boxShadow: chatInput.trim() ? '0 4px 14px rgba(57,255,20,0.3)' : 'none', transition: 'all 0.3s' }}>
                            <Send size={18} />
                          </button>
                        </form>
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>
          )}

          {/* -------- POINT OF SALE (POS) ------- */}
          {activeTab === 'pos' && (
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : 'calc(100vh - 120px)', gap: 20, animation: 'fadeIn 0.3s' }}>

              {/* Product Grid */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minHeight: isMobile ? 300 : 'auto' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 8 : 0 }}>
                  {['All', 'Burgers', 'Pizza', 'Drinks', 'Extras'].map(cat => (
                    <button key={cat} style={{ background: theme.card, padding: '10px 24px', borderRadius: 20, border: `1px solid ${theme.border}`, color: theme.text, fontWeight: 700, cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap', ...cat === 'All' ? { background: '#39FF14', color: '#000', border: 'none' } : {} }}>
                      {cat}
                    </button>
                  ))}
                  <div style={{ flex: 1, minWidth: isMobile ? 20 : 0 }}></div>
                  <button
                    onClick={() => setIsSalesReturn(!isSalesReturn)}
                    disabled={!hasPerm('sales_return')}
                    style={{ padding: '10px 20px', borderRadius: 20, border: 'none', fontWeight: 800, cursor: hasPerm('sales_return') ? 'pointer' : 'not-allowed', background: isSalesReturn ? '#ef4444' : 'rgba(239,68,68,0.1)', color: isSalesReturn ? '#fff' : '#ef4444', transition: '0.2s', display: 'flex', alignItems: 'center', gap: 8, opacity: hasPerm('sales_return') ? 1 : 0.4, whiteSpace: 'nowrap' }}>
                    <RefreshCw size={16} /> {isSalesReturn ? 'Sales Return ACTIVE' : 'Sales Return'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, overflowY: 'auto', paddingRight: 10 }}>
                  {products.length === 0 ? <div style={{ color: theme.muted }}>No products found in system.</div> : products.map(p => (
                    <div key={p.id} onClick={() => {
                      const existing = posCart.find(x => x.id === p.id);
                      if (existing) setPosCart(posCart.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
                      else setPosCart([...posCart, { ...p, qty: 1 }]);
                      // Micro-animation / Sound could go here
                    }} style={{ 
                      background: isSalesReturn ? 'rgba(239,68,68,0.05)' : theme.card, 
                      border: `1px solid ${isSalesReturn ? '#ef4444' : theme.border}`, 
                      borderRadius: 16, padding: 12, cursor: 'pointer', transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                      userSelect: 'none', display: 'flex', flexDirection: 'column', position: 'relative',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                    >
                      {p.stock === 'Low Stock' && <div style={{ position: 'absolute', top: 8, right: 8, background: '#ef4444', color: '#fff', fontSize: '0.55rem', padding: '2px 6px', borderRadius: 6, fontWeight: 900, zIndex: 2 }}>LOW STOCK</div>}
                      <div style={{ width: '100%', height: 80, background: theme.bg, borderRadius: 10, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                        {p.category === 'Pizza' ? '🍕' : p.category === 'Burgers' ? '🍔' : p.category === 'Drinks' ? '🥤' : '🍟'}
                      </div>
                      <div style={{ fontWeight: 800, color: theme.text, marginBottom: 4, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: isSalesReturn ? '#ef4444' : '#39FF14', fontWeight: 900, fontSize: '0.9rem' }}>{isSalesReturn ? '-' : ''}Rs {p.price}</div>
                        <div style={{ padding: 4, borderRadius: 6, background: theme.bg, fontSize: '0.65rem', color: theme.muted }}>{p.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Panel */}
              <div style={{ width: isMobile ? '100%' : 420, background: isSalesReturn ? 'rgba(239,68,68,0.05)' : theme.card, borderRadius: 16, border: `1px solid ${isSalesReturn ? '#ef4444' : theme.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 20, borderBottom: `1px solid ${theme.border}` }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    <button onClick={() => setPosType('Takeaway')} style={{ flex: 1, padding: '10px 4px', fontSize: '0.85rem', borderRadius: 8, border: 'none', fontWeight: 800, cursor: 'pointer', background: posType === 'Takeaway' ? '#8b5cf6' : theme.bg, color: posType === 'Takeaway' ? '#fff' : theme.muted }}>Takeaway</button>
                    <button onClick={() => setPosType('Dine-In')} style={{ flex: 1, padding: '10px 4px', fontSize: '0.85rem', borderRadius: 8, border: 'none', fontWeight: 800, cursor: 'pointer', background: posType === 'Dine-In' ? '#3b82f6' : theme.bg, color: posType === 'Dine-In' ? '#fff' : theme.muted }}>Dine-In</button>
                    <button onClick={() => setPosType('Delivery')} style={{ flex: 1, padding: '10px 4px', fontSize: '0.85rem', borderRadius: 8, border: 'none', fontWeight: 800, cursor: 'pointer', background: posType === 'Delivery' ? '#f97316' : theme.bg, color: posType === 'Delivery' ? '#fff' : theme.muted }}>Delivery</button>
                    <button onClick={() => setPosType('Foodpanda')} style={{ flex: 1, padding: '10px 4px', fontSize: '0.85rem', borderRadius: 8, border: 'none', fontWeight: 800, cursor: 'pointer', background: posType === 'Foodpanda' ? '#e21b70' : theme.bg, color: posType === 'Foodpanda' ? '#fff' : theme.muted }}>FP</button>
                  </div>

                  {posType === 'Foodpanda' ? (
                    <div style={{ marginBottom: 10 }}>
                      <input type="text" placeholder="Foodpanda Order Code (e.g. j7x2-82)" value={fpCode} onChange={e => setFpCode(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px dashed #e21b70`, outline: 'none', fontWeight: 800, boxSizing: 'border-box' }} />
                    </div>
                  ) : posType === 'Delivery' ? (
                    <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input type="text" placeholder="Customer Name *" value={deliveryCustomer.name} onChange={e => setDeliveryCustomer({ ...deliveryCustomer, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 700, boxSizing: 'border-box' }} />
                      <input type="tel" placeholder="Phone Number *" value={deliveryCustomer.phone} onChange={e => setDeliveryCustomer({ ...deliveryCustomer, phone: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontWeight: 700, boxSizing: 'border-box' }} />
                      <textarea rows={2} placeholder="Delivery Address *" value={deliveryCustomer.address} onChange={e => setDeliveryCustomer({ ...deliveryCustomer, address: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid #f97316`, outline: 'none', fontWeight: 600, boxSizing: 'border-box', resize: 'none' }} />
                      <select value={riderAssigned} onChange={e => setRiderAssigned(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                        <option value="">Assign Delivery Rider (Auto)</option>
                        <option value="Rider Ali">Rider Ali (Available)</option>
                        <option value="Rider Zeeshan">Rider Zeeshan (Available)</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 10 }}>
                      <input type="text" placeholder="Customer Name & Contact" value={posCustomer} onChange={e => setPosCustomer(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {posCart.length === 0 && <div style={{ margin: 'auto', color: theme.muted }}>Cart is empty</div>}
                  {posCart.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', WebkitUserSelect: 'none' }}>
                          <button onClick={() => setPosCart(posCart.map(x => x.id === c.id ? { ...x, qty: x.qty + 1 } : x))} style={{ background: theme.bg, border: 'none', color: theme.text, cursor: 'pointer', padding: 4, borderRadius: 4 }}>▲</button>
                          <div style={{ textAlign: 'center', fontWeight: 800 }}>{c.qty}</div>
                          <button onClick={() => {
                            if (c.qty > 1) setPosCart(posCart.map(x => x.id === c.id ? { ...x, qty: x.qty - 1 } : x));
                            else setPosCart(posCart.filter(x => x.id !== c.id));
                          }} style={{ background: theme.bg, border: 'none', color: theme.text, cursor: 'pointer', padding: 4, borderRadius: 4 }}>▼</button>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: theme.text }}>{c.name}</div>
                          <div style={{ fontSize: '0.8rem', color: theme.muted }}>Rs {c.price}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: isSalesReturn ? '#ef4444' : theme.text }}>{isSalesReturn ? '-' : ''}Rs {c.price * c.qty}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0 20px 20px', borderTop: `1px dashed ${theme.border}`, background: 'rgba(0,0,0,0.1)' }}>
                  {/* DISCOUNT / SERVICE / TAX / SPLIT — Admin Only Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '14px 0', borderBottom: `1px dashed ${theme.border}`, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: theme.muted, fontSize: '0.8rem', width: 55 }}>Discount</span>
                      <select value={posDiscount.type} onChange={e => setPosDiscount({ ...posDiscount, type: e.target.value })} disabled={!hasPerm('ALL')} style={{ padding: '5px', borderRadius: 6, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '0.75rem', opacity: hasPerm('ALL') ? 1 : 0.5 }}>
                        <option value="amount">Rs</option>
                        <option value="percent">%</option>
                      </select>
                      <input type="number" placeholder="0" value={posDiscount.value} onChange={e => setPosDiscount({ ...posDiscount, value: e.target.value })} disabled={!hasPerm('ALL')} style={{ width: 50, padding: '5px', borderRadius: 6, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', opacity: hasPerm('ALL') ? 1 : 0.5 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: theme.muted, fontSize: '0.8rem', width: 55 }}>Svc Chg</span>
                      <input type="number" placeholder="0" value={posServiceCharge} onChange={e => setPosServiceCharge(Number(e.target.value))} disabled={!hasPerm('ALL')} style={{ width: 50, padding: '5px', borderRadius: 6, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', opacity: hasPerm('ALL') ? 1 : 0.5 }} />
                      <span style={{ color: theme.muted, fontSize: '0.75rem' }}>Rs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: theme.muted, fontSize: '0.8rem', width: 55 }}>Tax %</span>
                      <input type="number" value={posTaxRate} onChange={e => setPosTaxRate(Number(e.target.value))} disabled={!hasPerm('ALL')} style={{ width: 50, padding: '5px', borderRadius: 6, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none', opacity: hasPerm('ALL') ? 1 : 0.5 }} />
                      <span style={{ color: theme.muted, fontSize: '0.75rem' }}>%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: theme.muted, fontSize: '0.8rem', width: 55 }}>Split</span>
                      <input type="number" min="1" max="10" value={posBillSplit} onChange={e => setPosBillSplit(Math.max(1, Number(e.target.value)))} style={{ width: 50, padding: '5px', borderRadius: 6, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, outline: 'none' }} />
                      <span style={{ color: theme.muted, fontSize: '0.75rem' }}>pax</span>
                    </div>
                  </div>
                  {!hasPerm('ALL') && <div style={{ fontSize: '0.7rem', color: '#f97316', marginBottom: 8, fontWeight: 600 }}>⚠ Discount, Tax & Service Charge locked — Admin only</div>}

                  {(() => {
                    const subtotal = posCart.reduce((s, c) => s + (c.price * c.qty), 0);
                    const discAmt = posDiscount.type === 'amount' ? Number(posDiscount.value) : (subtotal * (Number(posDiscount.value) / 100));
                    const taxable = subtotal - discAmt + posServiceCharge;
                    const tax = Math.round(taxable * (posTaxRate / 100));
                    const grandTotal = taxable + tax;
                    const perPerson = posBillSplit > 1 ? Math.ceil(grandTotal / posBillSplit) : grandTotal;

                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: theme.muted, fontSize: '0.85rem' }}><span>Subtotal</span><span>Rs {subtotal}</span></div>
                        {discAmt > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#39FF14', fontSize: '0.85rem' }}><span>Discount</span><span>- Rs {Math.round(discAmt)}</span></div>}
                        {posServiceCharge > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#3b82f6', fontSize: '0.85rem' }}><span>Service Charge</span><span>Rs {posServiceCharge}</span></div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: theme.muted, fontSize: '0.85rem' }}><span>Tax ({posTaxRate}%)</span><span>Rs {tax}</span></div>
                        {posBillSplit > 1 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 800 }}><span>Split ({posBillSplit} pax)</span><span>Rs {perPerson} each</span></div>}
                        <button onClick={() => setCheckoutModal(true)} disabled={posCart.length === 0} style={{ width: '100%', padding: 16, marginTop: 10, background: posCart.length === 0 ? theme.bg : (isSalesReturn ? '#ef4444' : '#39FF14'), color: posCart.length === 0 ? theme.muted : (isSalesReturn ? '#fff' : '#000'), border: 'none', borderRadius: 12, fontWeight: 900, fontSize: '1.2rem', cursor: posCart.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'space-between', boxShadow: posCart.length > 0 ? (isSalesReturn ? '0 8px 20px rgba(239,68,68,0.3)' : '0 8px 20px rgba(57,255,20,0.3)') : 'none' }}>
                          <span>{isSalesReturn ? 'REVERSE' : 'PAY NOW'}</span>
                          <span>{isSalesReturn ? '-' : ''}Rs {grandTotal}</span>
                        </button>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Checkout / Print Modal */}
              {checkoutModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, WebkitBackdropFilter: 'blur(8px)' }}>
                  <div style={{ background: theme.card, padding: 30, borderRadius: 20, width: 500, border: `1px solid ${theme.border}`, animation: 'floatIn 0.3s ease' }}>
                    <h2 style={{ margin: '0 0 20px 0', color: theme.text, textAlign: 'center' }}>Print Invoice</h2>
                    <p style={{ color: theme.muted, textAlign: 'center', marginBottom: 30 }}>Order punched successfully. Select print format to generate invoice.</p>

                    <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
                      <button onClick={() => triggerPOSPrint('thermal')} style={{ padding: 20, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <Printer size={24} color="#39FF14" /> <div><b>Print Thermal Receipt</b><br /><span style={{ fontSize: '0.8rem', color: theme.muted, fontWeight: 500 }}>80mm Roll for POS Hardware</span></div>
                      </button>
                      <button onClick={() => triggerPOSPrint('a4')} style={{ padding: 20, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 12, fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <BookOpen size={24} color="#3b82f6" /> <div><b>Print A4 / Save PDF</b><br /><span style={{ fontSize: '0.8rem', color: theme.muted, fontWeight: 500 }}>Standard Corporate Tax Invoice</span></div>
                      </button>
                    </div>

                    <button onClick={() => setCheckoutModal(false)} style={{ width: '100%', padding: 14, marginTop: 20, background: 'transparent', color: '#ef4444', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'gallery' && (
            <div style={{ animation: 'fadeIn 0.4s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ margin: 0 }}>Centralized Media Gallery</h2>
                  <p style={{ color: theme.muted, fontSize: '0.85rem', marginTop: 4 }}>
                    {currentUser?.role === 'SUPER_ADMIN' ? 'System-wide asset management' : 'Authorized media assets for your tenant'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" style={{ ...actBtn, background: '#39FF14', color: '#000' }}><Plus size={16} /> Upload Media</button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
                {(currentUser?.role === 'SUPER_ADMIN' 
                  ? ['Restaurant', 'Shops', 'Deliveryman', 'Banners', 'Brands', 'Blogs', 'Categories', 'Coupons', 'Products'] 
                  : ['Categories']
                ).map(folder => (
                  <div key={folder} style={{ 
                    background: theme.card, borderRadius: 24, padding: 32, border: `1px solid ${theme.border}`, 
                    textAlign: 'center', cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-8px)'; e.currentTarget.style.borderColor='#39FF14';}} onMouseOut={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor=theme.border;}}>
                    <div style={{ fontSize: '4.5rem', marginBottom: 16 }}>📂</div>
                    <div style={{ fontWeight: 900, fontSize: '1.2rem', color: theme.text }}>{folder}</div>
                    <div style={{ fontSize: '0.8rem', color: theme.muted, marginTop: 6, fontWeight: 600 }}>124 Items · 850 MB</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <MasterConfiguration theme={theme} darkMode={darkMode} showToast={showToast} API={API} vendor={vendor} />
          )}

        </div>
      </main>
    </div>
  );
}

const Image = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);
const RefreshCw = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
);
