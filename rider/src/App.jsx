import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Bike, MapPin, Clock, DollarSign, LogOut, Navigation, Phone, MessageCircle, Send, X } from 'lucide-react';
import { NotificationAlerts, useSocketEvent } from './shared/useSocket.jsx';
import { useTranslation } from './shared/useTranslation.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ChatModal({ onClose, orderId, targetUserId }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const socket = useSocketEvent('new_message', (msg) => {
    if (msg.sessionId === sessionId) {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  });

  useEffect(() => {
    const initChat = async () => {
      try {
        const token = localStorage.getItem('erp_token');
        const res = await fetch(`${API}/api/chat/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ targetUserId, contextType: 'ORDER', orderId })
        });
        const session = await res.json();
        setSessionId(session.id);
        
        // Fetch history
        const histRes = await fetch(`${API}/api/chat/${session.id}/messages`, { headers: { Authorization: `Bearer ${token}` } });
        const hist = await histRes.json();
        setMessages(hist);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        
        // Join socket room
        if (socket) socket.emit('join_room', { chatId: session.id });
      } catch (err) { console.error('Chat error', err); }
    };
    initChat();
  }, [targetUserId, orderId, socket]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;
    try {
      const token = localStorage.getItem('erp_token');
      await fetch(`${API}/api/chat/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: input })
      });
      setInput('');
    } catch (err) { console.error(err); }
  };

  const user = JSON.parse(localStorage.getItem('erp_user') || '{}');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16, background: '#1e1e2d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{t('ui.chat.title', 'Customer Chat')}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
      </div>
      
      <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.senderId === user.id ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ 
              background: m.senderId === user.id ? 'var(--neon-blue)' : '#2a2a3c', 
              padding: '10px 14px', borderRadius: 16, 
              borderBottomRightRadius: m.senderId === user.id ? 0 : 16,
              borderBottomLeftRadius: m.senderId === user.id ? 16 : 0,
            }}>
              {m.content}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, textAlign: m.senderId === user.id ? 'right' : 'left' }}>
              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: 16, background: '#1e1e2d', display: 'flex', gap: 8 }}>
        <input 
          value={input} onChange={e => setInput(e.target.value)}
          placeholder={t('ui.chat.placeholder', 'Type a message...')}
          style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: 'none', background: '#2a2a3c', color: 'white', outline: 'none' }}
        />
        <button type="submit" style={{ background: 'var(--neon-blue)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

// ============ RIDER APP ============
function RiderApp({ user, onLogout }) {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const [chatUser, setChatUser] = useState(null); // { id: '...', name: '...' }
  
  // Real-time integration: hook up 'order_assigned' push
  useSocketEvent('notification', (data) => {
    if (data.type === 'NEW_ORDER_ASSIGNED') {
      // In a real app, refetch deliveries here. For demo, we alert.
      console.log('New delivery assigned via Socket!');
    }
  });

  const [deliveries, setDeliveries] = useState([
    { id: 'DEL-001', customerId: 'cust-123', customer: 'Ahmed Khan', phone: '+923001234567', address: '123 Main St, Block 5', distance: '2.3 km', total: 35.50, status: 'PICKUP', time: '12 min ago' },
    { id: 'DEL-002', customerId: 'cust-456', customer: 'Sara Ali', phone: '+923009876543', address: '456 Park Ave, DHA Phase 6', distance: '4.1 km', total: 22.00, status: 'EN_ROUTE', time: '25 min ago' },
  ]);

  useEffect(() => {
    gsap.fromTo('.delivery-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power3.out' });
  }, []);

  const updateStatus = (id, newStatus) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const todayEarnings = deliveries.filter(d => d.status === 'DELIVERED').reduce((s, d) => s + d.total * 0.15, 0);

  return (
    <div className="rider-app">
      <NotificationAlerts />
      {chatUser && <ChatModal targetUserId={chatUser.id} orderId={chatUser.orderId} onClose={() => setChatUser(null)} />}
      
      <header className="rider-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bike size={24} color="var(--neon-blue)" />
          <div>
            <div style={{ fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('ui.role.rider', 'Rider')}</div>
          </div>
        </div>
        <div className="status-toggle">
          <button
            className={`toggle-btn ${isOnline ? 'toggle-online' : 'toggle-offline'}`}
            onClick={() => setIsOnline(!isOnline)}
          >
            {isOnline ? '● Online' : '○ Offline'}
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><LogOut size={20}/></button>
        </div>
      </header>

      <div className="rider-content">
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-label">{t('ui.stats.today_del', "Today's Deliveries")}</div>
            <div className="stat-value">{deliveries.filter(d => d.status === 'DELIVERED').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('ui.stats.earnings', 'Earnings')}</div>
            <div className="stat-value" style={{ color: 'var(--neon-green)' }}>${todayEarnings.toFixed(2)}</div>
          </div>
        </div>

        <h3 style={{ color: 'var(--neon-blue)', marginTop: 8 }}>{t('ui.labels.active_del', 'Active Deliveries')}</h3>
        {deliveries.filter(d => d.status !== 'DELIVERED').map(d => (
          <div key={d.id} className="delivery-card">
            <div className="delivery-header">
              <span style={{ fontWeight: 700 }}>{d.id}</span>
              <span className={`delivery-status ${d.status === 'PICKUP' ? 'status-pickup' : 'status-enroute'}`}>
                {d.status === 'PICKUP' ? 'Pickup' : 'En Route'}
              </span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.customer}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14}/> {d.address}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
              <span><Navigation size={14} style={{ verticalAlign: '-2px' }}/> {d.distance}</span>
              <span><DollarSign size={14} style={{ verticalAlign: '-2px' }}/> ${d.total.toFixed(2)}</span>
            </div>

            {/* Comms Buttons */}
            {d.status !== 'DELIVERED' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <a href={`tel:${d.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button className="action-btn" style={{ width: '100%', background: '#2a2a3c', color: 'white' }}>
                    <Phone size={14} style={{ verticalAlign: '-2px' }}/> Call
                  </button>
                </a>
                <button 
                  className="action-btn" 
                  style={{ flex: 1, background: '#2a2a3c', color: 'white' }}
                  onClick={() => setChatUser({ id: d.customerId, orderId: d.id })}
                >
                  <MessageCircle size={14} style={{ verticalAlign: '-2px' }}/> Chat
                </button>
              </div>
            )}

            {d.status === 'PICKUP' && (
              <button className="action-btn btn-picked" onClick={() => updateStatus(d.id, 'EN_ROUTE')}>
                📦 Picked Up — Start Delivery
              </button>
            )}
            {d.status === 'EN_ROUTE' && (
              <button className="action-btn btn-delivered" onClick={() => updateStatus(d.id, 'DELIVERED')}>
                ✅ Mark as Delivered
              </button>
            )}
          </div>
        ))}

        {deliveries.filter(d => d.status !== 'DELIVERED').length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
            {isOnline ? '⏳ Waiting for new deliveries...' : '🔴 You are offline'}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ LOGIN ============
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { gsap.fromTo('.login-container', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      if (!['RIDER', 'SUPER_ADMIN'].includes(data.user.role)) { setError('Rider role required.'); setLoading(false); return; }
      localStorage.setItem('erp_token', data.token); localStorage.setItem('erp_user', JSON.stringify(data.user));
      onLogin(data);
    } catch { setError('Network error'); setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand"><div className="login-brand-icon">🏍️</div><h1>Rider App</h1><p>Delivery partner login</p></div>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group"><label>Email</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="form-group"><label>Password</label><input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Go Online'}</button>
        </form>
      </div>
    </div>
  );
}

// ============ MAIN ============
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const saved = localStorage.getItem('erp_user');
    if (token && saved) { try { const p = JSON.parse(atob(token.split('.')[1])); if (p.exp * 1000 > Date.now()) { setUser(JSON.parse(saved)); setAuthed(true); } } catch {} }
  }, []);

  const logout = () => { localStorage.removeItem('erp_token'); localStorage.removeItem('erp_user'); setAuthed(false); setUser(null); };
  if (!authed) return <LoginScreen onLogin={d => { setUser(d.user); setAuthed(true); }} />;
  return <RiderApp user={user} onLogout={logout} />;
}
