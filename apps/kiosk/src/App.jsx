import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, ChevronLeft, CreditCard, QrCode, Utensils, UtensilsCrossed, Plus, Minus, X, Info } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';

// --- MOCK MEGA MENU ---
const MENU = [
  { id: '1', name: 'Galaxy Smash Meal', category: 'Meals', price: 1250, image: '🍔', desc: 'Double patty burger + fries + drink', upsell: true },
  { id: '2', name: 'Zinger Box', category: 'Meals', price: 950, image: '🍱', desc: 'Zinger + hot wings + drink', upsell: true },
  { id: '3', name: 'Mighty Burger', category: 'Burgers', price: 750, image: '🍔', desc: 'Large crispy chicken burger' },
  { id: '4', name: 'Spicy Wrap', category: 'Wraps', price: 500, image: '🌯', desc: 'Spicy chicken in toasted tortilla' },
  { id: '5', name: 'Loaded Fries', category: 'Sides', price: 450, image: '🍟', desc: 'Fries with cheese and jalapeños' },
  { id: '6', name: 'Oreo Shake', category: 'Drinks', price: 400, image: '🥤', desc: 'Thick shake with crushed oreos' },
  { id: '7', name: 'Ice Cream', category: 'Dessert', price: 250, image: '🍦', desc: 'Vanilla cone' },
];

