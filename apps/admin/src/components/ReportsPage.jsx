import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, DollarSign, ShoppingCart, Bike, Store, Activity, RefreshCw } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { API, headers as getHeaders } from '../App.jsx';

const CO = {
  responsive:true, maintainAspectRatio:false,
  plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', boxWidth:10, padding:12, font:{size:11} } } },
  scales:{ y:{ ticks:{color:'#94a3b8',font:{size:11}}, grid:{color:'rgba(148,163,184,0.07)'}}, x:{ticks:{color:'#94a3b8',font:{size:11}},grid:{display:false}} }
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('sales');
  const [data, setData] = useState({ stats: {}, sales: [], inventory: [], vendors: [], riders: [] });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const h = getHeaders();
      const [resSales, resInv, resVend, resRide] = await Promise.all([
        fetch(`${API}/api/reports/sales`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/reports/inventory`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/reports/vendors`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/reports/riders`, { headers: h }).then(r => r.json())
      ]);
      setData({ sales: resSales, inventory: resInv, vendors: resVend, riders: resRide });
    } catch (e) { console.error('Report fetch error', e); }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const salesTrend = {
    labels: data.sales.dailyBreakdown?.map(d => d.date) || [],
    datasets: [{ label:'Revenue (Rs)', data: data.sales.dailyBreakdown?.map(d => d.sales) || [],
      borderColor:'#8de02c', backgroundColor:'rgba(141,224,44,0.1)', fill:true, tension:0.4 }]
  };

  const reports = [
    { key:'sales',     label:'Sales Report',       icon:DollarSign },
    { key:'inventory', label:'Inventory Report',   icon:BarChart3 },
    { key:'vendors',   label:'Vendor Performance', icon:Store },
    { key:'riders',    label:'Rider Performance',  icon:Bike },
  ];

  if (loading) return <div className="text-center py-40"><RefreshCw className="spin" size={32} color="#8de02c"/></div>;

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><BarChart3 size={20}/>Advanced Business Analytics</div>
        <div className="flex gap-8">
          <button className="btn btn-sm btn-green" onClick={() => window.print()}><Download size={13}/>Export PDF</button>
        </div>
      </div>

      <div className="flex gap-8 mb-20" style={{flexWrap:'wrap'}}>
        {reports.map(r=>(
          <button key={r.key} className={`tab ${reportType===r.key?'active':''}`} onClick={()=>setReportType(r.key)}>
            <r.icon size={13}/>{r.label}
          </button>
        ))}
      </div>

      <div className="stat-grid mb-20">
        <div className="stat-card purple"><div className="stat-card-header"><div className="stat-icon purple"><DollarSign size={19}/></div></div><div className="stat-value">Rs {(data.sales.totalSales||0).toLocaleString()}</div><div className="stat-label">Total Volume</div></div>
        <div className="stat-card cyan"><div className="stat-card-header"><div className="stat-icon cyan"><ShoppingCart size={19}/></div></div><div className="stat-value">{data.sales.orderCount||0}</div><div className="stat-label">Total Invoices</div></div>
        <div className="stat-card green"><div className="stat-card-header"><div className="stat-icon green"><Activity size={19}/></div></div><div className="stat-value">Rs {(data.inventory.totalValuation||0).toLocaleString()}</div><div className="stat-label">Stock Valuation</div></div>
        <div className="stat-card orange"><div className="stat-card-header"><div className="stat-icon orange"><Store size={19}/></div></div><div className="stat-value">{data.vendors.length||0}</div><div className="stat-label">Live Vendors</div></div>
      </div>

      {reportType === 'sales' && (
        <div className="glass-card mb-20">
          <div className="card-header"><div className="card-title"><TrendingUp size={16}/>Daily Revenue Stream</div></div>
          <div className="chart-container" style={{height:300}}><Line data={salesTrend} options={CO}/></div>
        </div>
      )}

      {reportType === 'inventory' && (
        <div className="glass-card">
          <div className="card-header"><div className="card-title"><BarChart3 size={16}/>Inventory Valuation by Outlet</div></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Item</th><th>Outlet</th><th>Stock</th><th>Status</th></tr></thead>
              <tbody>
                {data.inventory.stocks?.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.product?.name}</strong></td>
                    <td>{s.outlet?.name}</td>
                    <td style={{fontWeight:800}}>{s.quantity} {s.product?.unit}</td>
                    <td><span className={`badge ${s.quantity > 5 ? 'badge-success' : 'badge-danger'}`}>{s.quantity > 5 ? 'Stable' : 'Low Stock'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'vendors' && (
        <div className="glass-card">
          <div className="card-header"><div className="card-title"><Store size={16}/>Vendor Commission Tracking</div></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Vendor Name</th><th>Email</th><th>Total Products</th><th>Commission Paid</th></tr></thead>
              <tbody>
                {data.vendors.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.user?.name}</strong></td>
                    <td>{v.user?.email}</td>
                    <td>{v.products?.length || 0}</td>
                    <td style={{fontWeight:800, color:'var(--neon-green)'}}>Rs {v.payouts?.reduce((s,p)=>s+p.amount, 0) || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
