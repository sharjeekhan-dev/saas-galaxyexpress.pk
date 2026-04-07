import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Download, Printer, Save, X, DollarSign, 
  ArrowUpRight, ArrowDownRight, CreditCard, Landmark, BookOpen 
} from 'lucide-react';

import { API } from '../App.jsx';

export default function AccountsERP({ tenant, headers }) {
  const [subTab, setSubTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [isAddingAcc, setIsAddingAcc] = useState(false);
  const [isAddingVch, setIsAddingVch] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', type: 'ASSET' });
  const [newVch, setNewVch] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    reference: '', 
    description: '', 
    lines: [{ accountId: '', debit: 0, credit: 0 }, { accountId: '', debit: 0, credit: 0 }] 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, vchRes] = await Promise.all([
        fetch(`${API}/api/accounts/coa`, { headers }),
        fetch(`${API}/api/accounts/vouchers`, { headers })
      ]);
      if (accRes.ok) setAccounts(await accRes.json());
      if (vchRes.ok) setVouchers(await vchRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [headers, tenant]);

  const handleSaveAccount = async () => {
    if (!newAcc.name) return alert('Name is required');
    try {
      const res = await fetch(`${API}/api/accounts/coa`, {
        method: 'POST', headers, body: JSON.stringify(newAcc)
      });
      if (res.ok) {
        setIsAddingAcc(false);
        setNewAcc({ name: '', type: 'ASSET' });
        fetchData();
      }
    } catch (e) { console.error(e); }
  };

  const addVchLine = () => setNewVch({ ...newVch, lines: [...newVch.lines, { accountId: '', debit: 0, credit: 0 }] });
  const updateVchLine = (idx, key, val) => {
    const nl = [...newVch.lines];
    nl[idx][key] = val;
    setNewVch({ ...newVch, lines: nl });
  };

  const handleSaveVoucher = async () => {
    const debits = newVch.lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const credits = newVch.lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    if (Math.abs(debits - credits) > 0.01) return alert('Dr/Cr must be balanced');

    try {
      const res = await fetch(`${API}/api/accounts/vouchers`, {
        method: 'POST', headers, body: JSON.stringify(newVch)
      });
      if (res.ok) {
        setIsAddingVch(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) { console.error(e); }
  };

  const cardStyle = { background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24, marginBottom: 20 };
  const tabBtn = (id, label) => (
    <button 
      onClick={() => setSubTab(id)}
      style={{
        padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 800, transition: '0.3s',
        background: subTab === id ? '#8de02c' : 'rgba(255,255,255,0.05)',
        color: subTab === id ? '#000' : 'var(--text-muted)',
      }}
    >{label}</button>
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Cloud Accounting & Ledgers</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setIsAddingAcc(true)} className="btn btn-outline">+ Add COA</button>
          <button onClick={() => setIsAddingVch(true)} className="btn btn-primary">+ Post Journal</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {tabBtn('dashboard', 'Dashboard')}
        {tabBtn('coa', 'Chart of Accounts')}
        {tabBtn('vouchers', 'Vouchers')}
        {tabBtn('trial', 'Trial Balance')}
        {tabBtn('daybook', 'Day Book')}
      </div>

      {subTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <StatCard title="ASSETS" val={accounts.filter(a => a.type === 'ASSET').reduce((s, a) => s + a.balance, 0)} icon={Landmark} c="#39FF14" theme={theme} />
          <StatCard title="LIABILITIES" val={accounts.filter(a => a.type === 'LIABILITY').reduce((s, a) => s + a.balance, 0)} icon={CreditCard} c="#ef4444" theme={theme} />
          <StatCard title="REVENUE" val={accounts.filter(a => a.type === 'REVENUE').reduce((s, a) => s + a.balance, 0)} icon={ArrowUpRight} c="#3b82f6" theme={theme} />
          <StatCard title="EXPENSE" val={accounts.filter(a => a.type === 'EXPENSE').reduce((s, a) => s + a.balance, 0)} icon={ArrowDownRight} c="#f97316" theme={theme} />
        </div>
      )}

      {subTab === 'coa' && (
        <div style={cardStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', color: theme.muted, fontSize: '0.8rem' }}><th style={{ padding: 12 }}>A/C Title</th><th style={{ padding: 12 }}>Category</th><th style={{ padding: 12, textAlign: 'right' }}>Current Balance</th></tr></thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: 12, fontWeight: 700 }}>{a.name}</td><td style={{ padding: 12 }}>{a.type}</td><td style={{ padding: 12, textAlign: 'right', fontWeight: 900 }}>Rs {a.balance.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
          {accounts.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: theme.muted }}>No accounts defined yet.</div>}
        </div>
      )}

      {subTab === 'vouchers' && (
        <div style={cardStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left', color: theme.muted, fontSize: '0.8rem' }}><th style={{ padding: 12 }}>Ref #</th><th style={{ padding: 12 }}>Date</th><th style={{ padding: 12 }}>Description</th><th style={{ padding: 12, textAlign: 'right' }}>Total (Dr/Cr)</th></tr></thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: 12, fontWeight: 900 }}>{v.reference || 'JV-'+v.id.slice(0,5)}</td>
                  <td style={{ padding: 12 }}>{new Date(v.date).toLocaleDateString()}</td>
                  <td style={{ padding: 12 }}>{v.description}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontWeight: 800 }}>Rs {v.lines.reduce((s, l) => s + l.debit, 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vouchers.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: theme.muted }}>No vouchers found.</div>}
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      {isAddingAcc && (
        <Overlay title="New Chart of Account" onClose={() => setIsAddingAcc(false)} theme={theme}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', color: theme.muted }}>Account Title</label>
            <input value={newAcc.name} onChange={e => setNewAcc({ ...newAcc, name: e.target.value })} style={{ width: '100%', padding: 14, borderRadius: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} placeholder="e.g. Bank Al Habib" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', color: theme.muted }}>Group / Type</label>
            <select value={newAcc.type} onChange={e => setNewAcc({ ...newAcc, type: e.target.value })} style={{ width: '100%', padding: 14, borderRadius: 10, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}>
                {['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={handleSaveAccount} style={{ width: '100%', padding: 16, background: '#39FF14', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>Create Account Head</button>
        </Overlay>
      )}

      {/* ADD VOUCHER MODAL */}
      {isAddingVch && (
        <Overlay title="Record Journal Voucher (JV)" onClose={() => setIsAddingVch(false)} theme={theme} width={800}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', color: theme.muted }}>Voucher Date</label>
              <input type="date" value={newVch.date} onChange={e => setNewVch({ ...newVch, date: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', color: theme.muted }}>Manual Ref #</label>
              <input value={newVch.reference} onChange={e => setNewVch({ ...newVch, reference: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }} placeholder="Internal tracking number" />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8rem', color: theme.muted }}>Voucher Narration / Description</label>
            <textarea value={newVch.description} onChange={e => setNewVch({ ...newVch, description: e.target.value })} style={{ width: '100%', padding: 12, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, height: 80 }} placeholder="Detailed reason for this transaction..." />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><h4 style={{ margin: 0 }}>Entries</h4> <button onClick={addVchLine} style={{ background: 'transparent', color: '#39FF14', border: 'none', cursor: 'pointer', fontWeight: 800 }}>+ Row</button></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 0.4fr', gap: 10, background: 'rgba(0,0,0,0.1)', padding: 10, borderRadius: 8, fontSize: '0.75rem', fontWeight: 900, marginBottom: 8 }}>
                <div>A/C HEAD</div><div>DEBIT</div><div>CREDIT</div><div></div>
            </div>
            {newVch.lines.map((l, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 0.4fr', gap: 10, marginBottom: 10 }}>
                <select value={l.accountId} onChange={e => updateVchLine(idx, 'accountId', e.target.value)} style={{ padding: 10, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}>
                  <option value="">Select Account</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <input type="number" value={l.debit} onChange={e => updateVchLine(idx, 'debit', Number(e.target.value))} style={{ padding: 10, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, textAlign: 'right' }} />
                <input type="number" value={l.credit} onChange={e => updateVchLine(idx, 'credit', Number(e.target.value))} style={{ padding: 10, borderRadius: 8, background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, textAlign: 'right' }} />
                <button onClick={() => setNewVch({ ...newVch, lines: newVch.lines.filter((_, i) => i !== idx) })} style={{ color: '#ef4444', border: 'none', background: 'transparent' }}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 20, padding: 16, borderTop: `1px solid ${theme.border}`, marginTop: 10 }}>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.7rem', color: theme.muted }}>Total Dr</div><div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{newVch.lines.reduce((s, l) => s + Number(l.debit || 0), 0)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.7rem', color: theme.muted }}>Total Cr</div><div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{newVch.lines.reduce((s, l) => s + Number(l.credit || 0), 0)}</div></div>
            </div>
          </div>
          <button onClick={handleSaveVoucher} style={{ width: '100%', padding: 16, background: '#39FF14', color: '#000', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>Post Voucher to Ledger</button>
        </Overlay>
      )}
    </div>
  );
}

function StatCard({ title, val, icon: Icon, c, theme }) {
  return (
    <div style={{ background: theme.card, padding: 24, borderRadius: 16, border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: theme.muted, marginBottom: 8, letterSpacing: 1 }}>{title}</div>
        <div style={{ fontSize: '2.2rem', fontWeight: 900, color: c }}>Rs {Math.abs(val).toLocaleString()}</div>
      </div>
      <Icon size={40} color={c} style={{ opacity: 0.3 }} />
    </div>
  );
}

function Overlay({ title, onClose, width = 450, children, theme }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: theme.card, padding: 32, borderRadius: 24, width: '100%', maxWidth: width, border: `1px solid ${theme.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ margin: 0, color: theme.text }}>{title}</h2>
                    <X cursor="pointer" onClick={onClose} color={theme.text} />
                </div>
                {children}
            </div>
        </div>
    );
}
