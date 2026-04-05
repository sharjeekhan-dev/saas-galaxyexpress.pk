import React, { useState, useEffect, useRef } from 'react';
import { API, headers } from '../App.jsx';
import { Plus, Minus, ShoppingCart, Trash2, X, Check, Printer, RefreshCw, Search, CreditCard, User, Phone, MapPin, FileText, ArrowLeftRight, DoorOpen } from 'lucide-react';

export default function POSTerminal({ products, onRefresh }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [orderType, setOrderType] = useState('DINE_IN');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  
  // Totals & Variables
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(5);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [cashTendered, setCashTendered] = useState('');
  const [couponCode, setCouponCode] = useState('');
  
  // Customer Details (Delivery)
  const [customer, setCustomer] = useState({ name:'', phone:'', address:'', note:'' });

  // Modals & States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // holds placed order
  const [showRegister, setShowRegister] = useState(false);
  const [showReturns, setShowReturns] = useState(false);

  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');

  useEffect(() => {
    fetch(`${API}/api/outlets`, { headers: headers() })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) { setOutlets(d); setSelectedOutlet(d[0]?.id||''); } })
      .catch(() => {});
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && !p.isRawMaterial;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = discount > 0 ? subtotal * (discount / 100) : 0;
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = afterDiscount * (taxRate / 100);
  const serviceAmt = afterDiscount * (serviceCharge / 100);
  const total = afterDiscount + taxAmt + serviceAmt;

  const changeDue = paymentMethod === 'CASH' && cashTendered ? Math.max(0, parseFloat(cashTendered) - total) : 0;

  const placeOrder = async () => {
    if (!cart.length || !selectedOutlet) return;
    setLoading(true);
    try {
      const payload = {
        outletId: selectedOutlet,
        type: orderType,
        totalAmount: total,
        taxAmount: taxAmt,
        discount: discountAmt,
        couponCode: couponCode || undefined,
        items: cart.map(i => ({ productId: i.id, quantity: i.qty, unitPrice: i.price, name: i.name })),
        payments: [{ method: paymentMethod, amount: total, status: 'PAID' }],
        customerDetails: orderType === 'DELIVERY' ? customer : undefined
      };

      const res = await fetch(`${API}/api/pos/orders`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        // Build mock order object if backend doesn't return full details
        setSuccess({...payload, id: data.id || Math.floor(Math.random()*10000), orderNumber: data.orderNumber || 'POS-'+Math.floor(Math.random()*10000), date: new Date().toLocaleString(), changeDue});
        setCart([]); setDiscount(0); setCashTendered(''); setCouponCode('');
        setCustomer({name:'', phone:'', address:'', note:''});
        onRefresh(); // Ensures Admin Dashboard is updated
      }
    } catch {}
    finally { setLoading(false); }
  };

  const printInvoice = () => {
    const printContents = document.getElementById('printable-invoice').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Quick restore of React state
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><ShoppingCart size={20}/>POS Terminal (Real-time Sync)</div>
        <div className="flex gap-8">
          <button className="btn btn-sm btn-outline" onClick={()=>setShowReturns(true)}><ArrowLeftRight size={13}/>Returns/Reversals</button>
          <button className="btn btn-sm btn-orange" onClick={()=>setShowRegister(true)}><DoorOpen size={13}/>Cash Register</button>
          <select className="form-input" style={{width:180}} value={selectedOutlet} onChange={e=>setSelectedOutlet(e.target.value)}>
            {outlets.length ? outlets.map(o=><option key={o.id} value={o.id}>{o.name}</option>) : <option value="">Default Outlet</option>}
          </select>
          <select className="form-input" style={{width:140}} value={orderType} onChange={e=>setOrderType(e.target.value)}>
            <option value="DINE_IN">Dine-in</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>
      </div>

      {showRegister && (
        <div className="modal-overlay" onClick={()=>setShowRegister(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Cash Register / Day Close</div>
              <button className="btn-icon" onClick={()=>setShowRegister(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="glass-card"><div className="text-xs text-muted">Opening Cash</div><div className="font-bold">$200.00</div></div>
                <div className="glass-card"><div className="text-xs text-muted">Cash Sales Today</div><div className="font-bold var(--neon-green)">+$840.00</div></div>
                <div className="glass-card"><div className="text-xs text-muted">Card/Online Sales</div><div className="font-bold">+$1,240.00</div></div>
                <div className="glass-card"><div className="text-xs text-muted">Refunds/Reversals</div><div className="font-bold" style={{color:'var(--neon-red)'}}>-$45.00</div></div>
              </div>
              <div className="wallet-card mt-16 text-center" style={{background:'var(--gradient-primary)', color:'#000'}}>
                <div className="text-sm font-bold">Expected Drawer Cash</div>
                <div className="wallet-balance">$995.00</div>
              </div>
              <div className="form-group mt-16"><label>Actual Drawer Cash (Count)</label><input type="number" className="form-input" placeholder="0.00" /></div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={()=>setShowRegister(false)}>Cancel</button>
                <button className="btn btn-orange" onClick={()=>{alert('Register closed with printed Z-Report.');setShowRegister(false);}}>Close Register & Print Z-Report</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReturns && (
        <div className="modal-overlay" onClick={()=>setShowReturns(false)}>
          <div className="modal-card modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Returns & Reversals</div>
              <button className="btn-icon" onClick={()=>setShowReturns(false)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Scan or Enter Order ID</label><input className="form-input" placeholder="e.g. POS-10294" /></div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    <tr><td>POS-10294</td><td>Today 14:20</td><td>Walk-in</td><td>$34.50</td><td><span className="badge badge-success">Completed</span></td><td><button className="btn btn-sm btn-outline text-danger">Reverse</button></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL WITH PRINT INVOICE */}
      {success && (
        <div className="modal-overlay" style={{zIndex:9999}}>
          <div className="modal-card">
            <div style={{textAlign:'center',padding:'20px 0'}}>
              <Check size={48} color="var(--neon-green)" style={{margin:'0 auto 10px'}}/>
              <h2 style={{color:'var(--neon-green)',marginBottom:10}}>Order Placed</h2>
              <div>Change / Bakaya: <b style={{fontSize:'1.2rem'}}>${success.changeDue?.toFixed(2)}</b></div>
            </div>
            <div className="grid-2 mt-20" style={{gap:10}}>
              <button className="btn btn-primary" style={{justifyContent:'center'}} onClick={printInvoice}><Printer size={16}/> Print Invoice</button>
              <button className="btn btn-outline" style={{justifyContent:'center'}} onClick={()=>setSuccess(null)}>New Order</button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE INVOICE TEMPLATE */}
      {success && (
        <div id="printable-invoice" style={{display:'none'}}>
          <div style={{width:'80mm', fontFamily:'monospace', color:'#000', padding:'10px', fontSize:'12px'}}>
            <div style={{textAlign:'center', marginBottom:'10px'}}>
              <h2 style={{margin:0, fontSize:'18px'}}>GALAXY EXPRESS</h2>
              <p style={{margin:0}}>Super Market Branch</p>
              <p style={{margin:0}}>Tax ID: 123456789</p>
            </div>
            <div style={{borderBottom:'1px dashed #000', margin:'10px 0'}}></div>
            <p style={{margin:0}}>Order: #{success.orderNumber}</p>
            <p style={{margin:0}}>Date: {success.date}</p>
            <p style={{margin:0}}>Type: {success.type}</p>
            {success.type === 'DELIVERY' && success.customerDetails && (
              <>
                <div style={{borderBottom:'1px dashed #000', margin:'10px 0'}}></div>
                <p style={{margin:0}}>Customer: {success.customerDetails.name}</p>
                <p style={{margin:0}}>Phone: {success.customerDetails.phone}</p>
                <p style={{margin:0}}>Address: {success.customerDetails.address}</p>
              </>
            )}
            <div style={{borderBottom:'1px dashed #000', margin:'10px 0'}}></div>
            <table style={{width:'100%', fontSize:'12px', textAlign:'left'}}>
              <thead><tr><th>Item</th><th>Qty</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
              <tbody>
                {success.items.map((i, idx) => (
                  <tr key={idx}><td>{i.name}</td><td>x{i.quantity}</td><td style={{textAlign:'right'}}>${(i.unitPrice * i.quantity).toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
            <div style={{borderBottom:'1px dashed #000', margin:'10px 0'}}></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Subtotal</span><span>${(success.totalAmount - success.taxAmount - success.discount).toFixed(2)}</span></div>
            {success.discount > 0 && <div style={{display:'flex',justifyContent:'space-between'}}><span>Discount</span><span>-${success.discount.toFixed(2)}</span></div>}
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Tax & Services</span><span>${success.taxAmount.toFixed(2)}</span></div>
            <div style={{borderBottom:'1px dashed #000', margin:'10px 0'}}></div>
            <div style={{display:'flex',justifyContent:'space-between', fontWeight:'bold', fontSize:'14px'}}><span>TOTAL</span><span>${success.totalAmount.toFixed(2)}</span></div>
            <div style={{borderBottom:'1px dashed #000', margin:'10px 0'}}></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Paid ({success.payments[0].method})</span><span>${cashTendered || success.totalAmount.toFixed(2)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span>Change/Bakaya</span><span>${success.changeDue?.toFixed(2)}</span></div>
            <div style={{textAlign:'center', marginTop:'20px'}}>
              <p style={{margin:0}}>Thank you for your visit!</p>
              <p style={{margin:0}}>Powered by Foodyman SaaS</p>
            </div>
          </div>
        </div>
      )}

      <div className="pos-layout">
        {/* Product Panel */}
        <div className="pos-products">
          <div className="flex gap-10 mb-16">
            <div style={{position:'relative',flex:1}}>
              <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
              <input className="form-input" style={{paddingLeft:32}} placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-8 mb-16" style={{flexWrap:'wrap'}}>
            {categories.map(c => (
              <button key={c} className={`tab ${activeCategory===c?'active':''}`} onClick={()=>setActiveCategory(c)}>{c}</button>
            ))}
          </div>
          <div className="pos-product-grid">
            {filtered.length ? filtered.map(p => (
              <div key={p.id} className="pos-product-card" onClick={()=>addToCart(p)}>
                <div className="pos-product-name">{p.name}</div>
                <div className="text-xs text-muted mb-8">{p.category}</div>
                <div className="pos-product-price">${p.price?.toFixed(2)}</div>
              </div>
            )) : <div style={{gridColumn:'1/-1',textAlign:'center',padding:40,color:'var(--text-muted)'}}>No products found</div>}
          </div>
        </div>

        {/* Cart Panel */}
        <div className="pos-cart">
          <div className="pos-cart-header">
            <div className="flex justify-between items-center">
              <span>Current Order</span>
              {cart.length > 0 && <button className="btn-icon" onClick={()=>setCart([])} title="Clear cart"><Trash2 size={14}/></button>}
            </div>
          </div>
          
          {/* DELIVERY FORM */}
          {orderType === 'DELIVERY' && (
            <div style={{padding:'10px 15px', background:'var(--bg-card)', borderBottom:'1px solid var(--border-color)'}}>
              <div className="text-xs font-bold mb-8 flex items-center gap-4"><User size={12}/> Customer Details</div>
              <div className="grid-2" style={{gap:6}}>
                <input className="form-input" placeholder="Name" style={{padding:'6px 10px', fontSize:'0.85rem'}} value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} />
                <input className="form-input" placeholder="Phone" style={{padding:'6px 10px', fontSize:'0.85rem'}} value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} />
              </div>
              <input className="form-input mt-8" placeholder="Address" style={{padding:'6px 10px', fontSize:'0.85rem', width:'100%'}} value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} />
              <input className="form-input mt-8" placeholder="Delivery Notes (Optional)" style={{padding:'6px 10px', fontSize:'0.85rem', width:'100%'}} value={customer.note} onChange={e=>setCustomer({...customer,note:e.target.value})} />
            </div>
          )}

          <div className="pos-cart-items">
            {cart.length === 0 ? (
              <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}><ShoppingCart size={32} style={{marginBottom:10,opacity:0.3}}/><div>Tap products to add</div></div>
            ) : cart.map(item => (
              <div key={item.id} className="pos-cart-item">
                <div className="pos-cart-name">{item.name}</div>
                <div className="flex items-center gap-6">
                  <button className="pos-qty-btn" onClick={()=>updateQty(item.id,-1)}><Minus size={11}/></button>
                  <span className="pos-qty">{item.qty}</span>
                  <button className="pos-qty-btn" onClick={()=>updateQty(item.id,1)}><Plus size={11}/></button>
                </div>
                <div style={{fontWeight:700,minWidth:60,textAlign:'right'}}>${(item.price*item.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="pos-cart-footer">
            <div className="grid-2" style={{gap:10, marginBottom:10}}>
              {/* Discount */}
              <div className="flex items-center gap-8">
                <label className="text-xs text-muted">Dis%</label>
                <input type="number" min="0" max="100" className="form-input" value={discount} onChange={e=>setDiscount(+e.target.value)} style={{padding:'6px 10px', flex:1}}/>
              </div>
              {/* Service Charge */}
              <div className="flex items-center gap-8">
                <label className="text-xs text-muted">SC%</label>
                <input type="number" min="0" className="form-input" value={serviceCharge} onChange={e=>setServiceCharge(+e.target.value)} style={{padding:'6px 10px', flex:1}}/>
              </div>
              {/* Tax */}
              <div className="flex items-center gap-8" style={{gridColumn:'1/-1'}}>
                <label className="text-xs text-muted">Tax%</label>
                <input type="number" min="0" className="form-input" value={taxRate} onChange={e=>setTaxRate(+e.target.value)} style={{padding:'6px 10px', flex:1}}/>
              </div>
            </div>

            <div className="pos-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discountAmt>0 && <div className="pos-total-row" style={{color:'var(--neon-red)'}}><span>Discount ({discount}%)</span><span>-${discountAmt.toFixed(2)}</span></div>}
            <div className="pos-total-row"><span>Tax ({taxRate}%) + SC ({serviceCharge}%)</span><span>${(taxAmt+serviceAmt).toFixed(2)}</span></div>
            <div className="pos-total-row grand"><span>TOTAL</span><span>${total.toFixed(2)}</span></div>

            <div className="flex gap-6 mt-12 mb-12">
              {['CASH','CARD'].map(m => (
                <button key={m} className={`btn btn-sm ${paymentMethod===m?'btn-primary':'btn-outline'}`} style={{flex:1,justifyContent:'center'}} onClick={()=>setPaymentMethod(m)}>{m}</button>
              ))}
            </div>

            {paymentMethod === 'CASH' && (
              <div className="flex items-center justify-between mb-12 p-8" style={{background:'var(--bg-input)', borderRadius:8}}>
                <span className="text-sm font-bold">Cash Tendered:</span>
                <input type="number" className="form-input" placeholder="0.00" value={cashTendered} onChange={e=>setCashTendered(e.target.value)} style={{width:100, textAlign:'right'}} />
              </div>
            )}
            
            {paymentMethod === 'CASH' && cashTendered && parseFloat(cashTendered) >= total && (
              <div className="flex items-center justify-between mb-12 text-sm">
                <span style={{color:'var(--text-muted)'}}>Change/Bakaya:</span>
                <span style={{fontWeight:800, color:'var(--neon-green)'}}>${changeDue.toFixed(2)}</span>
              </div>
            )}

            <button
              className="btn btn-primary w-full"
              style={{justifyContent:'center',fontSize:'0.95rem',padding:'13px'}}
              onClick={placeOrder}
              disabled={loading||!cart.length || (paymentMethod==='CASH'&&cashTendered&&parseFloat(cashTendered)<total)}
            >
              {loading ? 'Placing…' : `Place Order $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
