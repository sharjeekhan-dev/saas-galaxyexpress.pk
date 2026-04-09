import React, { useState } from 'react';
import { Clock, Calendar, AlertCircle, HelpCircle, Save } from 'lucide-react';

export default function OpeningTimes() {
  const [schedule, setSchedule] = useState([
    { day: 'Monday', open: '10:00 AM', close: '11:00 PM', status: 'Open' },
    { day: 'Tuesday', open: '10:00 AM', close: '11:00 PM', status: 'Open' },
    { day: 'Wednesday', open: '10:00 AM', close: '11:00 PM', status: 'Open' },
    { day: 'Thursday', open: '10:00 AM', close: '11:00 PM', status: 'Open' },
    { day: 'Friday', open: '03:00 PM', close: '12:00 AM', status: 'Open' },
    { day: 'Saturday', open: '10:00 AM', close: '12:00 AM', status: 'Open' },
    { day: 'Sunday', open: '10:00 AM', close: '11:00 PM', status: 'Open' },
  ]);

  return (
    <div className="fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title"><Clock size={20} /> Opening Times</h2>
          <p className="text-muted text-sm">Set your regular and special operating schedules</p>
        </div>
        <button className="btn btn-primary">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid-2">
        <div className="glass-card" style={{ padding: 32 }}>
          <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>Regular schedule</h3>
          <table style={{ background: 'transparent' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '12px 16px' }}>DAY</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
                <th style={{ padding: '12px 16px' }}>OPENING TIME</th>
                <th style={{ padding: '12px 16px' }}>CLOSING TIME</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map(s => (
                <tr key={s.day}>
                  <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{s.day}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <div className={`toggle ${s.status === 'Open' ? 'active' : ''}`}></div>
                       <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select className="form-input" style={{ padding: '8px 12px' }}>
                      <option>{s.open}</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select className="form-input" style={{ padding: '8px 12px' }}>
                      <option>{s.close}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
             <Calendar size={32} color="var(--accent)" style={{ marginBottom: 16 }} />
             <h4 style={{ margin: '0 0 8px 0' }}>Special schedule</h4>
             <p className="text-muted text-sm" style={{ lineHeight: 1.5 }}>Use this for holidays or special events when your branch has different timings.</p>
             <button className="btn btn-outline w-full" style={{ marginTop: 20 }}>Add special date</button>
          </div>

          <div className="badge badge-lime" style={{ padding: 20, whiteSpace: 'normal', lineHeight: 1.5 }}>
            <strong>Need Help?</strong><br />
            Timings are automatically synced with the customer app. Changes may take up to 5 minutes to reflect.
          </div>
        </div>
      </div>
    </div>
  );
}
