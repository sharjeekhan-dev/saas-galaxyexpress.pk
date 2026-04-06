import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Building,
  Activity, PieChart, Clock, Package, Bike, Store, ArrowUpRight, Zap } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartBase = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.08)' } },
    x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } }
  }
};

// Generate live activities from orders data
function generateActivities(orders) {
  const base = [
    { text:'Platform dashboard accessed by <strong>Super Admin</strong>', time:'just now', color:'blue', type:'login' },
  ];

  if (orders.length > 0) {
    const recent = orders.slice(0, 3);
    recent.forEach((o, i) => {
      const num = o.orderNumber || o.id?.slice(-5) || 'N/A';
      if (o.status === 'DELIVERED') {
        base.push({ text:`Order <strong>#${num}</strong> delivered successfully`, time:`${(i+1)*3} min ago`, color:'green', type:'order' });
      } else if (o.status === 'PREPARING') {
        base.push({ text:`Order <strong>#${num}</strong> being prepared in kitchen`, time:`${(i+1)*5} min ago`, color:'orange', type:'order' });
      } else if (o.status === 'PENDING') {
        base.push({ text:`New order <strong>#${num}</strong> received — $${o.totalAmount?.toFixed(2) || '0.00'}`, time:`${(i+1)*2} min ago`, color:'blue', type:'order' });
      } else if (o.status === 'CANCELLED') {
        base.push({ text:`Order <strong>#${num}</strong> was cancelled`, time:`${(i+1)*7} min ago`, color:'red', type:'order' });
      }
    });
  }

  // Add some platform-wide activities
  base.push(
    { text:'New vendor <strong>Pizza Palace</strong> registration', time:'12 min ago', color:'blue', type:'vendor' },
    { text:'Logo updated in <strong>Branding Settings</strong>', time:'25 min ago', color:'purple', type:'settings' },
    { text:'Low stock: <strong>Chicken Breast</strong> (5 units left)', time:'32 min ago', color:'orange', type:'inventory' },
    { text:'Rider <strong>Ahmed K.</strong> went offline', time:'45 min ago', color:'red', type:'rider' },
    { text:'Daily report generated for <strong>Main Branch</strong>', time:'1 hr ago', color:'purple', type:'report' },
    { text:'New customer <strong>Sana K.</strong> registered via app', time:'1.5 hr ago', color:'green', type:'customer' },
    { text:'POS terminal opened at <strong>DHA Branch</strong>', time:'2 hr ago', color:'blue', type:'pos' },
  );

  return base.slice(0, 10);
}

