import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Download, DollarSign, ShoppingCart,
  Bike, Store, Activity, RefreshCw, Layers, ArrowUpRight, ArrowDownRight,
  Filter, Calendar, PieChart
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { API, headers as getHeaders } from '../App.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS Components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 6, usePointStyle: true, font: { size: 10, weight: '700' }, padding: 20 } },
    tooltip: { backgroundColor: '#0f172a', titleFont: { size: 12 }, bodyFont: { size: 12 }, padding: 12, cornerRadius: 8, displayColors: false }
  },
  scales: {
    y: { beginAtZero: true, border: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: '600' } }, grid: { color: 'rgba(148,163,184,0.05)' } },
    x: { border: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: '600' } }, grid: { display: false } }
  }
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState('ALL');
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState({ stats: {}, sales: [], inventory: [], vendors: [], riders: [] });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const h = getHeaders();
      const [resSales, resInv, resVend] = await Promise.all([
        fetch(`${API}/api/reports/sales?range=${timeRange}`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/reports/inventory`, { headers: h }).then(r => r.json()),
        fetch(`${API}/api/reports/vendors`, { headers: h }).then(r => r.json())
      ]);
      setData({ 
        sales: resSales || { totalSales: 0, orderCount: 0, dailyBreakdown: [] }, 
        inventory: resInv || { totalValuation: 0, stocks: [] }, 
        vendors: resVend || [] 
      });
    } catch (e) {
      console.error('Report fetch error', e);
      setData({ 
        sales: { totalSales: 0, orderCount: 0, dailyBreakdown: [] }, 
        inventory: { totalValuation: 0, stocks: [] }, 
        vendors: [] 
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [timeRange]);

  const salesTrendData = {
    labels: data.sales?.dailyBreakdown?.map(d => d.date) || [],
    datasets: [{
      label: 'Volume (Rs)',
      data: data.sales?.dailyBreakdown?.map(d => d.sales) || [],
      borderColor: '#39FF14',
      backgroundColor: 'rgba(57, 255, 20, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#39FF14',
      borderWidth: 3
    }]
  };

  const channelData = {
    labels: ['POS', 'Delivery', 'Dine-in', 'Takeaway'],
    datasets: [{
      data: [45, 30, 15, 10],
      backgroundColor: ['#39FF14', '#0ea5e9', '#f97316', '#8b5cf6'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  if (loading) return (
    <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <RefreshCw className="spin" size={42} color="#39FF14" />
      <div style={{ fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 2 }}>ANALYZING BIG DATA...</div>
    </div>
  );

  return (
    <div className="fade-in">
      {/* HEADER SECTION */}
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, color: 'var(--text-main)' }}>Visual Intelligence</h1>
          <p className="text-muted" style={{ fontSize: '1rem', marginTop: 4 }}>Deep-dive analytics and strategic business KPIs.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="flex bg-card p-4 rounded-12 border-1" style={{ background: 'var(--bg-input)' }}>
            {['7d', '30d', '90d', 'ALL'].map(r => (
              <button key={r} onClick={() => setTimeRange(r)} style={{
                padding: '6px 16px', borderRadius: 10, border: 'none', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                background: timeRange === r ? 'var(--accent)' : 'transparent',
                color: timeRange === r ? '#000' : 'var(--text-muted)',
                transition: '0.2s'
              }}>{r.toUpperCase()}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Download size={14} /> Export BI Report
          </button>
        </div>
      </div>

      {/* CORE KPI SUMMARY */}
      <div className="stat-grid mb-32">
        <div className="stat-card blue">
          <div className="stat-card-header">
            <div className="stat-icon blue"><DollarSign size={20} /></div>
            <div className="stat-trend up">+18% <ArrowUpRight size={12} /></div>
          </div>
          <div className="stat-value">Rs {(data.sales?.totalSales || 0).toLocaleString()}</div>
          <div className="stat-label">Net Sales Volume</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-header">
            <div className="stat-icon purple"><Layers size={20} /></div>
            <div className="stat-trend up">+4.2% <ArrowUpRight size={12} /></div>
          </div>
          <div className="stat-value">Rs {(data.inventory?.totalValuation || 0).toLocaleString()}</div>
          <div className="stat-label">Stock Valuation</div>
        </div>

        <div className="stat-card cyan">
          <div className="stat-card-header">
            <div className="stat-icon cyan"><ShoppingCart size={20} /></div>
            <div className="stat-trend down">-1.5% <ArrowDownRight size={12} /></div>
          </div>
          <div className="stat-value">{data.sales?.orderCount || 0}</div>
          <div className="stat-label">Transactions Matched</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-card-header">
            <div className="stat-icon orange"><PieChart size={20} /></div>
            <div className="stat-trend up">82% <ArrowUpRight size={12} /></div>
          </div>
          <div className="stat-value">Rs 142k</div>
          <div className="stat-label">Est. Commissions</div>
        </div>
      </div>

      {/* MAIN ANALYTIC GRID */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* REVENUE STREAM CHART */}
        <div className="glass-card" style={{ minHeight: 450, display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title" style={{ fontSize: '1.1rem' }}><TrendingUp size={20} color="var(--accent)" /> Revenue Velocity (Daily)</div>
            <div className="flex gap-10">
              <span className="badge badge-lime">LIVE FEED</span>
              <button className="btn-icon" onClick={fetchReports}><RefreshCw size={14} /></button>
            </div>
          </div>
          <div style={{ flex: 1, padding: '20px 0 10px 0' }}>
            <Line data={salesTrendData} options={CHART_CONFIG} />
          </div>
        </div>

        {/* CHANNEL BREAKDOWN */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title" style={{ fontSize: '1.1rem' }}><PieChart size={20} color="var(--neon-cyan)" /> Order Affinity</div>
          </div>
          <div style={{ flex: 1, padding: '20px 10px' }}>
            <div style={{ height: 220 }}>
              <Doughnut data={channelData} options={{ ...CHART_CONFIG, cutout: '75%' }} />
            </div>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Cloud POS', value: '45%', color: '#39FF14' },
                { label: 'Delivery App', value: '30%', color: '#0ea5e9' },
                { label: 'Third-party', value: '25%', color: '#f97316' }
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-center" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                  <div className="flex items-center gap-10">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.label}</span>
                  </div>
                  <span style={{ fontWeight: 800 }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TENANT PERFORMANCE LEADERBOARD */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title"><Store size={20} color="var(--accent)" /> Tenant Performance Leaderboard</div>
          <button className="btn btn-outline btn-sm">Audit Full Registry →</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Business Entity</th>
                <th>Operational Node</th>
                <th>Transaction Vol.</th>
                <th>Gross Revenue</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Pizza Palace', slug: 'pizzapalace.pk', orders: 142, revenue: 152000, score: 98, status: 'EXCELLENT' },
                { name: 'Burger Galaxy', slug: 'bg-galaxy.pk', orders: 98, revenue: 84500, score: 85, status: 'STABLE' },
                { name: 'Spice Route', slug: 'spice-route.pk', orders: 45, revenue: 32000, score: 42, status: 'WARNING' }
              ].map((t, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{t.name}</div>
                    <div className="text-xs text-muted">{t.slug}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>SOUTH-ZONE-01</td>
                  <td style={{ fontWeight: 600 }}>{t.orders} TRX</td>
                  <td style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1rem' }}>Rs {t.revenue.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, width: 80 }}>
                        <div style={{ height: '100%', background: t.score > 80 ? 'var(--neon-green)' : (t.score > 50 ? 'var(--neon-cyan)' : 'var(--neon-red)'), width: `${t.score}%`, borderRadius: 10 }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{t.score}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${t.status === 'EXCELLENT' ? 'badge-lime' : (t.status === 'STABLE' ? 'badge-info' : 'badge-orange')}`} style={{ borderRadius: 8, padding: '6px 12px', fontSize: '0.7rem' }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
