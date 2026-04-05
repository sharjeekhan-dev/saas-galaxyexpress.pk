import React, { useState } from 'react';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, RefreshCw, Eye } from 'lucide-react';

const WALLETS = [
  {
    id:'admin', label:'Platform Wallet', color:'purple', balance:48320, icon:'🏦',
    transactions:[
      { id:1, desc:'Commission from Pizza Palace', amount:+245, type:'credit', date:'2026-04-05', method:'Auto' },
      { id:2, desc:'Commission from Burger Galaxy', amount:+180, type:'credit', date:'2026-04-05', method:'Auto' },
      { id:3, desc:'Payout to Rider Ahmed Khan', amount:-120, type:'debit', date:'2026-04-04', method:'Bank Transfer' },
      { id:4, desc:'Refund: Order #ORD-00412', amount:-45, type:'debit', date:'2026-04-04', method:'Online' },
    ]
  },
  {
    id:'vendors', label:'Vendor Wallets', color:'cyan', balance:18740, icon:'🏪',
    transactions:[
      { id:1, desc:'Pizza Palace — Order Revenue', amount:+1240, type:'credit', date:'2026-04-05', method:'Platform' },
      { id:2, desc:'Burger Galaxy — Order Revenue', amount:+890, type:'credit', date:'2026-04-05', method:'Platform' },
      { id:3, desc:'Fresh Foods Co — Bulk B2B Order', amount:+3200, type:'credit', date:'2026-04-04', method:'Platform' },
      { id:4, desc:'Payout to Pizza Palace', amount:-5000, type:'debit', date:'2026-04-03', method:'Bank Transfer' },
    ]
  },
  {
    id:'riders', label:'Rider Wallets', color:'green', balance:4210, icon:'🛵',
    transactions:[
      { id:1, desc:'Ahmed Khan — 12 deliveries', amount:+145, type:'credit', date:'2026-04-05', method:'Platform' },
      { id:2, desc:'Hassan Ali — 8 deliveries', amount:+92, type:'credit', date:'2026-04-05', method:'Platform' },
      { id:3, desc:'Daily payout batch', amount:-800, type:'debit', date:'2026-04-04', method:'Bank Transfer' },
    ]
  },
];

const COMMISSIONS = [
  { vendor:'Pizza Palace', type:'Percentage', rate:'10%', lastMonth:4820, thisMonth:2100, orders:156 },
  { vendor:'Burger Galaxy', type:'Percentage', rate:'12%', thisMonth:1080, lastMonth:2200, orders:89 },
  { vendor:'Fresh Foods Co', type:'Fixed', rate:'$5.00/order', thisMonth:225, lastMonth:310, orders:45 },
];

