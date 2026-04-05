import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, DollarSign, ShoppingCart, Bike, Store, Activity } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const CO = {
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', boxWidth:10, padding:12, font:{size:11} } } },
  scales:{ y:{ ticks:{color:'#94a3b8',font:{size:11}}, grid:{color:'rgba(148,163,184,0.07)'}}, x:{ticks:{color:'#94a3b8',font:{size:11}},grid:{display:false}} }
};

export default function ReportsPage({ stats, orders }) {
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('sales');

  const salesData = {
    labels:['Jan','Feb','Mar','Apr','May','Jun'],
    datasets:[{ label:'Revenue ($)', data:[12000,19000,15000,22000,28000,34000],
      borderColor:'#8de02c', backgroundColor:'rgba(141,224,44,0.1)', fill:true, tension:0.4 }]
  };
  const ordersData = {
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets:[
      { label:'POS', data:[45,52,38,60,85,110,95], backgroundColor:'rgba(141,224,44,0.8)', borderRadius:5 },
      { label:'Delivery', data:[20,25,22,35,55,80,70], backgroundColor:'rgba(14,165,233,0.8)', borderRadius:5 }
    ]
  };
  const categoryData = {
    labels:['Burgers','Pizza','Drinks','Sides','Desserts'],
    datasets:[{ data:[35,30,20,10,5], backgroundColor:['#8de02c','#0ea5e9','#f97316','#8b5cf6','#ec4899'], borderWidth:0 }]
  };

  const downloadCSV = (type) => {
    let content = '';
    if (type === 'sales') {
      content = 'Month,Revenue\nJan,12000\nFeb,19000\nMar,15000\nApr,22000\nMay,28000\nJun,34000';
    } else {
      content = orders.map(o => `${o.orderNumber||o.id.slice(-5)},${o.totalAmount?.toFixed(2)},${o.status}`).join('\n');
      content = 'Order,Amount,Status\n' + content;
    }
    const blob = new Blob([content], {type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download=`${type}_report_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const reports = [
    { key:'sales',     label:'Sales Report',       icon:DollarSign },
    { key:'orders',    label:'Order Analytics',    icon:ShoppingCart },
    { key:'inventory', label:'Inventory Report',   icon:BarChart3 },
    { key:'riders',    label:'Rider Performance',  icon:Bike },
    { key:'vendors',   label:'Vendor Performance', icon:Store },
    { key:'pl',        label:'Profit & Loss',      icon:TrendingUp },
  ];

  const plData = [
    { label:'Gross Revenue', value:stats.totalRevenue||130000, type:'income' },
    { label:'Cost of Goods',  value:(stats.totalRevenue||130000)*0.42, type:'expense' },
    { label:'Gross Profit',   value:(stats.totalRevenue||130000)*0.58, type:'income' },
    { label:'Operating Expenses', value:12400, type:'expense' },
    { label:'Commission Paid', value:8200, type:'expense' },
    { label:'Net Profit',     value:(stats.totalRevenue||130000)*0.58-20600, type:'income' },
  ];

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><BarChart3 size={20}/>Reports & Analytics</div>
        <div className="flex gap-8">
          <select className="form-input" style={{width:140}} value={period} onChange={e=>setPeriod(e.target.value)}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-sm btn-green" onClick={()=>downloadCSV(reportType)}><Download size={13}/>Export CSV</button>
          <button className="btn btn-sm btn-outline" onClick={()=>window.print()}><Download size={13}/>PDF</button>
        </div>
      </div>

      {/* Report Type Nav */}
      <div className="flex gap-8 mb-20" style={{flexWrap:'wrap'}}>
        {reports.map(r=>(
          <button key={r.key} className={`tab ${reportType===r.key?'active':''}`} onClick={()=>setReportType(r.key)}>
            <r.icon size={13}/>{r.label}
          </button>
        ))}
      </div>

      {/* KPI row */}
      <div className="stat-grid mb-20">
        <div className="stat-card purple"><div className="stat-card-header"><div className="stat-icon purple"><DollarSign size={19}/></div><span className="stat-trend up">↑ 24%</span></div><div className="stat-value">${(stats.totalRevenue||130000).toLocaleString()}</div><div className="stat-label">Platform Revenue</div></div>
        <div className="stat-card cyan"><div className="stat-card-header"><div className="stat-icon cyan"><ShoppingCart size={19}/></div><span className="stat-trend up">↑ 12%</span></div><div className="stat-value">{stats.totalOrders||4521}</div><div className="stat-label">Total Orders</div></div>
        <div className="stat-card green"><div className="stat-card-header"><div className="stat-icon green"><Activity size={19}/></div></div><div className="stat-value">98.2%</div><div className="stat-label">Delivery Success</div></div>
        <div className="stat-card orange"><div className="stat-card-header"><div className="stat-icon orange"><Store size={19}/></div></div><div className="stat-value">{stats.totalTenants||84}</div><div className="stat-label">Active Vendors</div></div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-20">
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><TrendingUp size={16}/>Revenue Trend</div>
          </div>
          <div className="chart-container"><Line data={salesData} options={CO}/></div>
        </div>
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title"><BarChart3 size={16}/>Orders: POS vs Delivery</div>
          </div>
          <div className="chart-container"><Bar data={ordersData} options={CO}/></div>
        </div>
      </div>

      <div className="grid-2 mb-20">
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">Sales by Category</div>
          </div>
          <div style={{height:200,display:'flex',justifyContent:'center'}}>
            <Doughnut data={categoryData} options={{cutout:'65%',plugins:{legend:{position:'right',labels:{color:'#94a3b8',padding:10,boxWidth:10,font:{size:11}}}}}}/>
          </div>
        </div>

        {/* P&L Table */}
        <div className="glass-card">
          <div className="card-title mb-16"><TrendingUp size={16}/>Profit & Loss Statement</div>
          <table>
            <tbody>
              {plData.map((row,i)=>(
                <tr key={i} style={i===plData.length-1?{borderTop:'2px solid var(--border-color)'}:{}}>
                  <td style={{fontWeight:i===plData.length-1?800:500, paddingLeft:0}}>{row.label}</td>
                  <td style={{
                    textAlign:'right',fontWeight:700,
                    color: row.type==='income'?'var(--neon-green)':'var(--neon-red)'
                  }}>
                    {row.type==='expense'?'-':''}${row.value.toLocaleString(undefined,{maximumFractionDigits:0})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div className="glass-card">
        <div className="card-title mb-16"><Activity size={16}/>System Performance</div>
        <table>
          <thead><tr><th>Module</th><th>Active Users</th><th>Avg Response</th><th>Status</th></tr></thead>
          <tbody>
            {[
              {m:'Admin Dashboard',u:'14 online',p:'24ms',s:'Healthy'},
              {m:'POS System',u:'82 terminals',p:'18ms',s:'Healthy'},
              {m:'Rider App',u:'145 riders',p:'45ms',s:'Healthy'},
              {m:'Vendor Portal',u:'89 vendors',p:'32ms',s:'High Load'},
              {m:'Customer App',u:'2,341 sessions',p:'28ms',s:'Healthy'},
            ].map((r,i)=>(
              <tr key={i}>
                <td style={{fontWeight:600}}>{r.m}</td><td>{r.u}</td><td>{r.p}</td>
                <td><span className={`badge ${r.s==='Healthy'?'badge-success':'badge-warning'}`}>{r.s}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
