import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, Clock, DollarSign, ArrowRight, CheckCircle2, 
  AlertCircle, Printer, Save, Lock, Unlock, Moon, Sun, Filter 
} from 'lucide-react';

export default function DailyClosingERP({ theme, showToast, API, vendor }) {
  const [subTab, setSubTab] = useState('shifts');
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [closings, setClosings] = useState([]);
  const [isClosingDay, setIsClosingDay] = useState(false);
  const [closingData, setClosingData] = useState({ cashInHand: 0, notes: '' });

  const h = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('erp_token')}`
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(`${API}/api/shifts`, { headers: h }),
        fetch(`${API}/api/daily-closing`, { headers: h })
      ]);
      if (sRes.ok) setShifts(await sRes.json());
      if (cRes.ok) setClosings(await cRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCloseDay = async () => {
    try {
      const res = await fetch(`${API}/api/daily-closing`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(closingData)
      });
      if (res.ok) {
        showToast('Day closed successfully!');
        setIsClosingDay(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Check active shifts before closing');
      }
    } catch (e) { showToast('API Error'); }
  };

  const cardStyle = { background: theme.card, borderRadius: 20, border: `1px solid ${theme.border}`, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' };
  
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: theme.text, fontSize: '1.8rem', fontWeight: 900 }}>Daily Closings & Shifts</h2>
          <span style={{ fontSize: '0.85rem', color: theme.muted }}>Financial Lifecycle & Cash Reconciliation</span>
        </div>
        <button 
          onClick={() => setIsClosingDay(true)} 
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 16, cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}
        >
          <Lock size={20} /> Force Day End
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 30, overflowX: 'auto', paddingBottom: 8 }}>
        {['shifts', 'closings', 'reconciliation'].map((t) => (
          <button 
            key={t}
            onClick={() => setSubTab(t)}
            style={{
              padding: '12px 24px', borderRadius: 14, border: `1px solid ${subTab === t ? '#39FF14' : theme.border}`, cursor: 'pointer', fontWeight: 800, transition: '0.3s',
              background: subTab === t ? 'rgba(57,255,20,0.1)' : 'transparent',
              color: subTab === t ? '#39FF14' : theme.muted,
              textTransform: 'capitalize'
            }}
          >{t}</button>
        ))}
      </div>

      {subTab === 'shifts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {shifts.map(s => (
            <div key={s.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: theme.muted, textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Current Shift</div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{s.user?.name || 'Staff Node'}</h3>
                </div>
                <div style={{ padding: '6px 12px', borderRadius: 10, background: s.status === 'OPEN' ? 'rgba(57,255,20,0.1)' : 'rgba(239,68,68,0.1)', color: s.status === 'OPEN' ? '#39FF14' : '#ef4444', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', animation: s.status === 'OPEN' ? 'pulse 2s infinite' : 'none' }} /> {s.status}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div><label style={{ fontSize: '0.75rem', color: theme.muted }}>Starting Cash</label><div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Rs {s.openingCash || 0}</div></div>
                <div><label style={{ fontSize: '0.75rem', color: theme.muted }}>Start Time</label><div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{new Date(s.startTime).toLocaleTimeString()}</div></div>
              </div>

              <div style={{ background: theme.bg, padding: 16, borderRadius: 12, border: `1px solid ${theme.border}`, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: theme.muted, fontSize: '0.85rem' }}>Cash Sales</span><span style={{ fontWeight: 800 }}>Rs {s.totalSales || 0}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: theme.muted, fontSize: '0.85rem' }}>Expected Closing</span><span style={{ fontWeight: 900, color: '#39FF14' }}>Rs {(s.openingCash || 0) + (s.totalSales || 0)}</span></div>
              </div>

              <button style={{ width: '100%', padding: '14px', borderRadius: 12, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                 <ClipboardCheck size={18} /> View Shift Detail
              </button>
            </div>
          ))}
          {shifts.length === 0 && <div style={{ padding: 60, textAlign: 'center', color: theme.muted, gridColumn: '1/-1' }}>No active shifts found in this location.</div>}
        </div>
      )}

      {subTab === 'closings' && (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ textAlign: 'left', color: theme.muted, fontSize: '0.8rem', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: 16 }}>DATE</th><th style={{ padding: 16 }}>TOTAL REVENUE</th><th style={{ padding: 16 }}>CASH IN HAND</th><th style={{ padding: 16 }}>VARIANCE</th><th style={{ padding: 16 }}>STATUS</th><th style={{ padding: 16 }}>ACTION</th></tr></thead>
                <tbody>
                {closings.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: 16, fontWeight: 700 }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: 16, fontWeight: 800 }}>Rs {c.totalRevenue.toLocaleString()}</td>
                    <td style={{ padding: 16 }}>Rs {c.cashInHand.toLocaleString()}</td>
                    <td style={{ padding: 16, color: c.variance < 0 ? '#ef4444' : (c.variance > 0 ? '#39FF14' : 'inherit'), fontWeight: 900 }}>{c.variance.toLocaleString()}</td>
                    <td style={{ padding: 16 }}><span style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.1)', fontSize: '0.75rem', fontWeight: 900 }}>{c.status}</span></td>
                    <td style={{ padding: 16 }}><button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.text }}><Printer size={16} /></button></td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
          {closings.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: theme.muted }}>No historical closings found.</div>}
        </div>
      )}

      {/* CLOSING MODAL */}
      {isClosingDay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: theme.card, padding: 32, borderRadius: 24, width: '100%', maxWidth: 500, border: `1px solid ${theme.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Lock size={40} color="#ef4444" />
                </div>
                <h2 style={{ margin: '0 0 12px 0' }}>Confirm Daily Closing</h2>
                <p style={{ color: theme.muted, fontSize: '0.9rem', marginBottom: 30 }}>Are you sure you want to close the business for today? All pending shifts must be settled before this action.</p>
                
                <div style={{ textAlign: 'left', marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: theme.muted, marginBottom: 8, fontWeight: 700 }}>PHYSICAL CASH IN HAND</label>
                    <div style={{ position: 'relative' }}>
                        <DollarSign size={20} color={theme.muted} style={{ position: 'absolute', top: 18, left: 16 }} />
                        <input 
                            type="number" 
                            value={closingData.cashInHand} 
                            onChange={e => setClosingData({ ...closingData, cashInHand: Number(e.target.value) })}
                            style={{ width: '100%', padding: '18px 16px 18px 48px', borderRadius: 16, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontSize: '1.4rem', fontWeight: 900, boxSizing: 'border-box' }} 
                            placeholder="0.00" 
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setIsClosingDay(false)} style={{ flex: 1, padding: 18, borderRadius: 16, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleCloseDay} style={{ flex: 1, padding: 18, borderRadius: 16, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        Finalize & Sync
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
