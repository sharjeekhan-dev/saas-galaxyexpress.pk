import React from 'react';
import GalleryComponent from '../../../shared/GalleryComponent.jsx';
import { API, headers } from '../App.jsx';

export default function GalleryPage({ user }) {
  return (
    <div className="fade-in">
      <div className="glass-card" style={{ padding: 24, borderRadius: 20 }}>
        <GalleryComponent 
          API={API} 
          headers={headers} 
          user={user} 
        />
      </div>
      <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Cloud-native Media Management. All assets are secure and audit-logged.
      </div>
    </div>
  );
}
