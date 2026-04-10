import React, { useState, useEffect } from 'react';
import { Key, Plus, Save, Trash2, Globe, Shield, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('erp_token')}`
});

export default function ApiConfigPanel() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ service: '', keyName: '', keyValue: '', isActive: true });

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${API}/api/apikeys`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch (err) {
      console.error('Failed to fetch API configs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API}/api/apikeys`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ service: '', keyName: '', keyValue: '', isActive: true });
        fetchConfigs();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save configuration');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteConfig = async (id) => {
    if (!confirm('Are you sure you want to delete this API config?')) return;
    try {
      const res = await fetch(`${API}/api/apikeys/${id}`, {
        method: 'DELETE',
        headers: headers()
      });
      if (res.ok) fetchConfigs();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const toggleStatus = async (config) => {
    try {
      await fetch(`${API}/api/apikeys/${config.id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ isActive: !config.isActive })
      });
      fetchConfigs();
    } catch (err) {}
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Shield size={20} />API Configuration Hub</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add New API</button>
      </div>

      <div className="glass-card mb-20">
        <div className="card-title mb-16"><Globe size={16} /> Dynamic Integration Panel</div>
        <p className="text-muted text-sm mb-20">
          Manage your platform's external integrations here. Changes to these keys take effect immediately without code deployment.
        </p>
        
        <div className="flex gap-16" style={{ flexWrap: 'wrap' }}>
          <div className="stats-mini-card">
            <div className="label">Active APIs</div>
            <div className="value">{configs.filter(c => c.isActive).length}</div>
          </div>
          <div className="stats-mini-card">
            <div className="label">Total Services</div>
            <div className="value">{[...new Set(configs.map(c => c.service))].length}</div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Configure New API</div>
              <button className="btn-icon" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Service Name (e.g., Stripe, SendGrid, OpenAI)</label>
                <input 
                  className="form-input" 
                  required 
                  value={formData.service} 
                  onChange={e => setFormData({ ...formData, service: e.target.value.toUpperCase() })} 
                  placeholder="STRIPE"
                />
              </div>
              <div className="form-group">
                <label>Key Name (e.g., SECRET_KEY, PUBLIC_KEY)</label>
                <input 
                  className="form-input" 
                  required 
                  value={formData.keyName} 
                  onChange={e => setFormData({ ...formData, keyName: e.target.value })} 
                  placeholder="API_SECRET_KEY"
                />
              </div>
              <div className="form-group">
                <label>Key Value</label>
                <textarea 
                  className="form-input" 
                  required 
                  value={formData.keyValue} 
                  onChange={e => setFormData({ ...formData, keyValue: e.target.value })} 
                  placeholder="sk_live_..."
                  rows={3}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? <Loader className="spin" size={16} /> : <Save size={16} />}
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Key Name</th>
              <th>Key Value</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-20"><Loader className="spin" /></td></tr>
            ) : configs.length ? configs.map(config => (
              <tr key={config.id}>
                <td><span className="badge badge-purple">{config.service}</span></td>
                <td className="font-bold">{config.keyName}</td>
                <td className="text-muted text-sm">
                  <code>{config.keyValue.substring(0, 10)}****************</code>
                </td>
                <td>
                  <button 
                    onClick={() => toggleStatus(config)}
                    className={`badge ${config.isActive ? 'badge-success' : 'badge-default'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {config.isActive ? <CheckCircle size={10} style={{ marginRight: 4 }} /> : <AlertCircle size={10} style={{ marginRight: 4 }} />}
                    {config.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="text-muted text-sm">{new Date(config.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-8">
                     <button className="btn-icon text-danger" onClick={() => deleteConfig(config.id)}><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="table-empty">No API configurations found. Add one to begin dynamic integration.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
