import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let globalSocket = null;

export function useSocketEvent(eventName, callback) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');

    if (!globalSocket && user.id) {
      globalSocket = io(API, {
        auth: { token }
      });
      globalSocket.on('connect', () => {
        globalSocket.emit('join_room', {
          tenantId: user.tenantId,
          userId: user.id
        });
      });
    }

    setSocket(globalSocket);

    if (globalSocket && eventName && callback) {
      globalSocket.on(eventName, callback);
      return () => {
        globalSocket.off(eventName, callback);
      };
    }
  }, [eventName, callback]);

  return socket;
}

// Global Notification Alert Component
export function NotificationAlerts() {
  const [notifications, setNotifications] = useState([]);

  useSocketEvent('notification', (data) => {
    setNotifications(prev => [...prev, data]);
    // Auto-dismiss after 5s
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== data.id));
    }, 5000);
  });

  if (notifications.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {notifications.map(n => (
        <div key={n.id} style={{
          background: 'rgba(20,20,30,0.95)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16, color: 'white', minWidth: 280,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderLeft: '4px solid var(--accent)',
          animation: 'slideIn 0.3s ease-out forwards'
        }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '1rem' }}>{n.title}</h4>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{n.body}</p>
        </div>
      ))}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
