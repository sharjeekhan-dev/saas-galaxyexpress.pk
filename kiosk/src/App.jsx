import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Search, ShoppingBag, X, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, QrCode, ChevronLeft, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ═══════════════════════════════════════
// PRODUCT DATA (fallback if API unavailable)
// ═══════════════════════════════════════
const CATEGORIES = ['🔥 Popular', '🍔 Burgers', '🍕 Pizza', '🥗 Salads', '🍟 Sides', '🥤 Drinks', '🍰 Desserts', '☕ Coffee'];
const DEMO_PRODUCTS = [
  { id:'p1', name:'Classic Smash Burger', category:'🍔 Burgers', price:12.99, desc:'Double beef patty, American cheese, pickles, secret sauce.', emoji:'🍔', popular:true, modifiers:[{name:'Extra Cheese',price:1.5},{name:'Bacon',price:2},{name:'Jalapeños',price:0.75}] },
  { id:'p2', name:'Crispy Chicken Burger', category:'🍔 Burgers', price:11.99, desc:'Crispy fried chicken, coleslaw, spicy mayo.', emoji:'🍗', modifiers:[{name:'Extra Spicy',price:0},{name:'Double Patty',price:3}] },
  { id:'p3', name:'Veggie Supreme', category:'🍔 Burgers', price:10.99, desc:'Plant-based patty, avocado, fresh veggies.', emoji:'🥬', modifiers:[{name:'Add Cheese',price:1}] },
  { id:'p4', name:'Margherita Pizza', category:'🍕 Pizza', price:14.99, desc:'Fresh mozzarella, basil, San Marzano tomato sauce.', emoji:'🍕', popular:true, modifiers:[{name:'Extra Cheese',price:2},{name:'Thin Crust',price:0},{name:'Stuffed Crust',price:3}] },
  { id:'p5', name:'Pepperoni Feast', category:'🍕 Pizza', price:16.99, desc:'Loaded pepperoni, mozzarella, oregano.', emoji:'🍕', modifiers:[{name:'Large Size',price:4},{name:'Extra Pepperoni',price:2}] },
  { id:'p6', name:'BBQ Chicken Pizza', category:'🍕 Pizza', price:17.99, desc:'Grilled chicken, BBQ sauce, red onions, cilantro.', emoji:'🍕', modifiers:[{name:'Large Size',price:4}] },
  { id:'p7', name:'Caesar Salad', category:'🥗 Salads', price:9.99, desc:'Romaine, parmesan, croutons, Caesar dressing.', emoji:'🥗', modifiers:[{name:'Add Chicken',price:3},{name:'Add Shrimp',price:4}] },
  { id:'p8', name:'Greek Salad', category:'🥗 Salads', price:8.99, desc:'Cucumber, tomato, feta, olives, olive oil.', emoji:'🥒', modifiers:[] },
  { id:'p9', name:'Truffle Fries', category:'🍟 Sides', price:6.99, desc:'Hand-cut fries, truffle oil, parmesan.', emoji:'🍟', popular:true, modifiers:[{name:'Extra Truffle Oil',price:1}] },
  { id:'p10', name:'Onion Rings', category:'🍟 Sides', price:5.99, desc:'Beer-battered, golden crispy.', emoji:'🧅', modifiers:[] },
  { id:'p11', name:'Mozzarella Sticks', category:'🍟 Sides', price:7.49, desc:'6 pieces with marinara dip.', emoji:'🧀', modifiers:[] },
  { id:'p12', name:'Loaded Nachos', category:'🍟 Sides', price:8.99, desc:'Tortilla chips, cheese, jalapeños, sour cream, guac.', emoji:'🌮', modifiers:[{name:'Add Beef',price:2.5}] },
  { id:'p13', name:'Fresh Lemonade', category:'🥤 Drinks', price:4.49, desc:'Freshly squeezed with mint.', emoji:'🍋', modifiers:[{name:'Sugar Free',price:0}] },
  { id:'p14', name:'Mango Smoothie', category:'🥤 Drinks', price:5.99, desc:'Fresh mango, yogurt, honey.', emoji:'🥭', popular:true, modifiers:[{name:'Add Protein',price:1.5}] },
  { id:'p15', name:'Iced Cola', category:'🥤 Drinks', price:2.99, desc:'Classic cola with ice.', emoji:'🥤', modifiers:[{name:'Large',price:1}] },
  { id:'p16', name:'Sparkling Water', category:'🥤 Drinks', price:2.49, desc:'Chilled sparkling mineral water.', emoji:'💧', modifiers:[] },
  { id:'p17', name:'Chocolate Lava Cake', category:'🍰 Desserts', price:8.99, desc:'Warm molten chocolate center, vanilla ice cream.', emoji:'🍫', popular:true, modifiers:[{name:'Extra Ice Cream',price:2}] },
  { id:'p18', name:'Tiramisu', category:'🍰 Desserts', price:7.99, desc:'Classic Italian coffee-flavored dessert.', emoji:'🍰', modifiers:[] },
  { id:'p19', name:'Cappuccino', category:'☕ Coffee', price:4.99, desc:'Rich espresso, steamed milk foam.', emoji:'☕', modifiers:[{name:'Extra Shot',price:1},{name:'Oat Milk',price:0.5}] },
  { id:'p20', name:'Iced Latte', category:'☕ Coffee', price:5.49, desc:'Double espresso over ice with milk.', emoji:'🧋', modifiers:[{name:'Vanilla Syrup',price:0.5},{name:'Caramel',price:0.5}] },
];

