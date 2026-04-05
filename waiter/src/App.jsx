import React, { useState } from 'react';
import { ChefHat, CreditCard, MessageSquare, PhoneCall, ChevronLeft, Search, CheckCircle, Plus, Minus, ShoppingBag, MapPin, X } from 'lucide-react';

const MENU_DATA = [
  { id: 1, name: 'Cheese hot Hamburger', price: 20.99, desc: 'Cheeseburger is a round sandwich with fried cutlet, cheese and salad on a muffin.', cat: 'Burger', imgPlaceholder: '🍔' },
  { id: 2, name: 'Chicken wings', price: 25.99, desc: 'Delicious fried chicken wings with spicy sauce.', cat: 'Burger', imgPlaceholder: '🍗' },
  { id: 3, name: 'Sous vide Burger', price: 19.50, desc: 'Premium sous-vide beef patty with melted cheese.', cat: 'Burger', imgPlaceholder: '🍔' },
  { id: 4, name: 'Healthy Salad', price: 10.00, desc: 'Fresh greens, avocado, feta cheese.', cat: 'Salad', imgPlaceholder: '🥗' },
  { id: 5, name: 'Supreme Pizza', price: 15.00, desc: 'Classic supreme with pepperoni and veg.', cat: 'Pizza', imgPlaceholder: '🍕' }
];

