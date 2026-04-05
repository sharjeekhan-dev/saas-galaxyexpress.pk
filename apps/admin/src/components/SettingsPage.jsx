import React, { useState } from 'react';
import { Settings, Image, Moon, Sun, Globe, Shield, Bell, Percent, UploadCloud, Plus, X, Check } from 'lucide-react';

const TABS = [
  { id:'branding', label:'Branding & Logo', icon:Image },
  { id:'theme',    label:'Theme & Colors',  icon:Moon },
  { id:'general',  label:'General',         icon:Settings },
  { id:'payments', label:'Payments',        icon:Shield },
  { id:'trans',    label:'Translations',    icon:Globe },
  { id:'notif',    label:'Notifications',   icon:Bell },
  { id:'tax',      label:'Tax & Fees',      icon:Percent },
];

const TRANSLATIONS = {
  welcome:  { en:'Welcome',   ur:'خوش آمدید',    ar:'مرحباً' },
  orders:   { en:'Orders',    ur:'احکامات',       ar:'الطلبات' },
  settings: { en:'Settings',  ur:'ترتیبات',      ar:'الإعدادات' },
  total:    { en:'Total',     ur:'کُل رقم',       ar:'المجموع' },
  checkout: { en:'Checkout',  ur:'ادائیگی',      ar:'الدفع' },
};

