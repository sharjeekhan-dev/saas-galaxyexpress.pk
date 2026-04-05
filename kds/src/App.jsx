import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import gsap from 'gsap';
import { ChefHat, CheckCircle, Clock } from 'lucide-react';

const mockOrdersInit = [
  {
    id: 'ORD-001',
    type: 'DINE_IN',
    createdAt: Date.now() - 600000, // 10 mins ago
    items: [
      { id: 'i1', name: 'Neon Burger', qty: 2, done: false },
      { id: 'i2', name: 'Cyber Fries', qty: 2, done: false }
    ]
  },
  {
    id: 'ORD-002',
    type: 'TAKEAWAY',
    createdAt: Date.now() - 300000, // 5 mins ago
    items: [
      { id: 'i3', name: 'Plasma Pizza', qty: 1, done: false },
      { id: 'i4', name: 'Holo Salad', qty: 1, done: false }
    ]
  }
];

function App() {
  const [orders, setOrders] = useState(mockOrdersInit);
  const [now, setNow] = useState(Date.now());
  const gridRef = useRef();

  useEffect(() => {
    // Timer interval for real-time order aging
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // Initial entrance animation
    gsap.fromTo(".order-card",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );

    // Socket Setup
    const socket = io('http://localhost:5000');
    socket.on('connect', () => {
      console.log('KDS Connected to WebSocket');
      socket.emit('join_room', { tenantId: 'DEMO', outletId: 'OUTLET_1' });
    });

    socket.on('order_created', (newOrder) => {
      // Map API payload to KDS structure
      const formatted = {
        id: newOrder.id.slice(-6).toUpperCase(),
        type: newOrder.type,
        createdAt: newOrder.createdAt ? new Date(newOrder.createdAt).getTime() : Date.now(),
        items: newOrder.items.map(item => ({
          id: item.id,
          name: item.productId, // Should be name, but we mock it here since productId is passed
          qty: item.quantity,
          done: false
        }))
      };
      
      setOrders(prev => [...prev, formatted]);
      
      // Flash animation for newly arrived order
      setTimeout(() => {
        const cards = document.querySelectorAll('.order-card');
        const lastCard = cards[cards.length - 1];
        if (lastCard) {
          gsap.fromTo(lastCard, 
            { backgroundColor: 'rgba(59, 130, 246, 0.4)' }, 
            { backgroundColor: 'rgba(255, 255, 255, 0.04)', duration: 1.5 }
          );
        }
      }, 100);
    });

    return () => {
      clearInterval(interval);
      socket.close();
    };
  }, []);

  const toggleItem = (orderId, itemId) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        items: order.items.map(item => 
          item.id === itemId ? { ...item, done: !item.done } : item
        )
      };
    }));
  };

  const markOrderReady = (orderId) => {
    // Animate out
    const cardElements = document.querySelectorAll('.order-card');
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index !== -1 && cardElements[index]) {
      gsap.to(cardElements[index], {
        scale: 0.8,
        opacity: 0,
        y: -50,
        duration: 0.5,
        onComplete: () => {
          setOrders(prev => prev.filter(o => o.id !== orderId));
        }
      });
    } else {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const getStatusClass = (elapsedMinutes) => {
    if (elapsedMinutes >= 15) return 'status-late';
    if (elapsedMinutes >= 10) return 'status-warn';
    return 'status-good';
  };

  const getTimerClass = (elapsedMinutes) => {
    if (elapsedMinutes >= 15) return 'late';
    if (elapsedMinutes >= 10) return 'warn';
    return 'good';
  };

  return (
    <>
      <header className="kds-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ChefHat size={32} color="var(--neon-blue)" />
          <h2>Kitchen Display System</h2>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          Active Orders: <strong style={{ color: 'white' }}>{orders.length}</strong>
        </div>
      </header>

      <div className="kds-grid" ref={gridRef}>
        {orders.map(order => {
          const elapsed = Math.floor((now - order.createdAt) / 60000);
          const elapsedSecs = Math.floor(((now - order.createdAt) % 60000) / 1000);
          const cardStatus = getStatusClass(elapsed);
          const timerStatus = getTimerClass(elapsed);
          const allDone = order.items.every(i => i.done);

          return (
            <div key={order.id} className={`order-card ${cardStatus}`}>
              <div className="order-header">
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>#{order.id}</div>
                  <div className="order-type">{order.type}</div>
                </div>
                <div className={`order-timer ${timerStatus}`}>
                  <Clock size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                  {elapsed.toString().padStart(2, '0')}:{elapsedSecs.toString().padStart(2, '0')}
                </div>
              </div>

              <div className="order-items">
                {order.items.map(item => (
                  <div 
                    key={item.id} 
                    className={`order-item ${item.done ? 'done' : ''}`}
                    onClick={() => toggleItem(order.id, item.id)}
                  >
                    <span>{item.qty}x {item.name}</span>
                    {item.done && <CheckCircle size={20} color="var(--timer-green)" />}
                  </div>
                ))}
              </div>

              <div className="order-actions">
                <button 
                  className="btn-ready" 
                  onClick={() => markOrderReady(order.id)}
                  style={{ opacity: allDone ? 1 : 0.5 }}
                >
                  Mark as Ready
                </button>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '10vh', color: 'var(--text-muted)', fontSize: '1.5rem' }}>
            No Active Orders. Kitchen is clear!
          </div>
        )}
      </div>
    </>
  );
}

export default App;