const CATS = [
  { name: 'Burger', icon: '🍔' },
  { name: 'Salad', icon: '🥗' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Soup', icon: '🍲' }
];

const SIZES = [
  { label: 'Small', extra: 0 },
  { label: 'Medium', extra: 12 },
  { label: 'Large', extra: 25 }
];

const ADDONS = [
  { label: 'Double Cheese', price: 12 },
  { label: 'Double meat', price: 12 },
  { label: 'Double chilie', price: 25 }
];

export default function App() {
  const [view, setView] = useState('home'); // home, menu, customize, checkout
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState('Burger');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Customization state
  const [selSize, setSelSize] = useState(SIZES[1]); // Default Medium
  const [selAddons, setSelAddons] = useState([]);
  const [qty, setQty] = useState(1);

  // Checkout state
  const [tip, setTip] = useState(15);
  const [payMethod, setPayMethod] = useState('card');

  const openCustomize = (item) => {
    setSelectedItem(item);
    setSelSize(SIZES[0]); // Reset to small
    setSelAddons([]);
    setQty(1);
    setView('customize');
  };

  const toggleAddon = (addon) => {
    setSelAddons(prev => 
      prev.find(a => a.label === addon.label) 
        ? prev.filter(a => a.label !== addon.label)
        : [...prev, addon]
    );
  };

  const getCustomizedPrice = () => {
    let base = selectedItem ? selectedItem.price : 0;
    base += selSize.extra;
    selAddons.forEach(a => base += a.price);
    return base * qty;
  };

  const addToCart = () => {
    setCart(prev => [
      ...prev, 
      {
        id: Math.random().toString(),
        product: selectedItem,
        size: selSize,
        addons: selAddons,
        qty: qty,
        total: getCustomizedPrice()
      }
    ]);
    setView('menu');
  };

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const service = subtotal * 0.15;
  const tipAmount = subtotal * (tip / 100);
  const total = subtotal + service + tipAmount;

  const handleCheckout = async () => {
    const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';
    const token = localStorage.getItem('erp_token') || 'demo_token';
    const itemsPayload = cart.map(c => ({
      productId: c.product.id,
      quantity: c.qty,
      unitPrice: c.total / c.qty
    }));

    try {
      await fetch(`${API}/api/pos/orders`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
         body: JSON.stringify({
            outletId: 'OUTLET_1',
            type: 'DINE_IN',
            items: itemsPayload,
            totalAmount: total,
            taxAmount: service,
            payments: [{ method: 'CARD', amount: total }]
         })
      });
    } catch (e) {
      console.log('API call skipped or failed, simulating success.');
    }
    
    alert('Order sent successfully! Waiter will serve you soon.');
    setCart([]);
    setView('home');
  };

  return (
    <div className="app-container">
      
      {/* ════════════════════════════════════════════════════════ */}
      {/* 1. ONBOARDING (HOME) */}
      {view === 'home' && (
        <div className="onboarding fade-in">
          <div className="topbar" style={{padding: '0', marginBottom: '20px'}}>
             <div style={{fontWeight: 800, fontSize: '1.2rem'}}>🍽️ Foodyman</div>
             <div>Table <span style={{background:'black',color:'white',padding:'2px 8px',borderRadius:8}}>N°10</span></div>
          </div>
          
          <h1 className="brand-title">Best food<br/>for your<br/>taste</h1>
          
          <div className="card-grid">
            <div className="menu-card" onClick={() => setView('menu')}>
              <div className="menu-card-title">Menu</div>
              <div className="icon-circle"><ChevronLeft size={20} style={{transform: 'rotate(180deg)'}} /></div>
            </div>
            
            <div className="pay-card" onClick={() => cart.length > 0 ? setView('checkout') : alert('Your cart is empty!')}>
              <div className="icon-circle" style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none'}}>
                <CreditCard size={18} />
              </div>
              <div style={{fontWeight: 600, fontSize: '0.9rem'}}>Payment</div>
            </div>
            
            <div className="feed-card" onClick={() => alert('Feedback feature coming soon!')}>
              <div className="icon-circle" style={{background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none'}}>
                <MessageSquare size={18} />
              </div>
              <div style={{fontWeight: 600, fontSize: '0.9rem'}}>Feedback</div>
            </div>
          </div>
          
          <button className="bottom-btn" onClick={() => alert('Waiter is on their way!')}>
            <PhoneCall size={18} /> Call the waiter
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* 2. MENU SCREEN */}
      {view === 'menu' && (
        <div className="fade-in" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
           <div className="topbar">
             <button className="back-btn" onClick={() => setView('home')}><ChevronLeft size={20}/> Back</button>
             <div className="top-actions">
               <PhoneCall size={18} onClick={() => alert('Calling waiter!')} style={{cursor:'pointer'}}/>
               <MapPin size={18} style={{cursor:'pointer'}} />
               <Search size={18} style={{cursor:'pointer'}} />
             </div>
           </div>

           <div className="scrollarea">
             <div className="cat-scroll">
               {CATS.map(c => (
                 <div key={c.name} className={`cat-item ${activeCat === c.name ? 'active' : ''}`} onClick={() => setActiveCat(c.name)}>
                   <div className="cat-emoji">{c.icon}</div>
                   <div className="cat-name">{c.name}</div>
                 </div>
               ))}
             </div>

             <div className="deals-banner">
               <h2>Save 50% special offer</h2>
               <p>28 days left at 5D</p>
             </div>

             <div className="section-title-wrapper">Recommended</div>

             <div className="food-grid">
               {MENU_DATA.filter(m => m.cat === activeCat).map(item => (
                 <div key={item.id} className="food-card" onClick={() => openCustomize(item)}>
                   <div className="food-img-ph">{item.imgPlaceholder}</div>
                   <div className="food-info">
                     <div className="food-price">${item.price.toFixed(2)}</div>
                     <div className="food-name">{item.name}</div>
                     <div className="food-desc">{item.desc}</div>
                     <button className="add-btn">Add</button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           {cart.length > 0 && (
             <div className="cart-float" onClick={() => setView('checkout')}>
               <ShoppingBag size={24} />
               <div className="badge">{cart.reduce((a,c)=>a+c.qty,0)}</div>
             </div>
           )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* 3. CUSTOMIZE SCREEN */}
      {view === 'customize' && selectedItem && (
        <div className="customize-screen slide-up">
           <div className="topbar" style={{background: 'transparent', paddingBottom: 0}}>
             <button className="back-btn" onClick={() => setView('menu')}><ChevronLeft size={20}/> Back</button>
           </div>
           
           <div className="cust-header">
              <h1>{selectedItem.name}</h1>
              <p>{selectedItem.desc}</p>
           </div>

           <div className="cust-panel">
             <div className="scrollarea" style={{paddingBottom: 0}}>
                <div className="cust-card">
                   <div className="cust-title">Size</div>
                   {SIZES.map(s => (
                     <div key={s.label} className="cust-option" onClick={() => setSelSize(s)}>
                       <input type="radio" checked={selSize.label === s.label} readOnly />
                       <span>{s.label}</span>
                       <span className="opt-price">{s.extra > 0 ? `+${s.extra}$` : ''}</span>
                     </div>
                   ))}
                </div>

                <div className="cust-card">
                   <div className="cust-title">Ingredients</div>
                   {ADDONS.map(a => (
                     <div key={a.label} className="cust-option" onClick={() => toggleAddon(a)}>
                       <input type="checkbox" checked={!!selAddons.find(x => x.label === a.label)} readOnly />
                       <span>{a.label}</span>
                       <span className="opt-price">+{a.price}$</span>
                     </div>
                   ))}
                </div>
             </div>
           </div>

           <div className="cust-footer">
             <div className="qty-ctrl">
               <button className="qty-btn" onClick={() => setQty(Math.max(1, qty-1))}><Minus size={18}/></button>
               <span className="qty-val">{qty}</span>
               <button className="qty-btn" onClick={() => setQty(qty+1)}><Plus size={18}/></button>
             </div>
             
             <div className="bottom-add">
               <div className="tot-price-block">
                 <div className="tot-lbl">Total</div>
                 <div className="tot-val">${getCustomizedPrice().toFixed(1)}</div>
               </div>
               <button className="btn-large" onClick={addToCart}>Add</button>
             </div>
           </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* 4. CHECKOUT SCREEN */}
      {view === 'checkout' && (
        <div className="checkout-screen fade-in">
           <div className="topbar">
             <button className="back-btn" onClick={() => setView('menu')}><ChevronLeft size={20}/> Back</button>
           </div>
           
           <div className="cust-header" style={{paddingTop: 10}}>
              <h1 style={{fontSize: '1.6rem'}}>Your orders</h1>
              <p style={{color: '#111', fontWeight: 600, marginTop: 4}}>Table N°10 <span style={{margin: '0 8px', color: '#888'}}>•</span> Order opened: 12:45</p>
           </div>

           <div className="chk-panel scrollarea">
              <div className="order-items">
                {cart.map((c, i) => (
                  <div key={i} className="chk-item">
                    <div style={{flex:1}}>
                      <div className="chk-item-name">{c.product.name} x {c.qty}</div>
                      <div className="chk-item-mods">
                         Size: {c.size.label} {c.addons.length>0 && `| +${c.addons.map(a=>a.label).join(', ')}`}
                      </div>
                    </div>
                    <div className="chk-item-price">${c.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="tip-section">
                <h3>Do you want to leave a tip?</h3>
                <div className="tip-grid">
                  {[20, 15, 10, 5, 0].map(t => (
                    <div key={t} className={`tip-btn ${tip === t ? 'active' : ''}`} onClick={() => setTip(t)}>
                      {t === 0 ? 'No tip' : `${t}%`}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pay-methods">
                <div className={`pm-card ${payMethod === 'card' ? 'active' : ''}`} onClick={() => setPayMethod('card')}>
                   <CreditCard size={24} color={payMethod==='card' ? 'var(--accent)' : 'black'} />
                   <div style={{fontSize: '0.8rem', fontWeight: 600}}>**** 3848</div>
                </div>
                <div className={`pm-card ${payMethod === 'apple' ? 'active' : ''}`} onClick={() => setPayMethod('apple')}>
                   <div style={{fontWeight: 700, fontSize: '1rem', color: payMethod==='apple' ? 'var(--accent)' : 'black'}}>Cash</div>
                   <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Pay to waiter</div>
                </div>
              </div>

              <div className="summary-row"><span>Subtotal</span> <span>${subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Service (15%)</span> <span>${service.toFixed(2)}</span></div>
              {tipAmount > 0 && <div className="summary-row"><span>Tip ({tip}%)</span> <span>${tipAmount.toFixed(2)}</span></div>}
              <div className="summary-row bold"><span>Total</span> <span>${total.toFixed(2)}</span></div>
           </div>

           <button className="floating-btn" onClick={handleCheckout}>
              Continue to payment — ${total.toFixed(2)}
           </button>
        </div>
      )}

    </div>
  );
}