export default function WalletsPage() {
  const [active, setActive] = useState('admin');
  const [view, setView] = useState('wallets');

  const current = WALLETS.find(w => w.id === active);

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Wallet size={20}/>Wallets & Financial Ledger</div>
        <div className="flex gap-8">
          <button className="btn btn-sm btn-outline"><RefreshCw size={13}/>Refresh</button>
          <button className="btn btn-sm btn-primary"><CreditCard size={14}/>Initiate Payout</button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="tabs mb-20">
        <button className={`tab ${view==='wallets'?'active':''}`} onClick={()=>setView('wallets')}>Wallets</button>
        <button className={`tab ${view==='commissions'?'active':''}`} onClick={()=>setView('commissions')}>Commissions</button>
        <button className={`tab ${view==='ledger'?'active':''}`} onClick={()=>setView('ledger')}>Ledger</button>
      </div>

      {view === 'wallets' && (
        <>
          {/* Wallet Cards */}
          <div className="grid-3 mb-20">
            {WALLETS.map(w => (
              <div key={w.id}
                className={`wallet-card`}
                style={{
                  cursor:'pointer',
                  background: w.id===active
                    ? 'var(--gradient-primary)'
                    : w.color==='cyan' ? 'linear-gradient(135deg,#0ea5e9,#0284c7)'
                    : w.color==='green' ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                    : 'var(--gradient-primary)',
                  opacity: w.id===active ? 1 : 0.85,
                  transform: w.id===active ? 'scale(1.02)' : 'scale(1)',
                  transition:'all 0.2s'
                }}
                onClick={() => setActive(w.id)}
              >
                <div className="wallet-label">{w.icon} {w.label}</div>
                <div className="wallet-balance">${w.balance.toLocaleString()}</div>
                <div style={{fontSize:'0.8rem',opacity:0.7,marginTop:4}}>Available Balance</div>
              </div>
            ))}
          </div>

          {/* Transaction List for selected wallet */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title"><DollarSign size={16}/>{current.label} — Transactions</div>
              <button className="btn btn-sm btn-outline">Export</button>
            </div>
            <div className="table-wrapper" style={{border:'none',borderRadius:0}}>
              <table>
                <thead>
                  <tr><th>Description</th><th>Date</th><th>Method</th><th>Amount</th><th>Type</th></tr>
                </thead>
                <tbody>
                  {current.transactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{fontWeight:600}}>{tx.desc}</td>
                      <td className="text-muted text-sm">{tx.date}</td>
                      <td><span className="badge badge-default">{tx.method}</span></td>
                      <td style={{fontWeight:700, color: tx.type==='credit'?'var(--neon-green)':'var(--neon-red)'}}>
                        {tx.type==='credit' ? '+' : ''} ${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      <td>
                        {tx.type==='credit'
                          ? <span className="flex items-center gap-4" style={{color:'var(--neon-green)'}}><ArrowUpRight size={14}/>Credit</span>
                          : <span className="flex items-center gap-4" style={{color:'var(--neon-red)'}}><ArrowDownRight size={14}/>Debit</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'commissions' && (
        <>
          <div className="stat-grid mb-20">
            <div className="stat-card purple"><div className="stat-value">$8,205</div><div className="stat-label">This Month Commission</div></div>
            <div className="stat-card green"><div className="stat-value">$7,330</div><div className="stat-label">Last Month Commission</div></div>
            <div className="stat-card orange"><div className="stat-value">$2,100</div><div className="stat-label">Pending Payouts</div></div>
            <div className="stat-card cyan"><div className="stat-value">290</div><div className="stat-label">Orders Commissionable</div></div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Vendor</th><th>Commission Type</th><th>Rate</th><th>This Month</th><th>Last Month</th><th>Orders</th><th>Actions</th></tr></thead>
              <tbody>
                {COMMISSIONS.map((c,i) => (
                  <tr key={i}>
                    <td style={{fontWeight:700}}>{c.vendor}</td>
                    <td><span className="badge badge-purple">{c.type}</span></td>
                    <td style={{fontWeight:600}}>{c.rate}</td>
                    <td style={{fontWeight:700,color:'var(--accent-dark)'}}>${c.thisMonth.toLocaleString()}</td>
                    <td className="text-muted">${c.lastMonth.toLocaleString()}</td>
                    <td>{c.orders}</td>
                    <td>
                      <div className="flex gap-4">
                        <button className="btn btn-sm btn-green">Pay Out</button>
                        <button className="btn-icon"><Eye size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'ledger' && (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
            <tbody>
              {[
                { date:'2026-04-05', ref:'TXN-0891', desc:'Commission — Pizza Palace', debit:'—', credit:'$245.00', bal:'$48,320' },
                { date:'2026-04-05', ref:'TXN-0890', desc:'Commission — Burger Galaxy', debit:'—', credit:'$180.00', bal:'$48,075' },
                { date:'2026-04-04', ref:'PAY-0145', desc:'Payout — Ahmed Khan (rider)', debit:'$120.00', credit:'—', bal:'$47,895' },
                { date:'2026-04-04', ref:'REF-0032', desc:'Refund — Order #ORD-00412', debit:'$45.00', credit:'—', bal:'$48,015' },
                { date:'2026-04-03', ref:'TXN-0888', desc:'Subscription — Tenant PRO plan', debit:'—', credit:'$99.00', bal:'$48,060' },
              ].map((r,i)=>(
                <tr key={i}>
                  <td className="text-muted text-sm">{r.date}</td>
                  <td style={{fontWeight:600,fontFamily:'monospace'}}>{r.ref}</td>
                  <td>{r.desc}</td>
                  <td style={{color:'var(--neon-red)',fontWeight:600}}>{r.debit}</td>
                  <td style={{color:'var(--neon-green)',fontWeight:600}}>{r.credit}</td>
                  <td style={{fontWeight:700}}>{r.bal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
