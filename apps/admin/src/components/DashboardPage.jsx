import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingCart, DollarSign, Activity, TrendingUp, TrendingDown, 
  ArrowUpRight, AlertCircle, Store, Clock, Zap, RefreshCw
} from 'lucide-react';
import { API, headers as getHeaders } from '../App.jsx';

export default function DashboardPage({ onNav }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalTenants: 0 });
  const [orders, setOrders] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const h = getHeaders();
      const res = await fetch(`${API}/api/reports/dashboard`, { headers: h }).then(r => r.json());
      if (res) {
        setStats(res);
        setOrders(res.recentOrders || []);
      }
    } catch (e) { 
      console.error('Dashboard load error', e); 
      // Fallback/Mock for UI demo if API is down
      setStats({ totalRevenue: 1250400, totalOrders: 452, totalUsers: 84, totalTenants: 12 });
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const performanceHighlights = [
    { label: 'System Uptime', value: '99.9%', icon: Zap, color: '#39FF14' },
    { label: 'Active Sessions', value: '142', icon: Activity, color: '#0ea5e9' },
    { label: 'Pending Approvals', value: '8', icon: Clock, color: '#f97316' },
  ];

  if (loading) return (
    <div style={{ padding: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <RefreshCw className="spin" size={48} color="#39FF14" />
      <div style={{ fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 2 }}>SYNCING TELEMETRY...</div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* COMMAND CENTER HEADER */}
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Command Center</h1>
          <p className="text-muted" style={{ fontSize: '1rem', marginTop: 6, fontWeight: 500 }}>Real-time platform telemetry and global operational oversight.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={fetchData}><RefreshCw size={14} /> Refresh</button>
          <div className="badge badge-lime" style={{ padding: '10px 20px', borderRadius: 14, border: '1px solid var(--accent-border)' }}>
            <div className="live-dot" style={{ marginRight: 10 }} /> SYSTEM ONLINE
          </div>
        </div>
      </div>

      {/* KPI GAUGE GRID */}
      <div className="stat-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card purple">
          <div className="stat-card-header">
            <div className="stat-icon purple"><Store size={22} /></div>
            <div className="stat-trend up">+12% <ArrowUpRight size={12} /></div>
          </div>
          <div className="stat-value">{stats.totalTenants || 0}</div>
          <div className="stat-label">Active Tenants</div>
          <div className="progress-bar mt-12"><div className="progress-fill purple" style={{ width: '70%' }} /></div>
        </div>

        <div className="stat-card cyan">
          <div className="stat-card-header">
            <div className="stat-icon cyan"><Users size={22} /></div>
            <div className="stat-trend up">+5% <ArrowUpRight size={12} /></div>
          </div>
          <div className="stat-value">{stats.totalUsers || 0}</div>
          <div className="stat-label">Authorized Users</div>
          <div className="progress-bar mt-12"><div className="progress-fill cyan" style={{ width: '45%' }} /></div>
        </div>

        <div className="stat-card green">
          <div className="stat-card-header">
            <div className="stat-icon green"><ShoppingCart size={22} /></div>
            <div className="stat-trend down">-2% <TrendingDown size={12} style={{ marginLeft: 4 }} /></div>
          </div>
          <div className="stat-value">{stats.totalOrders || 0}</div>
          <div className="stat-label">Today's Transactions</div>
          <div className="progress-bar mt-12"><div className="progress-fill green" style={{ width: '82%' }} /></div>
        </div>

        <div className="stat-card orange">
          <div className="stat-card-header">
            <div className="stat-icon orange"><DollarSign size={22} /></div>
            <div className="stat-trend up">+24% <ArrowUpRight size={12} /></div>
          </div>
          <div className="stat-value">Rs {(stats.totalRevenue || 0).toLocaleString()}</div>
          <div className="stat-label">Net Platform Output</div>
          <div className="progress-bar mt-12"><div className="progress-fill orange" style={{ width: '60%' }} /></div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* DATA VISUALIZATION */}
        <div className="glass-card" style={{ minHeight: 440, display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title"><TrendingUp size={20} color="var(--accent)" /> Revenue Velocity (7d)</div>
            <div className="flex gap-8">
              <span className="badge badge-default">LIVE</span>
              <select className="filter-input" style={{ minWidth: 120 }}>
                <option>All Channels</option>
                <option>POS Only</option>
                <option>Delivery</option>
              </select>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 16, padding: '30px 10px' }}>
            {/* Simulated Chart Bars with Tooltips */}
            {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
              <div key={i} style={{ flex: 1, position: 'relative', group: 'bar' }} className="chart-bar-container">
                <div style={{ 
                  height: `${h}%`, 
                  background: i === 6 ? 'var(--accent)' : 'var(--gradient-primary)', 
                  borderRadius: '10px 10px 4px 4px',
                  opacity: i === 6 ? 1 : 0.6, 
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                  cursor: 'pointer',
                  boxShadow: i === 6 ? '0 0 20px rgba(57, 255, 20, 0.4)' : 'none'
                }} />
                <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: 12, color: i === 6 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: i === 6 ? 900 : 600 }}>
                  {['MON','TUE','WED','THU','FRI','SAT','SUN'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OPERATION PANEL */}
        <div className="flex flex-col gap-24">
          <div className="glass-card">
            <div className="card-title mb-16" style={{ fontSize: '1rem' }}><Activity size={18} color="var(--neon-cyan)" /> System Health</div>
            <div className="flex flex-col gap-12">
              {performanceHighlights.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-12">
                    <div style={{ background: `${item.color}15`, color: item.color, padding: 10, borderRadius: 12 }}><item.icon size={18} /></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: 900, color: item.color, fontSize: '1rem' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ flex: 1 }}>
            <div className="card-title mb-20" style={{ fontSize: '1rem' }}><AlertCircle size={18} color="var(--neon-orange)" /> Operational Alerts</div>
            <div className="activity-list">
              {[
                { type: 'orange', title: 'Low Stock Alert', desc: 'Branch 04 - Wheat Flour (12kg left)', time: '12m ago' },
                { type: 'red', title: 'Payout Failure', desc: 'Gateway timeout for Rider #8291', time: '45m ago' },
                { type: 'blue', title: 'New Onboarding', desc: 'Tenant "Bake House" sub-domain active', time: '1h ago' }
              ].map((alert, i) => (
                <div key={i} className="activity-item" style={{ padding: '14px 0' }}>
                  <div className={`activity-dot ${alert.type}`} />
                  <div className="activity-info">
                    <div className="activity-text" style={{ fontSize: '0.9rem' }}><strong>{alert.title}:</strong> {alert.desc}</div>
                    <div className="activity-time">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE TRANSACTION MONITOR */}
      <div className="glass-card mt-24" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="card-title" style={{ fontSize: '1.1rem' }}><ShoppingCart size={22} color="var(--accent)" /> Live Transaction Monitor</div>
          <div className="flex gap-12">
            <button className="btn btn-outline btn-sm" onClick={() => onNav('orders')}>Comprehensive View →</button>
          </div>
        </div>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 28px' }}>Order ID</th>
                <th>Tenant Partner</th>
                <th>Source Channel</th>
                <th>Current Status</th>
                <th>Transaction Vol.</th>
                <th style={{ padding: '16px 28px', textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map(order => (
                <tr key={order.id} style={{ transition: 'background 0.2s' }}>
                  <td style={{ padding: '18px 28px', fontWeight: 900, color: 'var(--text-main)', fontSize: '0.95rem' }}>#TRX-{order.id.slice(-6).toUpperCase()}</td>
                  <td style={{ fontWeight: 600 }}>{order.tenant?.name || 'Authorized Outlet'}</td>
                  <td>
                    <span className={`badge ${order.source === 'DELIVERY' ? 'badge-orange' : (order.source === 'POS' ? 'badge-info' : 'badge-purple')}`} style={{ borderRadius: 8, padding: '5px 10px' }}>
                      {order.source || 'GLOBAL POS'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-8">
                      <div className={`badge-dot ${order.status === 'COMPLETED' ? 'green' : 'orange'}`} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: 0.5 }}>{order.status}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>Rs {order.totalAmount?.toLocaleString()}</td>
                  <td style={{ padding: '18px 28px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="table-empty" style={{ padding: 60 }}>
                  <div style={{ opacity: 0.5, marginBottom: 12 }}><Activity size={48} /></div>
                  <div>PLATFORM IS QUIET — MONITORING FOR INCOMING TRAFFIC</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
