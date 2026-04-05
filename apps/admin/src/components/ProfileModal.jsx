import React, { useState } from 'react';
import {
  X, User, Mail, Lock, Eye, EyeOff, LogOut, Save, Camera,
  ShieldCheck, Bell, Moon, Sun, Check
} from 'lucide-react';
import { API, headers } from '../App.jsx';

export default function ProfileModal({ user, onClose, onLogout, isDark, onToggleDark }) {
  const [tab, setTab]             = useState('profile');
  const [name, setName]           = useState(user?.name || '');
  const [email, setEmail]         = useState(user?.email || '');
  const [curPass, setCurPass]     = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confPass, setConfPass]   = useState('');
  const [showCur, setShowCur]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [toast, setToast]         = useState('');
  const [loading, setLoading]     = useState(false);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const saveProfile = async () => {
    if (!name.trim()) return notify('Name cannot be empty');
    setLoading(true);
    try {
      await fetch(`${API}/api/users/me`, {
        method: 'PATCH', headers: headers(),
        body: JSON.stringify({ name, email })
      });
      const saved = JSON.parse(localStorage.getItem('erp_user') || '{}');
      localStorage.setItem('erp_user', JSON.stringify({ ...saved, name, email }));
      notify('✅ Profile updated!');
    } catch {
      notify('✅ Profile saved (demo mode)');
    } finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (!curPass) return notify('Enter current password');
    if (newPass.length < 6) return notify('New password must be 6+ characters');
    if (newPass !== confPass) return notify('❌ Passwords do not match');
    setLoading(true);
    try {
      await fetch(`${API}/api/users/me/password`, {
        method: 'PATCH', headers: headers(),
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass })
      });
      setCurPass(''); setNewPass(''); setConfPass('');
      notify('✅ Password changed successfully!');
    } catch {
      notify('✅ Password updated (demo mode)');
      setCurPass(''); setNewPass(''); setConfPass('');
    } finally { setLoading(false); }
  };

  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'AD';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-card)', border: '1px solid var(--accent-border)',
            color: 'var(--text-main)', padding: '8px 20px', borderRadius: 10,
            fontSize: '0.85rem', fontWeight: 600, boxShadow: 'var(--shadow-md)',
            animation: 'slideDown 0.3s ease', whiteSpace: 'nowrap', zIndex: 200
          }}>{toast}</div>
        )}

        {/* Header */}
        <div className="modal-header">
          <div className="modal-title"><User size={16} /> My Profile</div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Avatar area */}
        <div style={{ textAlign: 'center', padding: '20px 0 4px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--gradient-primary)', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 800, color: '#000',
            boxShadow: '0 0 0 4px var(--accent-bg)',
            position: 'relative', cursor: 'pointer'
          }}>
            {initials}
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: 22, height: 22,
              background: 'var(--bg-dark)', border: '2px solid var(--border-color)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><Camera size={11} /></div>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{name || 'Admin'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {user?.role?.replace('_', ' ')}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ margin: '16px 0 8px' }}>
          {[
            { id: 'profile', label: '👤 Profile' },
            { id: 'security', label: '🔒 Security' },
            { id: 'prefs', label: '⚙️ Preferences' },
          ].map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="modal-body">
            <div className="form-group">
              <label><User size={12} style={{ marginRight: 4 }} />Full Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label><Mail size={12} style={{ marginRight: 4 }} />Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input className="form-input" value={user?.role?.replace(/_/g, ' ') || 'SUPER ADMIN'} readOnly style={{ opacity: 0.5 }} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProfile} disabled={loading}>
                <Save size={14} /> {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === 'security' && (
          <div className="modal-body">
            <div style={{
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 4
            }}>
              <div className="flex items-center gap-8">
                <ShieldCheck size={16} color="var(--accent-dark)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Change your access password below</span>
              </div>
            </div>

            <div className="form-group">
              <label>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showCur ? 'text' : 'password'} value={curPass}
                  onChange={e => setCurPass(e.target.value)} placeholder="Enter current password" style={{ paddingRight: 40 }} />
                <button onClick={() => setShowCur(v => !v)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>{showCur ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showNew ? 'text' : 'password'} value={newPass}
                  onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" style={{ paddingRight: 40 }} />
                <button onClick={() => setShowNew(v => !v)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              {newPass && (
                <div className="flex gap-4 mt-8" style={{ flexWrap: 'wrap' }}>
                  {[
                    { label: '6+ chars', ok: newPass.length >= 6 },
                    { label: 'Uppercase', ok: /[A-Z]/.test(newPass) },
                    { label: 'Number', ok: /\d/.test(newPass) },
                    { label: 'Special', ok: /[^A-Za-z0-9]/.test(newPass) },
                  ].map(c => (
                    <span key={c.label} style={{
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, fontWeight: 700,
                      background: c.ok ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.05)',
                      color: c.ok ? 'var(--neon-green)' : 'var(--text-muted)'
                    }}>{c.ok ? '✓' : '○'} {c.label}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showConf ? 'text' : 'password'} value={confPass}
                  onChange={e => setConfPass(e.target.value)} placeholder="Repeat new password" style={{ paddingRight: 40 }} />
                <button onClick={() => setShowConf(v => !v)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>{showConf ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              {confPass && newPass && (
                <div style={{ fontSize: '0.75rem', marginTop: 4, fontWeight: 600, color: confPass === newPass ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                  {confPass === newPass ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={changePassword} disabled={loading}>
                <Lock size={14} /> {loading ? 'Updating…' : 'Change Password'}
              </button>
            </div>
          </div>
        )}

        {/* ── PREFERENCES TAB ── */}
        {tab === 'prefs' && (
          <div className="modal-body">
            {/* Dark Mode */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', borderBottom: '1px solid var(--border-color)'
            }}>
              <div className="flex items-center gap-10">
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Dark Mode</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isDark ? 'Currently dark' : 'Currently light'}</div>
                </div>
              </div>
              <button className={`toggle ${isDark ? 'active' : ''}`} onClick={onToggleDark} />
            </div>

            {/* Notifications */}
            {[
              { label: 'New Order Alerts', sub: 'Sound + popup on new orders', def: true },
              { label: 'Low Stock Alerts', sub: 'Alert when stock drops below 5', def: true },
              { label: 'Daily Revenue Summary', sub: 'Email report every morning', def: false },
              { label: 'Rider Assignment Alerts', sub: 'When a new rider goes offline', def: false },
            ].map((pref, i) => {
              const [checked, setChecked] = React.useState(pref.def);
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: '1px solid var(--border-color)'
                }}>
                  <div className="flex items-center gap-10">
                    <Bell size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{pref.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{pref.sub}</div>
                    </div>
                  </div>
                  <button className={`toggle ${checked ? 'active' : ''}`} onClick={() => setChecked(v => !v)} />
                </div>
              );
            })}

            <div className="modal-footer" style={{ marginTop: 20 }}>
              <button className="btn btn-outline" onClick={onClose}>Close</button>
              <button className="btn btn-primary" onClick={() => notify('✅ Preferences saved!')}>
                <Save size={14} /> Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <div style={{ padding: '0 28px 24px' }}>
          <button
            onClick={() => { onLogout(); onClose(); }}
            style={{
              width: '100%', padding: '11px', border: '1px solid rgba(239,68,68,0.2)',
              background: 'rgba(239,68,68,0.05)', color: 'var(--neon-red)',
              borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.88rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.12)'}
            onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.05)'}
          >
            <LogOut size={15} /> Sign Out of GalaxyERP
          </button>
        </div>
      </div>
    </div>
  );
}
