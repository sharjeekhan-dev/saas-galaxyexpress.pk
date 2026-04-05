import React, { useState } from 'react';
import { Briefcase, UserCheck, DollarSign, Clock, Download, Eye, X, CheckCircle, Search, Calendar, FileText } from 'lucide-react';

const MOCK_APPLICATIONS = [
  { id: 'APP-101', applicant: 'Syed Ali', email: 'ali.syed@email.com', phone: '+92 300 1234567', role: 'Delivery Rider', company: 'GalaxyExpress Fleet', date: '2026-04-06', status: 'Pending', fee: 50 },
  { id: 'APP-102', applicant: 'Fatima N.', email: 'fatima@email.com', phone: '+92 321 7654321', role: 'Platform Operations Manager', company: 'GalaxyExpress (Platform)', date: '2026-04-05', status: 'Under Review', fee: 50 },
  { id: 'APP-103', applicant: 'Bilal Khan', email: 'bilal@email.com', phone: '+92 333 4567890', role: 'Assistant Chef', company: 'Pizza Palace (Vendor)', date: '2026-04-04', status: 'Approved', fee: 50 },
  { id: 'APP-104', applicant: 'Aisha Raj', email: 'aisha@email.com', phone: '+92 345 6789012', role: 'Customer Support Executive', company: 'GalaxyExpress (Platform)', date: '2026-04-02', status: 'Pending', fee: 50 },
];

export default function HRPage() {
  const [activeTab, setActiveTab] = useState('applications'); // applications | earnings | jobs
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = MOCK_APPLICATIONS.filter(a => 
    a.applicant.toLowerCase().includes(search.toLowerCase()) || 
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  const earningsFromFees = MOCK_APPLICATIONS.reduce((s, a) => s + a.fee, 0);

  return (
    <div className="fade-in">

      {/* Modal View details */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Application: {selected.id}</div>
              <button className="btn-icon" onClick={() => setSelected(null)}><X size={16}/></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 'var(--radius-sm)', marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>{selected.applicant}</div>
                <div style={{ color: 'var(--text-muted)' }}>{selected.email} • {selected.phone}</div>
              </div>
              
              <div className="grid-2" style={{ gap: 12, marginBottom: 20 }}>
                <div className="glass-card">
                  <div className="text-xs text-muted">Applied For</div>
                  <div className="font-bold">{selected.role}</div>
                </div>
                <div className="glass-card">
                  <div className="text-xs text-muted">Company / Target</div>
                  <div className="font-bold">{selected.company}</div>
                </div>
                <div className="glass-card">
                  <div className="text-xs text-muted">Date Submitted</div>
                  <div className="font-bold">{selected.date}</div>
                </div>
                <div className="glass-card">
                  <div className="text-xs text-muted">Application Fee Paid</div>
                  <div className="font-bold text-accent">PKR {selected.fee}</div>
                </div>
              </div>
              
              <div className="glass-card" style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} color="var(--neon-blue)" /> Documents Attached
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline"><Download size={14} /> Resume.pdf</button>
                  <button className="btn btn-outline"><Eye size={14} /> Photo.jpg</button>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline text-danger">Reject</button>
                <button className="btn btn-primary" onClick={() => setSelected(null)}>Approve & Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <div className="section-title"><Briefcase size={22}/> HR & Recruitment</div>
        <div className="flex gap-8">
          <button className={`btn btn-sm ${activeTab === 'applications' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('applications')}>
            Applications
          </button>
          <button className={`btn btn-sm ${activeTab === 'earnings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('earnings')}>
            Application Earnings
          </button>
        </div>
      </div>

      <div className="stat-grid mb-24">
        <div className="stat-card purple">
          <div className="stat-value">{MOCK_APPLICATIONS.length}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-value">{MOCK_APPLICATIONS.filter(a => a.status === 'Pending').length}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value">{MOCK_APPLICATIONS.filter(a => a.company.includes('Platform')).length}</div>
          <div className="stat-label">Platform Jobs</div>
        </div>
        <div className="stat-card green">
          <div className="flex items-center gap-6">
            <DollarSign size={20} />
            <div className="stat-value">PKR {earningsFromFees.toLocaleString()}</div>
          </div>
          <div className="stat-label">Total Fee Earnings</div>
        </div>
      </div>

      {activeTab === 'applications' ? (
        <>
          <div className="filter-bar">
            <input className="filter-input" placeholder="Search applicant name or role..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Applicant Name</th>
                  <th>Role Applied</th>
                  <th>Target Company</th>
                  <th>Submission Date</th>
                  <th>Fee Status</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id}>
                    <td style={{ fontWeight: 700 }}>{app.id}</td>
                    <td>
                      <div style={{ fontWeight: 800 }}>{app.applicant}</div>
                      <div className="text-xs text-muted">{app.email}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{app.role}</td>
                    <td className="text-sm">{app.company}</td>
                    <td className="text-sm"><Calendar size={12} style={{ display: 'inline', marginRight: 4 }}/>{app.date}</td>
                    <td><span className="badge badge-lime">Paid 50 PKR</span></td>
                    <td>
                      <span className={`badge ${app.status === 'Approved' ? 'badge-lime' : app.status === 'Pending' ? 'badge-orange' : 'badge-cyan'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => setSelected(app)} title="Review Application">
                        <UserCheck size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ padding: 30 }}>
          <h2 style={{ marginBottom: 20 }}>Recruitment Gateway Earnings</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 30, maxWidth: 600 }}>
            Every job application submitted through the platform is charged at a fixed processing rate of <strong>PKR 50.00</strong>. This fee directly contributes to the platform's independent revenue stream.
          </p>

          <div className="grid-3" style={{ gap: 20, marginBottom: 30 }}>
             <div style={{ background: 'var(--bg-input)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
               <div className="text-sm text-muted">Today's Forms</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-green)' }}>PKR 200</div>
             </div>
             <div style={{ background: 'var(--bg-input)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
               <div className="text-sm text-muted">This Week</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-green)' }}>PKR 1,450</div>
             </div>
             <div style={{ background: 'var(--bg-input)', padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
               <div className="text-sm text-muted">Total Lifetime Value</div>
               <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--neon-green)' }}>PKR {earningsFromFees.toLocaleString()}</div>
             </div>
          </div>

          <table style={{ width: '100%', borderRadius: 'var(--radius-md)', borderHidden: true }}>
             <thead style={{ background: 'var(--bg-card)' }}>
                <tr>
                   <th>Transaction ID</th>
                   <th>Applicant</th>
                   <th>Job Role</th>
                   <th>Amount</th>
                   <th>Gateway Status</th>
                </tr>
             </thead>
             <tbody>
                {MOCK_APPLICATIONS.map(a => (
                   <tr key={a.id}>
                      <td style={{ fontFamily: 'monospace' }}>TRX-{Math.random().toString(36).substr(2, 6).toUpperCase()}</td>
                      <td style={{ fontWeight: 600 }}>{a.applicant}</td>
                      <td>{a.role}</td>
                      <td style={{ fontWeight: 800, color: 'var(--neon-green)' }}>PKR {a.fee}.00</td>
                      <td><span className="badge badge-lime"><CheckCircle size={10} style={{marginRight:4}}/> Cleared</span></td>
                   </tr>
                ))}
             </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