export default function App() {
  const [screen, setScreen] = useState('splash'); // splash | orderMode | menu | checkout | success
  const [orderMode, setOrderMode] = useState(''); // 'DINE_IN' or 'TAKEAWAY'
  const [cart, setCart] = useState([]); // { ...item, cartId, qty }
  const [activeCategory, setActiveCategory] = useState('Meals');
  
  // Modals
  const [showCart, setShowCart] = useState(false);
  
  // Inactivity Timeout
  let timeoutRef = useRef(null);
  
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (screen !== 'splash' && screen !== 'success') {
      timeoutRef.current = setTimeout(() => {
        setScreen('splash'); setCart([]); setOrderMode(''); setShowCart(false);
      }, 60000); // 60s inactivity resets kiosk
    }
  };

  useEffect(() => {
    window.addEventListener('click', resetTimeout);
    window.addEventListener('touchstart', resetTimeout);
    return () => { window.removeEventListener('click', resetTimeout); window.removeEventListener('touchstart', resetTimeout); };
  }, [screen]);

  // Logic
  const categories = [...new Set(MENU.map(m=>m.category))];

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, cartId: Date.now(), qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id===id ? { ...i, qty: i.qty + delta } : i).filter(i=>i.qty>0));
  };

  const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);

  const placeOrder = () => {
    setScreen('success');
    // Play sound or network request to KDS
    setTimeout(() => {
      setScreen('splash'); setCart([]); setOrderMode(''); setShowCart(false);
    }, 10000); // show success for 10s
  };

  // --- VIEWS ---

  if (screen === 'splash') {
    return (
      <div className="splash-screen fade-in" onClick={() => setScreen('orderMode')}>
        <div className="splash-bg">🍔</div>
        <div className="splash-content">
          <h1 style={{fontSize:'5rem', marginBottom:20, fontWeight:900, textTransform:'uppercase'}}>Galaxy Kiosk</h1>
          <div style={{fontSize:'2.5rem', opacity:0.8}}>Touch anywhere to order</div>
        </div>
      </div>
    );
  }

  if (screen === 'orderMode') {
    return (
      <div className="splash-screen fade-in" style={{background:'var(--bg-dark)'}}>
        <h1 style={{fontSize:'4rem', marginBottom:80, fontWeight:900}}>Where will you be eating?</h1>
        <div className="flex" style={{gap:60}}>
          <div onClick={()=>{setOrderMode('DINE_IN'); setScreen('menu');}}
               style={{background:'var(--bg-card)', padding:80, borderRadius:40, textAlign:'center', cursor:'pointer', border:'4px solid var(--border-color)', width:400}}>
            <UtensilsCrossed size={120} className="text-accent m-auto mb-40" />
            <div style={{fontSize:'3rem', fontWeight:900}}>Dine In</div>
          </div>
          <div onClick={()=>{setOrderMode('TAKEAWAY'); setScreen('menu');}}
               style={{background:'var(--bg-card)', padding:80, borderRadius:40, textAlign:'center', cursor:'pointer', border:'4px solid transparent', width:400}}>
             <ShoppingBag size={120} className="text-accent m-auto mb-40" />
             <div style={{fontSize:'3rem', fontWeight:900}}>Take Away</div>
          </div>
        </div>
        <button className="btn btn-outline" style={{position:'absolute', bottom:40, left:40, fontSize:'1.5rem', padding:'20px 40px'}} onClick={()=>setScreen('splash')}><ChevronLeft size={30}/> Cancel</button>
      </div>
    );
  }

  if (screen === 'menu') {
    return (
      <div className="kiosk-container fade-in">
        <div className="split-view">
          {/* SIDEBAR NAVIGATION */}
          <div className="nav-sidebar">
             <div style={{fontWeight:900, fontSize:'2rem', color:'var(--accent)', marginBottom:40}}>GX</div>
             {categories.map(c => (
               <div key={c} className={`nav-item ${activeCategory===c?'active':''}`} onClick={()=>setActiveCategory(c)}>
                 <div className="nav-label text-center" style={{fontSize:'1.3rem'}}>{c}</div>
               </div>
             ))}
             <button className="btn-icon mt-auto" style={{width:80, height:80, background:'var(--neon-red)'}} onClick={()=>{setScreen('splash'); setCart([]);}}>
               <X size={40}/>
             </button>
          </div>

          {/* PRODUCT GRID */}
          <div className="product-area">
            <h1 style={{fontSize:'3rem', marginBottom:40}}>{activeCategory}</h1>
            <div className="grid-3">
              {MENU.filter(m => m.category === activeCategory).map(item => (
                <div key={item.id} className={`kiosk-card ${item.upsell ? 'ai-upsell' : ''}`} onClick={()=>addToCart(item)}>
                  <div className="card-img">{item.image}</div>
                  <div>
                    {item.upsell && <div className="text-accent font-bold text-sm mb-10">✨ Popular Choice</div>}
                    <div className="card-title">{item.name}</div>
                    <div className="text-muted text-sm mb-20">{item.desc}</div>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                     <div className="card-price">Rs {item.price}</div>
                     <div className="btn-icon" style={{width:60, height:60, background:'var(--accent)', color:'#000'}}><Plus size={30}/></div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pad bottom for cart */}
            <div style={{height: 180}}></div>
          </div>
        </div>

        {/* FLOATING CART BAR */}
        <div className="cart-drawer slide-up">
           <div className="flex items-center gap-40">
             <div className="flex flex-col" style={{cursor:'pointer'}} onClick={()=>setShowCart(true)}>
               <div style={{fontSize:'1.2rem'}}>{cart.reduce((s,i)=>s+i.qty,0)} Items in Cart</div>
               <div style={{fontSize:'2.5rem', fontWeight:900, color:'var(--accent)'}}>Rs {total.toLocaleString()}</div>
             </div>
             <button className="btn btn-outline" style={{padding:'15px 30px'}} onClick={()=>setShowCart(true)}>View Order</button>
           </div>
           
           <button className="btn btn-primary" style={{padding:'30px 60px', fontSize:'2rem', borderRadius:30}} onClick={() => cart.length > 0 ? setScreen('checkout') : alert('Cart is empty')} disabled={cart.length===0}>
              Checkout <ChevronLeft size={30} style={{transform:'rotate(180deg)'}}/>
           </button>
        </div>

        {/* VIEW CART MODAL */}
        {showCart && (
          <div className="modal-back fade-in" onClick={()=>setShowCart(false)}>
            <div className="modal-content slide-up" onClick={e=>e.stopPropagation()}>
               <div className="flex justify-between items-center mb-40">
                 <h1 style={{fontSize:'3rem'}}>Your Order</h1>
                 <button className="btn-icon" style={{width:60,height:60}} onClick={()=>setShowCart(false)}><X size={30}/></button>
               </div>

               <div className="cart-list">
                 {cart.length === 0 ? <div style={{fontSize:'2rem', opacity:0.5, padding:40}}>Cart is empty</div> : 
                   cart.map(item => (
                     <div key={item.id} className="cart-item">
                        <div style={{fontSize:'3rem', marginRight:20}}>{item.image}</div>
                        <div className="flex-1 text-left">
                          <div style={{fontSize:'1.8rem', fontWeight:800}}>{item.name}</div>
                          <div className="text-accent" style={{fontSize:'1.5rem', fontWeight:800}}>Rs {item.price}</div>
                        </div>
                        <div className="flex items-center gap-20">
                          <button className="btn-icon" style={{width:60,height:60}} onClick={()=>updateQty(item.id, -1)}><Minus size={24}/></button>
                          <div className="qty-badge">{item.qty}</div>
                          <button className="btn-icon" style={{width:60,height:60}} onClick={()=>updateQty(item.id, 1)}><Plus size={24}/></button>
                        </div>
                     </div>
                   ))
                 }
               </div>

               <div className="flex justify-between items-center mt-40 pt-40" style={{borderTop:'2px solid var(--border-color)'}}>
                 <div style={{fontSize:'2rem', opacity:0.5}}>Total To Pay</div>
                 <div style={{fontSize:'3rem', fontWeight:900, color:'var(--accent)'}}>Rs {total.toLocaleString()}</div>
               </div>

               <button className="btn btn-primary w-full mt-40" style={{padding:40, fontSize:'2rem', borderRadius:30}} onClick={()=>{setShowCart(false); setScreen('checkout');}} disabled={cart.length===0}>
                 Proceed to Checkout
               </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'checkout') {
    return (
      <div className="splash-screen fade-in" style={{background:'var(--bg-dark)'}}>
        <h1 style={{fontSize:'4rem', marginBottom:80, fontWeight:900}}>Select Payment Method</h1>
        <div style={{fontSize:'3rem', color:'var(--accent)', fontWeight:900, marginBottom:80}}>Total: Rs {total.toLocaleString()}</div>
        
        <div className="flex" style={{gap:40}}>
          <div onClick={placeOrder}
               style={{background:'var(--bg-card)', padding:60, borderRadius:40, textAlign:'center', cursor:'pointer', border:'2px solid var(--border-color)', width:350}}>
            <CreditCard size={100} className="text-accent m-auto mb-40" />
            <div style={{fontSize:'2rem', fontWeight:900}}>Card Reader</div>
            <div className="text-muted text-sm mt-10">Insert or tap card below</div>
          </div>
          <div onClick={placeOrder}
               style={{background:'var(--bg-card)', padding:60, borderRadius:40, textAlign:'center', cursor:'pointer', border:'2px solid var(--border-color)', width:350}}>
             <QrCode size={100} className="text-accent m-auto mb-40" />
             <div style={{fontSize:'2rem', fontWeight:900}}>QR Scanner</div>
             <div className="text-muted text-sm mt-10">Scan barcode on your phone</div>
          </div>
        </div>

        <button className="btn btn-outline" style={{position:'absolute', bottom:40, left:40, fontSize:'1.5rem', padding:'20px 40px'}} onClick={()=>setScreen('menu')}><ChevronLeft size={30}/> Back to Menu</button>
      </div>
    );
  }

  if (screen === 'success') {
    const orderNo = Math.floor(Math.random() * 800) + 100;
    return (
      <div className="splash-screen fade-in">
         <div style={{background:'var(--bg-card)', padding:80, borderRadius:40, textAlign:'center', border:'4px solid var(--accent)', maxWidth:800}}>
           <div style={{width:140, height:140, background:'var(--accent)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 40px'}}>
             <CheckCircle size={80} color="#000"/>
           </div>
           <h1 style={{fontSize:'4rem', marginBottom:20}}>Payment Successful</h1>
           <div style={{fontSize:'2rem', opacity:0.8, marginBottom:40}}>Please take your receipt</div>
           
           <div style={{background:'var(--bg-dark)', padding:40, borderRadius:20}}>
              <div style={{fontSize:'1.5rem', opacity:0.6, marginBottom:10}}>Your Order Number</div>
              <div style={{fontSize:'6rem', fontWeight:900, color:'var(--accent)', letterSpacing:10}}>{orderNo}</div>
           </div>
           <div style={{fontSize:'1.5rem', opacity:0.6, marginTop:40}}>Preparing for {orderMode.replace('_', ' ')}...</div>
         </div>
      </div>
    );
  }

  return null;
}
