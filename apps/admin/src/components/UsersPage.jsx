import React, { useState } from 'react';
import { API, headers } from '../App.jsx';
import { Users, Plus, Edit, Trash2, X, Check, Shield, Loader } from 'lucide-react';

const ROLES = ['SUPER_ADMIN','TENANT_ADMIN','MANAGER','CASHIER','WAITER','VENDOR','RIDER','CUSTOMER','KITCHEN'];
const ROLE_COLOR = {
  SUPER_ADMIN:'badge-danger', TENANT_ADMIN:'badge-purple', MANAGER:'badge-cyan',
  CASHIER:'badge-lime', WAITER:'badge-info', VENDOR:'badge-orange',
  RIDER:'badge-green', CUSTOMER:'badge-default', KITCHEN:'badge-warning'
};

const PERMISSIONS = {
  SUPER_ADMIN: ['All Permissions'],
  TENANT_ADMIN: ['Manage Orders','Manage Products','View Reports','Manage Staff','Manage Settings'],
  MANAGER: ['Manage Orders','Manage Products','View Reports','Manage Staff'],
  CASHIER: ['Manage Orders','POS Access'],
  WAITER: ['View Orders','Update Order Status'],
  VENDOR: ['Manage Own Products','View Own Reports'],
  RIDER: ['View Assigned Deliveries','Update Delivery Status'],
  KITCHEN: ['View Orders','Update KDS Status'],
  CUSTOMER: ['Browse Menu','Place Orders','View Own Orders'],
};

export default function UsersPage({ users, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const createUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const f = new FormData(e.target);
    try {
      const res = await fetch(`${API}/api/users`, {
        method:'POST', headers:headers(),
        body:JSON.stringify({ name:f.get('name'), email:f.get('email'), password:f.get('password'), role:f.get('role') })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      setShowModal(false); onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Remove this user?')) return;
    try { await fetch(`${API}/api/users/${id}`, { method:'DELETE', headers:headers() }); onRefresh(); } catch {}
  };

  const approveUser = async (id) => {
    try { 
      const res = await fetch(`${API}/api/users/${id}/approve`, { method:'PATCH', headers:headers() }); 
      if (res.ok) onRefresh();
    } catch {}
  };

  return (
    <div className="fade-in">
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add User</div>
              <button className="btn-icon" onClick={()=>setShowModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={createUser} className="modal-body">
              <div className="form-group"><label>Full Name</label><input name="name" className="form-input" required /></div>
              <div className="form-group"><label>Email</label><input name="email" type="email" className="form-input" required /></div>
              <div className="form-group"><label>Password</label><input name="password" type="password" className="form-input" minLength={6} required /></div>
              <div className="form-group"><label>Role</label>
                <select name="role" className="form-input" onChange={e=>setSelectedRole(e.target.value)} defaultValue="CASHIER">
                  {ROLES.map(r=><option key={r} value={r}>{r.replace('_',' ')}</option>)}
                </select>
              </div>
              {selectedRole && (
                <div style={{background:'var(--accent-bg)',border:'1px solid var(--accent-border)',borderRadius:10,padding:12}}>
                  <div className="text-xs font-bold mb-8">Permissions for {selectedRole}:</div>
                  <div className="flex" style={{flexWrap:'wrap',gap:6}}>
                    {(PERMISSIONS[selectedRole]||[]).map(p=>(
                      <span key={p} className="badge badge-lime"><Check size={10}/>{p}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)} disabled={isSaving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSaving && <Loader size={16} className="spin" />}
                  {isSaving ? 'Proceeding...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title"><Users size={20}/>Users & Role Management</div>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowModal(true)}><Plus size={14}/>Add User</button>
      </div>

      {/* RBAC Role overview */}
      <div className="glass-card mb-20">
        <div className="card-title mb-16"><Shield size={16}/>Role-Based Access Control (RBAC)</div>
        <div className="flex" style={{flexWrap:'wrap',gap:10}}>
          {ROLES.map(r=>(
            <div key={r} style={{
              background:'var(--bg-input)',border:'1px solid var(--border-color)',
              borderRadius:10,padding:'10px 14px',minWidth:140
            }}>
              <div className="flex items-center gap-8 mb-6">
                <span className={`badge ${ROLE_COLOR[r]||'badge-default'}`}>{r.replace('_',' ')}</span>
              </div>
              <div className="text-xs text-muted">{(PERMISSIONS[r]||[]).slice(0,2).join(' · ')}{PERMISSIONS[r]?.length>2?'…':''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="filter-bar">
        <input className="filter-input" placeholder="Search name or email…" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length ? filtered.map(u=>(
              <tr key={u.id}>
                <td style={{fontWeight:700}}>{u.name}</td>
                <td className="text-muted text-sm">{u.email}</td>
                <td><span className={`badge ${ROLE_COLOR[u.role]||'badge-default'}`}>{u.role?.replace('_',' ')}</span></td>
                <td>
                  <span className={`badge ${u.status === 'PENDING' ? 'badge-orange' : (u.isActive !== false ? 'badge-success' : 'badge-danger')}`}>
                    {u.status || (u.isActive !== false ? 'Active' : 'Inactive')}
                  </span>
                </td>
                <td className="text-muted text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-4">
                    {u.status === 'PENDING' && (
                       <button className="btn btn-primary btn-xs" style={{padding:'2px 8px'}} onClick={()=>approveUser(u.id)}>Approve</button>
                    )}
                    <button className="btn-icon" title="Edit"><Edit size={13}/></button>
                    <button className="btn-icon" title="Remove" onClick={()=>deleteUser(u.id)}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="6" className="table-empty">No users found — add your first user above</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
