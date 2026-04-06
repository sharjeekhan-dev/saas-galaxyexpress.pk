import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, CheckCircle, XCircle, Phone, MessageSquare, 
  Wallet, History, User, Settings, Bell, ChevronRight, Bike, Loader2
} from 'lucide-react';

export default function App() {
  const [rider, setRider] = useState(() => {
    const r = localStorage.getItem('rider_auth');
    return r ? JSON.parse(r) : null;
  }); // { name: 'Ali', id: 'R1' }
  const [activeTab, setActiveTab] = useState('home'); // home | earnings | profile
  const [status, setStatus] = useState('offline'); // offline | online | busy
  
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Poll for Orders
  const fetchOrders = async () => {
    if (!rider || status !== 'online' || activeOrder) return;
    try {
      const res = await fetch(`https://api.galaxyexpress.pk/orders?status=READY`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders.map(o => ({
            id: o.id,
            restaurant: o.tenantId || 'Galaxy Express',
            pickup: 'Main Branch',
            dropoff: o.customerInfo?.address || 'Customer Addr',
            payout: 250, distance: '3.1 km', status: 'ready',
            customerPhone: o.customerInfo?.phone || '0300'
          })));
        }
      }
    } catch(e) {
      if (orders.length === 0) {
        setOrders([
          { id: 'ORD-991', restaurant: 'Pizza Palace', pickup: 'Gulshan Branch', dropoff: 'Block 4, Clifton', payout: 250, distance: '4.2 km', status: 'pending' },
          { id: 'ORD-992', restaurant: 'Burger Galaxy', pickup: 'DHA Phase 6', dropoff: 'Zamzama Comm.', payout: 180, distance: '2.1 km', status: 'pending' }
        ]);
      }
    }
  };

  useEffect(() => {
    if (rider) localStorage.setItem('rider_auth', JSON.stringify(rider));
    let alive = true;
    if (alive) fetchOrders();
    const interval = setInterval(() => { if (alive) fetchOrders(); }, 5000);
    return () => { alive = false; clearInterval(interval); };
  }, [rider, status, activeOrder]);

  if (!rider) {
    return (
      <div style={{minHeight:'100vh', background:'#0f172a', color:'white', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:30}}>
        <Bike size={80} color="#8de02c" style={{marginBottom:30}} />
        <h1 style={{marginBottom:10}}>Rider App</h1>
        <p style={{opacity:0.6, marginBottom:40}}>Sign in to start delivering</p>
        <input className="form-input mb-16" style={{width:'100%', padding:15, borderRadius:10, border:'none', background:'rgba(255,255,255,0.1)', color:'white'}} placeholder="Phone (+92 300...)" defaultValue="+923001234567" />
        <input className="form-input mb-20" type="password" style={{width:'100%', padding:15, borderRadius:10, border:'none', background:'rgba(255,255,255,0.1)', color:'white'}} placeholder="Pin Code" defaultValue="1234" />
        <button onClick={()=>setRider({name:'Tariq Mahmood', wallet: 4500})} style={{width:'100%', padding:18, borderRadius:10, background:'#8de02c', color:'#000', fontWeight:800, border:'none', fontSize:'1.1rem'}}>Login as Rider</button>
      </div>
    );
  }

  const updateOrderStatusBackend = async (orderId, newStatus) => {
    setIsProcessing(true);
    try {
      await fetch(`https://api.galaxyexpress.pk/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, riderId: rider.id })
      });
    } catch(e) {
      console.log('Backend unreachable locally, continuing flow optimistically.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = async (o) => {
    setActiveOrder({...o, deliveryStatus: 'heading_to_restaurant'});
    setOrders(prev => prev.filter(x => x.id !== o.id));
    setStatus('busy');
    showToast('Order Accepted!');
    await updateOrderStatusBackend(o.id.replace('ORD-',''), 'OUT_FOR_DELIVERY');
  };

  const completeDelivery = async () => {
    const oId = activeOrder.id;
    setRider(prev => ({...prev, wallet: prev.wallet + activeOrder.payout}));
    setActiveOrder(null);
    setStatus('online');
    showToast('Delivery Completed! Earnings added to wallet.');
    await updateOrderStatusBackend(oId.replace('ORD-',''), 'DELIVERED');
  };

  return (
    <div style={{minHeight:'100vh', background:'#0f172a', color:'white', display:'flex', flexDirection:'column'}}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: 30, right: 20, left: 20, background: '#8de02c', color: '#000', padding: '16px 20px', borderRadius: 12, fontWeight: 800, zIndex: 9999, transition:'0.3s', textAlign:'center', boxShadow:'0 10px 30px rgba(141, 224, 44, 0.3)' }}>
          {toastMessage}
        </div>
      )}

      {/* HEADER */}
      <div style={{padding:'20px', background:'#1e293b', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:'#8de02c',color:'#000',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900}}>{rider.name.charAt(0)}</div>
          <div>
            <div style={{fontWeight:800, fontSize:'1.1rem'}}>{rider.name}</div>
            <div style={{fontSize:'0.8rem', color: status==='offline'?'#94a3b8':status==='online'?'#22c55e':'#f97316'}} className="uppercase font-bold">
               ● {status}
            </div>
          </div>
        </div>
        <div style={{position:'relative', cursor:'pointer'}} onClick={() => setRider(null)}>
          <Bell size={24} color="#fff" />
          <div style={{position:'absolute',top:0,right:0,width:10,height:10,background:'red',borderRadius:'50%'}}></div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{flex:1, overflowY:'auto', paddingBottom:80}}>
        {activeTab === 'home' && (
          <div style={{padding:20}}>
            
            {/* STATUS TOGGLE */}
            {!activeOrder && (
              <div style={{background:'#1e293b', borderRadius:16, padding:20, marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:'1.2rem', fontWeight:800, marginBottom:4}}>You are {status}</div>
                  <div style={{fontSize:'0.85rem', opacity:0.6}}>Turn online to get orders</div>
                </div>
                <div 
                  onClick={()=>setStatus(s=>s==='offline'?'online':'offline')}
                  style={{width:60, height:34, borderRadius:20, background:status==='online'?'#8de02c':'rgba(255,255,255,0.1)', position:'relative', cursor:'pointer', transition:'0.3s'}}>
                  <div style={{width:26, height:26, borderRadius:'50%', background:'#fff', position:'absolute', top:4, left:status==='online'?30:4, transition:'0.3s'}}></div>
                </div>
              </div>
            )}

            {/* ACTIVE ORDER (ONGOING) */}
            {activeOrder && (
              <div style={{background:'#1e293b', borderRadius:16, border:'1px solid #8de02c', overflow:'hidden'}}>
                <div style={{background:'rgba(141,224,44,0.1)', padding:'12px 20px', color:'#8de02c', fontWeight:800, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:10}}>
                   <Navigation size={16}/> ACTIVE DELIVERY
                </div>
                
                {/* Simulated Map */}
                <div style={{height:200, background:'#334155', position:'relative', display:'flex', alignItems:'center', justifyContent:'center'}}>
                   <MapPin size={40} color="#8de02c" style={{position:'absolute', zIndex:10}} />
                   <div style={{position:'absolute',inset:0,opacity:0.2,backgroundImage:'radial-gradient(#8de02c 1px, transparent 1px)',backgroundSize:'20px 20px'}}></div>
                   <div style={{background:'rgba(0,0,0,0.6)', padding:'8px 15px', borderRadius:20, position:'absolute', bottom:10, fontSize:'0.8rem', fontWeight:800}}>ETA: 12 Mins</div>
                </div>

                <div style={{padding:20}}>
                   <div style={{fontSize:'1.5rem', fontWeight:800, marginBottom:20}}>Rs {activeOrder.payout} <span style={{fontSize:'0.85rem', color:'#94a3b8', fontWeight:400}}>Cash on Delivery</span></div>
                   
                   <div style={{display:'flex', gap:10, marginBottom:20}}>
                     <a href="tel:0300" style={{flex:1, display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:14,background:'rgba(255,255,255,0.05)',borderRadius:12,color:'white',textDecoration:'none',fontWeight:700}}><Phone size={18}/> Call</a>
                     <div style={{flex:1, display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:14,background:'rgba(255,255,255,0.05)',borderRadius:12,fontWeight:700}}><MessageSquare size={18}/> Chat</div>
                   </div>

                   {/* Steps */}
                   {['heading_to_restaurant', 'picked_up', 'arrived'].includes(activeOrder.deliveryStatus) && (
                     <button 
                       disabled={isProcessing}
                       style={{width:'100%', padding:18, borderRadius:12, background:'#8de02c', color:'#000', fontWeight:800, border:'none', fontSize:'1.1rem', opacity: isProcessing ? 0.7 : 1, display:'flex', justifyContent:'center', gap:10, alignItems:'center'}}
                       onClick={() => {
                         if(activeOrder.deliveryStatus === 'heading_to_restaurant') setActiveOrder({...activeOrder, deliveryStatus:'picked_up'});
                         else if(activeOrder.deliveryStatus === 'picked_up') setActiveOrder({...activeOrder, deliveryStatus:'arrived'});
                         else completeDelivery();
                       }}>
                       {isProcessing && <Loader2 size={20} style={{animation:'spin 1s linear infinite'}} />}
                       {activeOrder.deliveryStatus === 'heading_to_restaurant' ? 'Confirm Pickup' : 
                        activeOrder.deliveryStatus === 'picked_up' ? 'Mark as Arrived' : 'Complete Delivery'}
                     </button>
                   )}
                </div>
              </div>
            )}

            {/* NEW ORDER REQUESTS */}
            {status === 'online' && !activeOrder && orders.map(o => (
              <div key={o.id} style={{background:'#1e293b', borderRadius:16, padding:20, marginBottom:16, border:'1px solid rgba(255,255,255,0.05)', boxShadow:'0 10px 30px rgba(0,0,0,0.3)'}}>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20}}>
                   <div>
                     <div style={{fontSize:'0.8rem', color:'#94a3b8', marginBottom:4, fontWeight:700}}>NEW REQUEST</div>
                     <div style={{fontSize:'1.8rem', fontWeight:900, color:'#8de02c'}}>Rs {o.payout}</div>
                   </div>
                   <div style={{background:'rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:20, fontSize:'0.8rem', fontWeight:800}}>{o.distance}</div>
                 </div>

                 <div style={{display:'flex', flexDirection:'column', gap:16, marginBottom:20}}>
                   <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
                     <div style={{width:10,height:10,borderRadius:'50%',background:'#3b82f6',marginTop:4}}></div>
                     <div><div style={{fontSize:'0.8rem',color:'#94a3b8'}}>Pickup</div><div style={{fontWeight:700}}>{o.pickup}</div></div>
                   </div>
                   <div style={{display:'flex', gap:12, alignItems:'flex-start'}}>
                     <div style={{width:10,height:10,borderRadius:'50%',background:'#ef4444',marginTop:4}}></div>
                     <div><div style={{fontSize:'0.8rem',color:'#94a3b8'}}>Dropoff</div><div style={{fontWeight:700}}>{o.dropoff}</div></div>
                   </div>
                 </div>

                 <div style={{display:'flex', gap:10}}>
                   <button disabled={isProcessing} style={{flex:1, padding:16, borderRadius:12, background:'rgba(239,68,68,0.1)', color:'#ef4444', fontWeight:800, border:'none'}} onClick={()=>setOrders(p=>p.filter(x=>x.id!==o.id))}>Reject</button>
                   <button disabled={isProcessing} style={{flex:2, padding:16, borderRadius:12, background:'#8de02c', color:'#000', fontWeight:800, border:'none', display:'flex', justifyContent:'center', alignItems:'center'}} onClick={()=>handleAccept(o)}>
                     Accept Order
                   </button>
                 </div>
              </div>
            ))}

            {status === 'online' && !activeOrder && orders.length === 0 && (
              <div style={{padding:40, textAlign:'center', opacity:0.5}}>
                <Navigation size={40} style={{margin:'0 auto 20px'}}/>
                <div>Searching for nearby orders...</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div style={{padding:20}}>
             <h2 style={{marginBottom:20}}>Wallet & Earnings</h2>
             <div style={{background:'linear-gradient(135deg, #1e293b, #0f172a)', padding:30, borderRadius:20, border:'1px solid rgba(255,255,255,0.05)', textAlign:'center', marginBottom:20}}>
                <div style={{fontSize:'0.9rem', color:'#94a3b8', marginBottom:10}}>Available Balance</div>
                <div style={{fontSize:'3rem', fontWeight:900, color:'#8de02c'}}>Rs {rider.wallet}</div>
                <button style={{width:'100%', padding:14, borderRadius:10, background:'rgba(255,255,255,0.1)', color:'white', fontWeight:700, border:'none', marginTop:20}}>Withdraw to EasyPaisa</button>
             </div>
             
             <h3 style={{marginBottom:15}}>Today's History</h3>
             <div style={{background:'#1e293b', borderRadius:16, padding:'10px 20px'}}>
               {[1,2,3].map(i=>(
                 <div key={i} style={{padding:'15px 0', borderBottom:i<3?'1px solid rgba(255,255,255,0.05)':'none', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div>
                     <div style={{fontWeight:800}}>ORD-49{i}2</div>
                     <div style={{fontSize:'0.8rem', color:'#94a3b8'}}>Completed at 14:3{i}</div>
                   </div>
                   <div style={{fontWeight:800, color:'#8de02c'}}>+ Rs 250</div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#1e293b', padding:'12px 20px 20px', display:'flex', justifyContent:'space-around', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:activeTab==='home'?'#8de02c':'#94a3b8'}} onClick={()=>setActiveTab('home')}>
          <Bike size={24}/> <span style={{fontSize:'0.75rem', fontWeight:700}}>Deliveries</span>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:activeTab==='earnings'?'#8de02c':'#94a3b8'}} onClick={()=>setActiveTab('earnings')}>
          <Wallet size={24}/> <span style={{fontSize:'0.75rem', fontWeight:700}}>Earnings</span>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:activeTab==='profile'?'#8de02c':'#94a3b8'}} onClick={()=>setActiveTab('profile')}>
          <User size={24}/> <span style={{fontSize:'0.75rem', fontWeight:700}}>Profile</span>
        </div>
      </div>
    </div>
  );
}
