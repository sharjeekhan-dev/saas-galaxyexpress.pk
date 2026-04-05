import React, { useState, useEffect, useCallback } from 'react';
import { API, headers } from '../App.jsx';
import { ChefHat, RefreshCw, Clock, Truck, MapPin, CheckCircle } from 'lucide-react';

export default function KdsScreen({ orders, onRefresh }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  // Auto-refresh every 15s
  useEffect(() => {
    const t = setInterval(() => onRefresh(), 15000);
    return () => clearInterval(t);
  }, [onRefresh]);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/api/pos/orders/${id}/status`, { method:'PUT', headers:headers(), body:JSON.stringify({status}) });
      onRefresh();
    } catch {}
  };

  const getElapsed = (createdAt) => {
    const min = Math.floor((now - new Date(createdAt).getTime()) / 60000);
    if (min < 1) return 'just now';
    return `${min} min ago`;
  };

  const isLate = (createdAt, minutes) => (now - new Date(createdAt).getTime()) / 60000 > minutes;

  const columns = [
    { title:'New Orders', status:'PENDING',   color:'info',    urgency:5,  nextStatus:'PREPARING', nextLabel:'Start' },
    { title:'In Kitchen', status:'PREPARING', color:'warning', urgency:12, nextStatus:'READY',     nextLabel:'Mark Ready' },
    { title:'Ready',      status:'READY',     color:'success', urgency:20, nextStatus:'DELIVERED', nextLabel:'Complete' },
  ];

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><ChefHat size={20}/>Kitchen Display System</div>
        <button className="btn btn-sm btn-outline" onClick={onRefresh}><RefreshCw size={13}/>Refresh</button>
      </div>

      <div className="kds-board">
        {columns.map(col => {
          const colOrders = orders
            .filter(o => o.status === col.status)
            .sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));

          return (
            <div key={col.status} className={`kds-col kds-col-${col.color}`}>
              <div className="kds-col-header">
                <h3>
                  {col.title}
                  <span className={`badge badge-${col.color}`}>{colOrders.length}</span>
                </h3>
              </div>
              <div className="kds-col-body">
                {colOrders.map(o => {
                  const late = isLate(o.createdAt, col.urgency);
                  return (
                    <div key={o.id} className="kds-card">
                      <div className="kds-card-top">
                        <span className="order-no">#{o.orderNumber||o.id.slice(-5)}</span>
                        <span className={`time-elapsed ${late?'text-danger':''}`}>
                          <Clock size={11} style={{marginRight:3}}/>
                          {getElapsed(o.createdAt)}
                        </span>
                      </div>

                      <div className="kds-card-type">
                        <span className="badge badge-default">{o.type}</span>
                        {o.type==='DELIVERY' ? <Truck size={11}/> : <MapPin size={11}/>}
                        {o.table && <span className="text-xs text-muted">Table {o.table.name}</span>}
                      </div>

                      <div className="kds-items">
                        {(o.items||[]).map((it,i) => (
                          <div key={i} className="kds-item">
                            <span className="qty">{it.quantity}×</span>
                            <span>{it.product?.name||'Item'}</span>
                          </div>
                        ))}
                      </div>

                      {late && (
                        <div style={{
                          background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',
                          borderRadius:6,padding:'5px 8px',fontSize:'0.74rem',
                          color:'var(--neon-red)',fontWeight:700,marginBottom:10
                        }}>
                          ⚠ LATE — over {col.urgency} minutes
                        </div>
                      )}

                      <button
                        className={`btn btn-sm w-full ${col.color==='success'?'btn-outline':'btn-primary'}`}
                        style={{justifyContent:'center'}}
                        onClick={() => updateStatus(o.id, col.nextStatus)}
                      >
                        <CheckCircle size={13}/> {col.nextLabel}
                      </button>
                    </div>
                  );
                })}
                {colOrders.length === 0 && (
                  <div className="kds-empty">✓ No orders</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