// ═══════════════════════════════════════
// WELCOME SCREEN
// ═══════════════════════════════════════
function WelcomeScreen({ onStart }) {
  useEffect(() => {
    gsap.fromTo('.welcome-logo', { scale:0 }, { scale:1, duration:0.8, ease:'back.out(1.7)' });
    gsap.fromTo('.welcome-title', { opacity:0, y:30 }, { opacity:1, y:0, duration:0.7, delay:0.3 });
    gsap.fromTo('.welcome-sub', { opacity:0 }, { opacity:1, duration:0.6, delay:0.6 });
    gsap.fromTo('.welcome-tap', { opacity:0 }, { opacity:1, duration:0.5, delay:0.9 });
  }, []);

  return (
    <div className="welcome-screen" onClick={onStart}>
      <div className="welcome-logo">🍽️</div>
      <h1 className="welcome-title">Welcome to <span>Galaxy Bites</span></h1>
      <p className="welcome-sub">Self-service ordering kiosk. Browse our menu, customize your order, and pay — all at your fingertips.</p>
      <div className="welcome-tap">👆 Tap anywhere to start ordering</div>
    </div>
  );
}

// ═══════════════════════════════════════
// ORDER TYPE SCREEN
// ═══════════════════════════════════════
function OrderTypeScreen({ onSelect }) {
  useEffect(() => {
    gsap.fromTo('.type-card', { opacity:0, y:40, scale:0.9 }, { opacity:1, y:0, scale:1, duration:0.5, stagger:0.12, ease:'back.out(1.5)' });
  }, []);

  return (
    <div className="type-screen">
      <h2 className="type-title">How would you like to order?</h2>
      <div className="type-grid">
        <div className="type-card" onClick={() => onSelect('DINE_IN')}>
          <div className="type-icon">🍽️</div>
          <div className="type-label">Dine In</div>
          <div className="type-desc">Eat here at the restaurant</div>
        </div>
        <div className="type-card" onClick={() => onSelect('TAKEAWAY')}>
          <div className="type-icon">🥡</div>
          <div className="type-label">Takeaway</div>
          <div className="type-desc">Packed to go</div>
        </div>
        <div className="type-card" onClick={() => onSelect('DELIVERY')}>
          <div className="type-icon">🛵</div>
          <div className="type-label">Delivery</div>
          <div className="type-desc">Delivered to your door</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PRODUCT DETAIL MODAL
// ═══════════════════════════════════════
function ProductDetailModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [selectedMods, setSelectedMods] = useState([]);
  const [notes, setNotes] = useState('');

  const toggleMod = (mod) => {
    setSelectedMods(prev => prev.find(m => m.name === mod.name) ? prev.filter(m => m.name !== mod.name) : [...prev, mod]);
  };

  const modsTotal = selectedMods.reduce((s, m) => s + m.price, 0);
  const itemTotal = (product.price + modsTotal) * qty;

  const handleAdd = () => {
    onAdd({ ...product, qty, selectedMods, notes, unitTotal: product.price + modsTotal });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="detail-img">
          {product.emoji || '🍽️'}
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>
        <div className="detail-body">
          <div className="detail-name">{product.name}</div>
          <div className="detail-desc">{product.desc}</div>
          <div className="detail-price">${product.price.toFixed(2)}</div>

          {product.modifiers?.length > 0 && (
            <div className="modifier-section">
              <div className="modifier-title">Customize Your Order</div>
              <div className="modifier-options">
                {product.modifiers.map(mod => (
                  <div key={mod.name} className={`modifier-chip ${selectedMods.find(m=>m.name===mod.name)?'selected':''}`} onClick={() => toggleMod(mod)}>
                    {mod.name} {mod.price > 0 && `+$${mod.price.toFixed(2)}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detail-notes">
            <div className="modifier-title" style={{marginBottom:8}}>Special Instructions</div>
            <textarea placeholder="Any allergies or special requests..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="detail-footer">
            <div className="detail-qty">
              <button onClick={() => qty > 1 && setQty(qty-1)}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty+1)}>+</button>
            </div>
            <button className="detail-add-btn" onClick={handleAdd}>
              Add to Order — ${itemTotal.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PAYMENT SCREEN
// ═══════════════════════════════════════
function PaymentScreen({ total, onPay, onBack }) {
  useEffect(() => {
    gsap.fromTo('.pay-method', { opacity:0, y:30, scale:0.9 }, { opacity:1, y:0, scale:1, duration:0.4, stagger:0.1, ease:'back.out(1.5)' });
  }, []);

  return (
    <div className="payment-screen">
      <button onClick={onBack} style={{ position:'absolute', top:30, left:30, background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:'1rem' }}>
        <ChevronLeft size={20}/> Back
      </button>
      <h2 className="payment-title">Select Payment Method</h2>
      <div className="payment-total">${total.toFixed(2)}</div>
      <div className="payment-methods">
        <div className="pay-method" onClick={() => onPay('CASH')}><div className="pay-icon">💵</div><div className="pay-label">Cash</div></div>
        <div className="pay-method" onClick={() => onPay('CARD')}><div className="pay-icon">💳</div><div className="pay-label">Card</div></div>
        <div className="pay-method" onClick={() => onPay('ONLINE_STRIPE')}><div className="pay-icon">📱</div><div className="pay-label">Apple / Google Pay</div></div>
        <div className="pay-method" onClick={() => onPay('WALLET')}><div className="pay-icon">👛</div><div className="pay-label">Wallet</div></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ORDER CONFIRMATION SCREEN
// ═══════════════════════════════════════
function ConfirmationScreen({ orderNum, onNewOrder }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    gsap.fromTo('.confirm-icon', { scale:0 }, { scale:1, duration:0.6, ease:'back.out(2)' });
    gsap.fromTo('.confirm-title', { opacity:0, y:20 }, { opacity:1, y:0, duration:0.5, delay:0.3 });
    gsap.fromTo('.confirm-order-num', { opacity:0, scale:0.8 }, { opacity:1, scale:1, duration:0.5, delay:0.5 });
    const t1 = setTimeout(() => setStep(1), 3000);
    const t2 = setTimeout(() => setStep(2), 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="confirm-screen">
      <div className="confirm-icon">✅</div>
      <h2 className="confirm-title">Order Placed Successfully!</h2>
      <div className="confirm-order-num">#{orderNum}</div>
      <p className="confirm-msg">Your order is being prepared. Please wait for your number to be called.</p>

      <div className="order-tracker">
        <div className="track-step"><div className="track-dot done"></div><div className="track-label">Received</div></div>
        <div className={`track-line ${step>=1?'done':''}`}></div>
        <div className="track-step"><div className={`track-dot ${step>=1?'done':step===0?'active':''}`}></div><div className="track-label">Preparing</div></div>
        <div className={`track-line ${step>=2?'done':''}`}></div>
        <div className="track-step"><div className={`track-dot ${step>=2?'done':step===1?'active':''}`}></div><div className="track-label">Ready</div></div>
      </div>

      <button className="new-order-btn" onClick={onNewOrder}>Start New Order</button>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN MENU + CART SCREEN
// ═══════════════════════════════════════
function MenuScreen({ orderType, cart, setCart, onCheckout, onBack }) {
  const [category, setCategory] = useState('🔥 Popular');
  const [search, setSearch] = useState('');
  const [detailProduct, setDetailProduct] = useState(null);
  const [products] = useState(DEMO_PRODUCTS);

  useEffect(() => {
    gsap.fromTo('.product-card', { opacity:0, y:20 }, { opacity:1, y:0, duration:0.35, stagger:0.04, ease:'power2.out' });
  }, [category, search]);

  const filtered = products.filter(p => {
    if (search) return p.name.toLowerCase().includes(search.toLowerCase());
    if (category === '🔥 Popular') return p.popular;
    return p.category === category;
  });

  const addToCart = (item) => {
    setCart(prev => {
      const key = item.id + (item.selectedMods?.map(m=>m.name).join(',') || '');
      const existing = prev.find(i => i.cartKey === key);
      if (existing) return prev.map(i => i.cartKey === key ? { ...i, qty: i.qty + item.qty } : i);
      return [...prev, { ...item, cartKey: key }];
    });
    gsap.fromTo('.cart-count', { scale:1.4 }, { scale:1, duration:0.3, ease:'back.out(2)' });
  };

  const quickAdd = (product) => {
    if (product.modifiers?.length > 0) {
      setDetailProduct(product);
    } else {
      addToCart({ ...product, qty:1, selectedMods:[], notes:'', unitTotal:product.price, cartKey: product.id });
    }
  };

  const updateQty = (cartKey, delta) => {
    setCart(prev => prev.map(i => {
      if (i.cartKey !== cartKey) return i;
      const n = i.qty + delta;
      return n > 0 ? { ...i, qty: n } : null;
    }).filter(Boolean));
  };

  const removeItem = (cartKey) => setCart(prev => prev.filter(i => i.cartKey !== cartKey));

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + i.unitTotal * i.qty, 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const typeLabels = { DINE_IN: '🍽️ Dine-In', TAKEAWAY: '🥡 Takeaway', DELIVERY: '🛵 Delivery' };

  return (
    <>
      <div className="kiosk-app">
        {/* LEFT: MENU */}
        <div className="menu-panel">
          <div className="menu-header">
            <div className="menu-header-left">
              <button onClick={onBack} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}><ChevronLeft size={22}/></button>
              <span className="menu-header-logo">🍽️</span>
              <span className="menu-header-title">Galaxy Bites</span>
              <span className="menu-header-badge">MENU</span>
            </div>
            <div className="search-box">
              <Search size={16} color="var(--text-muted)"/>
              <input placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <X size={14} color="var(--text-muted)" style={{cursor:'pointer'}} onClick={() => setSearch('')}/>}
            </div>
          </div>

          <div className="category-bar">
            {CATEGORIES.map(c => (
              <div key={c} className={`cat-chip ${category === c ? 'active' : ''}`} onClick={() => { setCategory(c); setSearch(''); }}>{c}</div>
            ))}
          </div>

          <div className="product-scroll">
            <div className="product-grid">
              {filtered.map(product => (
                <div key={product.id} className="product-card" onClick={() => quickAdd(product)}>
                  <div className="product-img">
                    {product.emoji || '🍽️'}
                    {product.popular && <span className="product-badge">Popular</span>}
                  </div>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-desc">{product.desc}</div>
                    <div className="product-bottom">
                      <div className="product-price">${product.price.toFixed(2)}</div>
                      <button className="add-btn" onClick={e => { e.stopPropagation(); quickAdd(product); }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:60, color:'var(--text-muted)' }}>No items found</div>}
            </div>
          </div>
        </div>

        {/* RIGHT: CART */}
        <div className="cart-panel">
          <div className="cart-header">
            <div className="cart-title">
              <ShoppingBag size={20}/> Your Order
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </div>
            {cart.length > 0 && <button className="cart-clear" onClick={() => setCart([])}>Clear All</button>}
          </div>

          <div className="cart-type-badge">
            <span className="cart-type-label">Order Type</span>
            <span className="cart-type-value">{typeLabels[orderType]}</span>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty"><div className="cart-empty-icon">🛒</div><div>Your cart is empty</div><div style={{fontSize:'0.8rem', marginTop:4}}>Tap items to add them</div></div>
            ) : cart.map(item => (
              <div key={item.cartKey} className="cart-item">
                <div className="cart-item-emoji">{item.emoji || '🍽️'}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">${(item.unitTotal * item.qty).toFixed(2)}</div>
                  {item.selectedMods?.length > 0 && <div className="cart-item-mods">{item.selectedMods.map(m=>m.name).join(', ')}</div>}
                </div>
                <div className="qty-controls">
                  <button className={`qty-btn ${item.qty === 1 ? 'remove' : ''}`} onClick={() => item.qty === 1 ? removeItem(item.cartKey) : updateQty(item.cartKey, -1)}>
                    {item.qty === 1 ? <Trash2 size={12}/> : '−'}
                  </button>
                  <span className="qty-val">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.cartKey, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="cart-summary">
              <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <button className="checkout-btn" onClick={onCheckout}>
                Proceed to Payment →
              </button>
            </div>
          )}
        </div>
      </div>

      {detailProduct && <ProductDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} onAdd={addToCart} />}
    </>
  );
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState('welcome'); // welcome, type, menu, payment, confirm
  const [orderType, setOrderType] = useState('DINE_IN');
  const [cart, setCart] = useState([]);
  const [orderNum, setOrderNum] = useState('');

  const subtotal = cart.reduce((s, i) => s + i.unitTotal * i.qty, 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const handleSelectType = (type) => { setOrderType(type); setScreen('menu'); };

  const handleCheckout = () => { if (cart.length > 0) setScreen('payment'); };

  const handlePay = async (method) => {
    const num = String(Math.floor(Math.random() * 9000 + 1000));
    
    // Try to submit to API
    try {
      const token = localStorage.getItem('erp_token');
      const h = { 'Content-Type': 'application/json' };
      if (token) h['Authorization'] = `Bearer ${token}`;

      await fetch(`${API}/api/pos/orders`, {
        method: 'POST', headers: h,
        body: JSON.stringify({
          outletId: 'KIOSK_1',
          type: orderType,
          items: cart.map(i => ({ productId: i.id, quantity: i.qty, unitPrice: i.unitTotal, notes: i.notes, modifiers: i.selectedMods })),
          payments: [{ method, amount: total, status: 'PAID' }],
          totalAmount: total, taxAmount: tax, discount: 0
        })
      });
    } catch {}

    setOrderNum(num);
    setCart([]);
    setScreen('confirm');
  };

  const resetOrder = () => { setCart([]); setOrderType('DINE_IN'); setScreen('welcome'); };

  switch (screen) {
    case 'welcome': return <WelcomeScreen onStart={() => setScreen('type')} />;
    case 'type': return <OrderTypeScreen onSelect={handleSelectType} />;
    case 'menu': return <MenuScreen orderType={orderType} cart={cart} setCart={setCart} onCheckout={handleCheckout} onBack={() => setScreen('type')} />;
    case 'payment': return <PaymentScreen total={total} onPay={handlePay} onBack={() => setScreen('menu')} />;
    case 'confirm': return <ConfirmationScreen orderNum={orderNum} onNewOrder={resetOrder} />;
    default: return <WelcomeScreen onStart={() => setScreen('type')} />;
  }
}
