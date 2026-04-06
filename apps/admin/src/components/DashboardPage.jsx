import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Building,
  Activity, PieChart, Clock, Package, Bike, Store, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { API, headers as getHeaders } from '../App.jsx';

export default function DashboardPage({ onNav }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue:0, totalOrders:0, totalUsers:0, totalTenants:0, revenueTrend:[] });
  const [activities, setActivities] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const h = getHeaders();
      const [resStats, resLogs] = await Promise.all([
        fetch(`${API}/api/reports/dashboard`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/reports/activity-logs`, { headers: h }).then(r => r.json())
      ]);
      
      if (resStats) {
        setStats(resStats);
        setRecentOrders(resStats.recentOrders || []);
      }
      if (Array.isArray(resLogs)) {
        setActivities(resLogs);
      }
    } catch (e) { console.error('Dashboard load error', e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const revenueData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{ data: stats.revenueTrend || [],
      fill: true, backgroundColor: 'rgba(141,224,44,0.07)', borderColor: '#8de02c', borderWidth: 2,
      pointBackgroundColor: '#8de02c', pointRadius: 3, tension: 0.4 }]
  };

  const kpis = [
    { label:'Total Revenue', value:`Rs ${(stats.totalRevenue||0).toLocaleString()}`, trend:'Live', icon:DollarSign, color:'purple' },
    { label:'Total Orders',  value:stats.totalOrders||0,                           trend:'Live',  icon:ShoppingCart, color:'cyan' },
    { label:'Active Users',  value:stats.totalUsers||0,                            trend:'Active', icon:Users, color:'green' },
    { label:'Active Tenants', value:stats.totalTenants||0,                          trend:'Cloud',  icon:Building, color:'orange' },
  ];

  if (loading) return <div style={{padding:40, textAlign:'center'}}><RefreshCw className="spin" size={32} color="#39FF14"/></div>;

  return (
    <div className="fade-in">
      <div className="stat-grid">
        {kpis.map(k => (
          <div key={k.label} className={`stat-card ${k.color}`}>
            <div className="stat-card-header">
              <div className={`stat-icon ${k.color}`}><k.icon size={20} /></div>
              <span className="stat-trend up">{k.trend}</span>
            </div>
            <div className="stat-value">{k.value}</div>
            <div className="stat-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-20">
        <div className="glass-card">
          <div className="card-header"><div className="card-title"><TrendingUp size={16}/>Revenue Trend (2026)</div></div>
          <div className="chart-container" style={{height:300}}><Line data={revenueData} options={{ responsive:true, maintainAspectRatio:false }} /></div>
        </div>
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><Activity size={16}/>Platform Audit Logs</div>
            <span className="live-dot" />
          </div>
          <div className="activity-list" style={{maxHeight: 300, overflowY: 'auto'}}>
            {activities.length > 0 ? activities.map((a,i) => (
              <div key={i} className="activity-item">
                <div className={`activity-dot ${a.action==='DELETE'?'red':'blue'}`} />
                <div className="activity-info">
                  <div className="activity-text"><strong>{a.username}</strong> {a.action.toLowerCase()}d <strong>{a.entity}</strong></div>
                  <div className="activity-time">{new Date(a.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            )) : <div className="text-muted text-center py-20">No recent activity logs</div>}
          </div>
        </div>
      </div>

      <div className="glass-card mb-20">
        <div className="card-header">
          <div className="card-title"><ShoppingCart size={16}/>Real-time Inbound Invoices</div>
          <button className="btn btn-sm btn-outline" onClick={() => onNav('invoices')}>Full Ledger</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td style={{fontWeight:700}}>#{o.orderNumber || o.id.slice(-5)}</td>
                  <td>{o.customer?.name || 'Walk-in'}</td>
                  <td style={{fontWeight:800}}>Rs {o.totalAmount}</td>
                  <td><span className={`badge badge-success`}>{o.status}</span></td>
                  <td className="text-muted text-sm">{new Date(o.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