export default function SettingsPage() {
  const [tab, setTab] = useState('branding');
  const [lang, setLang] = useState('ur');
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  return (
    <div className="fade-in">
      <div className="section-header">
        <div className="section-title"><Settings size={20}/>Platform Settings</div>
        {saved && <span className="badge badge-success"><Check size={12}/>Saved!</span>}
      </div>

      <div className="grid-2" style={{gridTemplateColumns:'220px 1fr',alignItems:'start'}}>
        {/* Left nav */}
        <div className="glass-card p-0" style={{padding:0}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border-color)',fontWeight:700,fontSize:'0.85rem'}}>
            Configuration
          </div>
          {TABS.map(t=>(
            <div key={t.id}
              className={`nav-item ${tab===t.id?'active':''}`}
              style={{borderRadius:0,padding:'11px 16px'}}
              onClick={()=>setTab(t.id)}
            >
              <t.icon size={15}/>{t.label}
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="glass-card">
          {tab==='branding' && (
            <div className="fade-in">
              <h3 style={{marginBottom:20}}>Brand Identity</h3>
              <div className="grid-2 mb-20">
                {['Platform Logo (Light)','Platform Logo (Dark)','Favicon','Invoice Logo'].map(label=>(
                  <div key={label}>
                    <div className="text-sm font-bold mb-8">{label}</div>
                    <div style={{border:'2px dashed var(--border-color)',borderRadius:10,padding:24,textAlign:'center',cursor:'pointer',transition:'all 0.2s'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-color)'}>
                      <UploadCloud size={26} color="var(--text-muted)" style={{marginBottom:8,display:'block',margin:'0 auto 8px'}}/>
                      <div className="text-sm text-muted">Click or drag to upload</div>
                    </div>
                  </div>
                ))}
              </div>
              <h3 style={{marginBottom:16}}>Master Image Gallery</h3>
              <p className="text-muted text-sm mb-16">Upload master assets used across POS, KDS, and Customer app.</p>
              <div className="grid-4">
                {[1,2,3,4,5].map(i=>(
                  <div key={i} style={{height:100,background:'var(--bg-input)',borderRadius:8,border:'1px solid var(--border-color)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    <Image size={22} color="var(--text-muted)"/>
                    <button style={{position:'absolute',top:4,right:4,width:20,height:20,background:'rgba(239,68,68,0.8)',border:'none',borderRadius:4,color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <X size={11}/>
                    </button>
                  </div>
                ))}
                <div style={{height:100,border:'2px dashed var(--accent)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--accent-dark)',cursor:'pointer',flexDirection:'column',gap:4}}>
                  <Plus size={18}/><div className="text-xs font-bold">Add Media</div>
                </div>
              </div>
              <button className="btn btn-primary mt-20" onClick={save}>Save Branding</button>
            </div>
          )}

          {tab==='theme' && (
            <div className="fade-in">
              <h3 style={{marginBottom:20}}>Theme & Color Scheme</h3>
              <div className="form-group mb-16">
                <label>Primary Accent Color</label>
                <div className="flex gap-12 items-center">
                  <input type="color" defaultValue="#8de02c" style={{width:44,height:44,borderRadius:8,cursor:'pointer',border:'1px solid var(--border-color)',padding:2}}/>
                  <input type="text" className="form-input" defaultValue="#8de02c" style={{flex:1}}/>
                </div>
              </div>
              <div className="form-group mb-20">
                <label>Secondary Color</label>
                <div className="flex gap-12 items-center">
                  <input type="color" defaultValue="#0ea5e9" style={{width:44,height:44,borderRadius:8,cursor:'pointer',border:'1px solid var(--border-color)',padding:2}}/>
                  <input type="text" className="form-input" defaultValue="#0ea5e9" style={{flex:1}}/>
                </div>
              </div>
              <div className="form-group mb-20">
                <label>Default Mode</label>
                <div className="flex gap-12">
                  <button className="btn btn-outline" style={{flex:1,justifyContent:'center'}}><Sun size={14}/>Light Mode</button>
                  <button className="btn btn-primary" style={{flex:1,justifyContent:'center'}}><Moon size={14}/>Dark Mode</button>
                </div>
              </div>
              <button className="btn btn-primary" onClick={save}>Apply Theme</button>
            </div>
          )}

          {tab==='general' && (
            <div className="fade-in">
              <h3 style={{marginBottom:20}}>General Settings</h3>
              <div className="form-group mb-16"><label>Platform Name</label><input className="form-input" defaultValue="GalaxyExpress SaaS"/></div>
              <div className="form-group mb-16"><label>Contact Email</label><input type="email" className="form-input" defaultValue="admin@galaxyexpress.pk"/></div>
              <div className="form-group mb-16"><label>Support WhatsApp</label><input className="form-input" defaultValue="+92 300 1234567"/></div>
              <div className="form-group mb-16"><label>Default Currency</label>
                <select className="form-input"><option>PKR — Pakistani Rupee</option><option>USD — US Dollar</option><option>AED — UAE Dirham</option></select>
              </div>
              <div className="form-group mb-20"><label>Default Language</label>
                <select className="form-input"><option>English (EN)</option><option>Urdu (UR)</option><option>Arabic (AR)</option></select>
              </div>
              <button className="btn btn-primary" onClick={save}>Save Settings</button>
            </div>
          )}

          {tab==='payments' && (
            <div className="fade-in">
              <h3 style={{marginBottom:20}}>Payment Gateways</h3>
              {[
                { name:'Stripe (International)', enabled:true, key:'sk_live_••••••' },
                { name:'GoPayFast (Pakistan)', enabled:true, key:'gpf_live_••••••' },
                { name:'Cash on Delivery', enabled:true, key:null },
                { name:'JazzCash', enabled:false, key:null },
                { name:'Easypaisa', enabled:false, key:null },
              ].map((gw,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:'1px solid var(--border-color)'}}>
                  <div>
                    <div style={{fontWeight:600}}>{gw.name}</div>
                    {gw.key && <div className="text-xs text-muted">{gw.key}</div>}
                  </div>
                  <span className={`badge ${gw.enabled?'badge-success':'badge-default'}`}>{gw.enabled?'Enabled':'Disabled'}</span>
                </div>
              ))}
              <button className="btn btn-primary mt-20" onClick={save}>Save Gateways</button>
            </div>
          )}

          {tab==='trans' && (
            <div className="fade-in">
              <div className="flex justify-between items-center mb-16">
                <h3>Translations</h3>
                <select className="form-input" style={{width:140}} value={lang} onChange={e=>setLang(e.target.value)}>
                  <option value="ur">Urdu (اردو)</option>
                  <option value="ar">Arabic (العربية)</option>
                </select>
              </div>
              <div className="table-wrapper" style={{border:'none',borderRadius:0}}>
                <table>
                  <thead><tr><th>Key</th><th>English</th><th>{lang==='ur'?'Urdu':'Arabic'}</th><th>Action</th></tr></thead>
                  <tbody>
                    {Object.entries(TRANSLATIONS).map(([key,vals])=>(
                      <tr key={key}>
                        <td style={{fontFamily:'monospace',fontWeight:600}}>{key}</td>
                        <td className="text-muted">{vals.en}</td>
                        <td><input type="text" className="form-input" defaultValue={vals[lang]} style={{minWidth:160,padding:'6px 10px'}}/></td>
                        <td><button className="btn btn-sm btn-outline" onClick={save}>Save</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab==='notif' && (
            <div className="fade-in">
              <h3 style={{marginBottom:20}}>Notification Settings</h3>
              {[
                { label:'New Order Alert', desc:'Notify staff when new order arrives', on:true },
                { label:'Low Stock Alert', desc:'Notify when items fall below threshold', on:true },
                { label:'Rider Offline Alert', desc:'Notify when rider goes offline', on:false },
                { label:'Daily Report Email', desc:'Send daily summary to admin email', on:true },
                { label:'Vendor Payout Reminder', desc:'Weekly payout reminders', on:true },
              ].map((n,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:'1px solid var(--border-color)'}}>
                  <div>
                    <div style={{fontWeight:600}}>{n.label}</div>
                    <div className="text-xs text-muted">{n.desc}</div>
                  </div>
                  <button className={`toggle ${n.on?'active':''}`}></button>
                </div>
              ))}
              <button className="btn btn-primary mt-20" onClick={save}>Save Preferences</button>
            </div>
          )}

          {tab==='tax' && (
            <div className="fade-in">
              <h3 style={{marginBottom:20}}>Tax & Fee Configuration</h3>
              <div className="form-group mb-16"><label>Default Tax Rate (%)</label><input type="number" className="form-input" defaultValue="5" step="0.1" min="0"/></div>
              <div className="form-group mb-16"><label>Service Charge (%)</label><input type="number" className="form-input" defaultValue="2.5" step="0.1" min="0"/></div>
              <div className="form-group mb-16"><label>Delivery Fee (Base)</label><input type="number" className="form-input" defaultValue="50" min="0"/></div>
              <div className="form-group mb-20"><label>Tax Label</label><input className="form-input" defaultValue="GST (5%)"/></div>
              <button className="btn btn-primary" onClick={save}>Save Tax Settings</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
