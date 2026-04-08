import React from 'react';
import GalleryComponent from '../../../../shared/GalleryComponent.jsx';
import { API } from '../../App.jsx';

export default function GalleryPage({ currentUser }) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('erp_token')}`
  };

  return (
    <div style={{ padding: 24, borderRadius: 20 }}>
      <GalleryComponent 
        API={API} 
        headers={headers} 
        user={currentUser} 
      />
    </div>
  );
}
