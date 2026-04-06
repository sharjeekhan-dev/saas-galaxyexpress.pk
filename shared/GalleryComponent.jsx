import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Search, Filter, X, RefreshCw, CheckCircle, Globe, Lock } from 'lucide-react';

export default function GalleryComponent({ API, headers, user }) {
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const h = typeof headers === 'function' ? headers() : headers;
      const res = await fetch(`${API}/api/gallery`, { headers: h });
      const data = await res.json();
      if (Array.isArray(data)) setMedia(data);
    } catch (e) { console.error('Gallery fetch error', e); }
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const fd = new FormData(e.target);
    const payload = {
      url: fd.get('url'),
      category: fd.get('category') || 'UNCATEGORIZED',
      isPublic: fd.get('isPublic') === 'on',
      type: 'IMAGE'
    };

    try {
      const h = typeof headers === 'function' ? headers() : headers;
      const res = await fetch(`${API}/api/gallery`, {
        method: 'POST',
        headers: h,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setUploadModal(false);
        fetchMedia();
      } else { alert('Upload failed'); }
    } catch (e) { console.error(e); }
    setIsUploading(false);
  };

  const togglePublic = async (id, currentStatus) => {
    if (user.role !== 'SUPER_ADMIN') return;
    try {
      const h = typeof headers === 'function' ? headers() : headers;
      const res = await fetch(`${API}/api/gallery/${id}/public`, {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify({ isPublic: !currentStatus })
      });
      if (res.ok) fetchMedia();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanent delete this item?')) return;
    try {
      const h = typeof headers === 'function' ? headers() : headers;
      const res = await fetch(`${API}/api/gallery/${id}`, { method: 'DELETE', headers: h });
      if (res.ok) fetchMedia();
    } catch (e) { console.error(e); }
  };

  const filtered = media.filter(m => {
    const matchesSearch = (m.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || m.category === filter;
    return matchesSearch && matchesFilter;
  });

  const categories = ['ALL', ...new Set(media.map(m => m.category))];

  return (
    <div className="gallery-container">
      <div className="section-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}><ImageIcon size={20}/> <h2 style={{margin:0}}>Media Management</h2></div>
        <button onClick={() => setUploadModal(true)} style={{background:'#39FF14', color:'#000', padding:'8px 16px', borderRadius:8, border:'none', fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:6}}><Upload size={16}/> Cloud Upload</button>
      </div>

      <div className="glass-card mb-20" style={{padding:16, display:'flex', gap:16, alignItems:'center', flexWrap:'wrap'}}>
        <div style={{flex:1, position:'relative'}}>
          <Search size={16} style={{position:'absolute', left:12, top:10, opacity:0.5}} />
          <input className="form-input" style={{paddingLeft:40, width:'100%'}} placeholder="Search in categories..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{display:'flex', gap:4}}>
          {categories.slice(0,6).map(c => (
            <button key={c} onClick={()=>setFilter(c)} style={{
              background: filter===c ? '#39FF14' : 'rgba(255,255,255,0.05)',
              color: filter===c ? '#000' : 'inherit',
              padding:'6px 12px', borderRadius:16, border:'none', fontSize:'0.75rem', fontWeight:700, cursor:'pointer'
            }}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? <div style={{textAlign:'center', padding:40}}><RefreshCw size={32} className="spin" color="#8de02c"/></div> : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:16}}>
          {filtered.map(item => (
            <div key={item.id} style={{background:'rgba(0,0,0,0.2)', borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.05)', position:'relative', height:200}} className="gallery-item group">
              <img src={item.url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt={item.category} />
              
              <div style={{position:'absolute', top:8, right:8, display:'flex', gap:4}}>
                 {user.role === 'SUPER_ADMIN' && (
                    <button onClick={() => togglePublic(item.id, item.isPublic)} style={{
                      background: item.isPublic ? '#8de02c' : 'rgba(0,0,0,0.5)',
                      color: item.isPublic ? '#000' : '#fff',
                      padding:4, borderRadius:4, border:'none'
                    }}>{item.isPublic ? <Globe size={12}/> : <Lock size={12}/>}</button>
                 )}
                 {(user.role === 'SUPER_ADMIN' || item.userId === user.id) && (
                    <button onClick={() => handleDelete(item.id)} style={{background:'rgba(239,68,68,0.7)', color:'#fff', padding:4, borderRadius:4, border:'none'}}><Trash2 size={12}/></button>
                 )}
              </div>

              <div style={{
                position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent, rgba(0,0,0,0.8))',
                padding:8, fontSize:'0.7rem'
              }}>
                <div style={{fontWeight:800, color:'#8de02c'}}>{item.category}</div>
                <div style={{opacity:0.6}}>{new Date(item.createdAt).toLocaleDateString()}</div>
                <button onClick={()=>{navigator.clipboard.writeText(item.url); alert('URL Copied!')}} style={{background:'none', border:'none', color:'cyan', cursor:'pointer', padding:0, fontSize:'0.65rem', marginTop:4}}>Copy Link</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{gridColumn:'1/-1', textAlign:'center', padding:40, color:'rgba(255,255,255,0.2)'}}>Gallery Empty. Upload your first asset.</div>}
        </div>
      )}

      {uploadModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(5px)'}}>
          <div className="glass-card" style={{width:'100%', maxWidth:400, padding:24}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
              <h3 style={{margin:0}}>Upload Media</h3>
              <X onClick={()=>setUploadModal(false)} cursor="pointer"/>
            </div>
            <form onSubmit={handleUpload} style={{display:'flex', flexDirection:'column', gap:16}}>
              <div>
                <label style={{display:'block', fontSize:'0.8rem', fontWeight:800, marginBottom:4}}>Image URL (S3 / Cloudinary)</label>
                <input required name="url" className="form-input" style={{width:'100%'}} placeholder="https://..." />
              </div>
              <div>
                <label style={{display:'block', fontSize:'0.8rem', fontWeight:800, marginBottom:4}}>Category / Folder</label>
                <input name="category" className="form-input" style={{width:'100%'}} placeholder="e.g. CATEGORIES, PRODUCTS, BANNERS" />
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <input type="checkbox" name="isPublic" id="pubchk" />
                <label htmlFor="pubchk" style={{fontSize:'0.85rem'}}>Make Public (Visible to all Vendors)</label>
              </div>
              <button disabled={isUploading} type="submit" style={{
                background:'#39FF14', color:'#000', padding:12, borderRadius:8, border:'none', fontWeight:900, cursor:'pointer', marginTop:10
              }}>
                {isUploading ? <RefreshCw className="spin" size={16}/> : 'POST TO CLOUD'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