export default function DashboardPage({ stats, orders, onNav }) {
  const [activities, setActivities] = useState([]);
  const [liveTime, setLiveTime] = useState(new Date());

  // Update activities when orders change
  useEffect(() => {
    setActivities(generateActivities(orders));
  }, [orders]);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const revenueData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{ data: [18000,24000,32000,28000,45000,52000,48000,61000,55000,72000,68000,stats.totalRevenue||80000],
      fill: true, backgroundColor: 'rgba(141,224,44,0.07)', borderColor: '#8de02c', borderWidth: 2,
      pointBackgroundColor: '#8de02c', pointRadius: 3, tension: 0.4 }]
  };
  const ordersData = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [
      { label:'Dine-in', data:[45,62,38,71,55,92,87], backgroundColor:'rgba(141,224,44,0.75)', borderRadius:5 },
      { label:'Delivery', data:[32,45,28,53,41,68,63], backgroundColor:'rgba(14,165,233,0.75)', borderRadius:5 },
      { label:'Takeaway', data:[18,24,15,30,22,35,28], backgroundColor:'rgba(139,92,246,0.75)', borderRadius:5 },
    ]
  };
  const paymentData = {
    labels:['Cash','Card','Online','Wallet'],
    datasets:[{ data:[35,30,25,10], backgroundColor:['#8de02c','#0ea5e9','#22c55e','#f97316'], borderWidth:0 }]
  };

  const recentOrders = orders.slice(0,8);

  const kpis = [
    { label:'Total Revenue', value:`$${(stats.totalRevenue||0).toLocaleString()}`, trend:'+12.5%', icon:DollarSign, color:'purple' },
    { label:'Total Orders',  value:stats.totalOrders||0,                           trend:'+8.3%',  icon:ShoppingCart, color:'cyan' },
    { label:'Active Users',  value:stats.totalUsers||0,                            trend:'+3.2%',  icon:Users, color:'green' },
    { label:'Tenants',       value:stats.totalTenants||0,                          trend:'+2',     icon:Building, color:'orange' },
  ];

  return (
    <div className="fade-in">
      {/* KPI Cards */}
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

      {/* Charts row 1 */}
      <div className="grid-2 mb-20">
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><TrendingUp size={16}/>Revenue Overview</div>
          </div>
          <div className="chart-container"><Line data={revenueData} options={chartBase} /></div>
        </div>
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><BarChart3 size={16}/>Orders by Type</div>
          </div>
          <div className="chart-container">
            <Bar data={ordersData} options={{
              ...chartBase,
              plugins:{ legend:{ display:true, position:'bottom', labels:{ color:'#94a3b8', boxWidth:10, padding:14, font:{size:11} } } }
            }} />
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid-2 mb-20">
        {/* Recent Orders */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><ShoppingCart size={16}/>Recent Orders</div>
            <div className="flex gap-8 items-center">
              <span className="live-dot" />
              <button className="btn btn-sm btn-outline" onClick={() => onNav('orders')}>View All</button>
            </div>
          </div>
          <div className="table-wrapper" style={{border:'none',borderRadius:0}}>
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{fontWeight:700}}>#{o.orderNumber||o.id.slice(-5)}</td>
                    <td>{o.user?.name||'Walk-in'}</td>
                    <td style={{fontWeight:700}}>${o.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        o.status==='DELIVERED'?'badge-success':
                        o.status==='CANCELLED'?'badge-danger':
                        o.status==='PREPARING'?'badge-warning':'badge-info'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="table-empty">No orders yet — will appear in real-time</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-20">
          {/* Payment Breakdown */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title"><PieChart size={16}/>Payment Methods</div>
            </div>
            <div style={{height:180,display:'flex',justifyContent:'center'}}>
              <Doughnut data={paymentData} options={{
                responsive:true, maintainAspectRatio:false, cutout:'68%',
                plugins:{ legend:{ position:'right', labels:{ color:'#94a3b8', padding:10, boxWidth:10, font:{size:11} } } }
              }} />
            </div>
          </div>

          {/* Live Activity */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title"><Activity size={16}/>Live Activity</div>
              <div className="flex items-center gap-8">
                <span className="text-xs text-muted">{liveTime.toLocaleTimeString()}</span>
                <span className="live-dot" />
              </div>
            </div>
            <div className="activity-list">
              {activities.map((a,i) => (
                <div key={i} className="activity-item">
                  <div className={`activity-dot ${a.color}`} />
                  <div className="activity-info">
                    <div className="activity-text" dangerouslySetInnerHTML={{__html:a.text}} />
                    <div className="activity-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid-3">
        {[
          { icon:Package, label:'Products', value:'248', sub:'12 low stock', color:'lime', action:()=>onNav('products') },
          { icon:Store,   label:'Vendors',  value:'34',  sub:'3 pending', color:'cyan', action:()=>onNav('vendors') },
          { icon:Bike,    label:'Riders',   value:'18',  sub:'12 online now', color:'green', action:()=>onNav('riders') },
        ].map(card => (
          <div key={card.label} className="glass-card" style={{cursor:'pointer'}} onClick={card.action}>
            <div className="flex items-center gap-12">
              <div className={`stat-icon ${card.color}`}><card.icon size={20}/></div>
              <div>
                <div style={{fontSize:'1.6rem',fontWeight:800}}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
                <div className="text-xs text-muted mt-8">{card.sub}</div>
              </div>
              <ArrowUpRight size={16} color="var(--text-light)" style={{marginLeft:'auto'}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
