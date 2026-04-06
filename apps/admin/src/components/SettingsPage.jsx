import React, { useState } from 'react';
import { Settings, Image, Moon, Sun, Globe, Shield, Bell, Percent, UploadCloud, Plus, X, Check, Edit, Trash2, Search, Save, Languages, Key } from 'lucide-react';

const TABS = [
  { id:'branding', label:'Branding & Logo', icon:Image },
  { id:'theme',    label:'Theme & Colors',  icon:Moon },
  { id:'general',  label:'General',         icon:Settings },
  { id:'payments', label:'Payments',        icon:Shield },
  { id:'apikeys',  label:'API & Integrations', icon:Key },
  { id:'trans',    label:'Translations',    icon:Globe },
  { id:'notif',    label:'Notifications',   icon:Bell },
  { id:'tax',      label:'Tax & Fees',      icon:Percent },
];

// Complete platform translation keys covering all modules
const DEFAULT_TRANSLATIONS = [
  // General
  { key: 'welcome', en: 'Welcome', ur: 'خوش آمدید', ar: 'مرحباً', group: 'General' },
  { key: 'login', en: 'Login', ur: 'لاگ ان', ar: 'تسجيل الدخول', group: 'General' },
  { key: 'logout', en: 'Logout', ur: 'لاگ آؤٹ', ar: 'تسجيل الخروج', group: 'General' },
  { key: 'dashboard', en: 'Dashboard', ur: 'ڈیش بورڈ', ar: 'لوحة القيادة', group: 'General' },
  { key: 'settings', en: 'Settings', ur: 'ترتیبات', ar: 'الإعدادات', group: 'General' },
  { key: 'search', en: 'Search', ur: 'تلاش', ar: 'بحث', group: 'General' },
  { key: 'save', en: 'Save', ur: 'محفوظ کریں', ar: 'حفظ', group: 'General' },
  { key: 'cancel', en: 'Cancel', ur: 'منسوخ', ar: 'إلغاء', group: 'General' },
  { key: 'delete', en: 'Delete', ur: 'حذف کریں', ar: 'حذف', group: 'General' },
  { key: 'edit', en: 'Edit', ur: 'ترمیم', ar: 'تعديل', group: 'General' },
  { key: 'add_new', en: 'Add New', ur: 'نیا شامل کریں', ar: 'إضافة جديد', group: 'General' },
  { key: 'loading', en: 'Loading...', ur: 'لوڈ ہو رہا ہے...', ar: 'جار التحميل...', group: 'General' },
  { key: 'no_data', en: 'No data found', ur: 'کوئی ڈیٹا نہیں ملا', ar: 'لا توجد بيانات', group: 'General' },

  // Orders & POS
  { key: 'orders', en: 'Orders', ur: 'آرڈرز', ar: 'الطلبات', group: 'Orders' },
  { key: 'new_order', en: 'New Order', ur: 'نیا آرڈر', ar: 'طلب جديد', group: 'Orders' },
  { key: 'pending', en: 'Pending', ur: 'زیر التواء', ar: 'قيد الانتظار', group: 'Orders' },
  { key: 'preparing', en: 'Preparing', ur: 'تیاری میں', ar: 'قيد التحضير', group: 'Orders' },
  { key: 'delivered', en: 'Delivered', ur: 'ڈیلیور ہو گیا', ar: 'تم التوصيل', group: 'Orders' },
  { key: 'cancelled', en: 'Cancelled', ur: 'منسوخ', ar: 'ملغى', group: 'Orders' },
  { key: 'total', en: 'Total', ur: 'کل رقم', ar: 'المجموع', group: 'Orders' },
  { key: 'subtotal', en: 'Subtotal', ur: 'ذیلی کل', ar: 'المجموع الفرعي', group: 'Orders' },
  { key: 'tax', en: 'Tax', ur: 'ٹیکس', ar: 'ضريبة', group: 'Orders' },
  { key: 'discount', en: 'Discount', ur: 'رعایت', ar: 'خصم', group: 'Orders' },
  { key: 'checkout', en: 'Checkout', ur: 'ادائیگی', ar: 'الدفع', group: 'Orders' },
  { key: 'place_order', en: 'Place Order', ur: 'آرڈر دیں', ar: 'تقديم الطلب', group: 'Orders' },
  { key: 'dine_in', en: 'Dine In', ur: 'ڈائن ان', ar: 'تناول في المكان', group: 'Orders' },
  { key: 'takeaway', en: 'Takeaway', ur: 'ٹیک ایوے', ar: 'طلب خارجي', group: 'Orders' },
  { key: 'delivery', en: 'Delivery', ur: 'ڈیلیوری', ar: 'توصيل', group: 'Orders' },
  { key: 'cash', en: 'Cash', ur: 'نقد', ar: 'نقداً', group: 'Orders' },
  { key: 'card', en: 'Card', ur: 'کارڈ', ar: 'بطاقة', group: 'Orders' },

  // Products
  { key: 'products', en: 'Products', ur: 'پروڈکٹس', ar: 'المنتجات', group: 'Products' },
  { key: 'categories', en: 'Categories', ur: 'اقسام', ar: 'الفئات', group: 'Products' },
  { key: 'price', en: 'Price', ur: 'قیمت', ar: 'السعر', group: 'Products' },
  { key: 'in_stock', en: 'In Stock', ur: 'دستیاب', ar: 'متوفر', group: 'Products' },
  { key: 'out_of_stock', en: 'Out of Stock', ur: 'نادستیاب', ar: 'غير متوفر', group: 'Products' },
  { key: 'inventory', en: 'Inventory', ur: 'انوینٹری', ar: 'المخزون', group: 'Products' },

  // Users
  { key: 'users', en: 'Users', ur: 'صارفین', ar: 'المستخدمين', group: 'Users' },
  { key: 'vendors', en: 'Vendors', ur: 'وینڈرز', ar: 'البائعين', group: 'Users' },
  { key: 'riders', en: 'Riders', ur: 'رائیڈرز', ar: 'السائقين', group: 'Users' },
  { key: 'customers', en: 'Customers', ur: 'گاہک', ar: 'العملاء', group: 'Users' },

  // Finance
  { key: 'revenue', en: 'Revenue', ur: 'آمدنی', ar: 'الإيرادات', group: 'Finance' },
  { key: 'invoices', en: 'Invoices', ur: 'انوائسز', ar: 'الفواتير', group: 'Finance' },
  { key: 'payments', en: 'Payments', ur: 'ادائیگی', ar: 'المدفوعات', group: 'Finance' },
  { key: 'wallets', en: 'Wallets', ur: 'والٹ', ar: 'المحفظة', group: 'Finance' },
  { key: 'reports', en: 'Reports', ur: 'رپورٹس', ar: 'التقارير', group: 'Finance' },
  { key: 'commissions', en: 'Commissions', ur: 'کمیشن', ar: 'العمولات', group: 'Finance' },
  { key: 'paid', en: 'Paid', ur: 'ادا شدہ', ar: 'مدفوع', group: 'Finance' },
  { key: 'unpaid', en: 'Unpaid', ur: 'غیر ادا شدہ', ar: 'غير مدفوع', group: 'Finance' },

  // Notifications
  { key: 'notifications', en: 'Notifications', ur: 'اطلاعات', ar: 'الإشعارات', group: 'Notifications' },
  { key: 'new_order_alert', en: 'New Order Alert', ur: 'نئے آرڈر کی اطلاع', ar: 'تنبيه طلب جديد', group: 'Notifications' },
  { key: 'low_stock_alert', en: 'Low Stock Alert', ur: 'کم اسٹاک کی اطلاع', ar: 'تنبيه مخزون منخفض', group: 'Notifications' },

  // Kitchen & KDS
  { key: 'kitchen', en: 'Kitchen', ur: 'باورچی خانہ', ar: 'المطبخ', group: 'Kitchen' },
  { key: 'ready', en: 'Ready', ur: 'تیار', ar: 'جاهز', group: 'Kitchen' },
  { key: 'cooking', en: 'Cooking', ur: 'پک رہا ہے', ar: 'قيد الطهي', group: 'Kitchen' },
  { key: 'mark_ready', en: 'Mark as Ready', ur: 'تیار نشان لگائیں', ar: 'وضع علامة جاهز', group: 'Kitchen' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('branding');
  const [lang, setLang] = useState('ur');
  const [saved, setSaved] = useState(false);
  const [translations, setTranslations] = useState(DEFAULT_TRANSLATIONS);
  const [transSearch, setTransSearch] = useState('');
  const [transGroup, setTransGroup] = useState('All');
  const [showAddKey, setShowAddKey] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newKey, setNewKey] = useState({ key: '', en: '', ur: '', ar: '', group: 'General' });
  const [editValues, setEditValues] = useState({});

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 2000); };

  const transGroups = ['All', ...new Set(translations.map(t => t.group))];
  const filteredTrans = translations.filter(t => {
    const matchGroup = transGroup === 'All' || t.group === transGroup;
    const matchSearch = !transSearch || t.key.toLowerCase().includes(transSearch.toLowerCase()) || t.en.toLowerCase().includes(transSearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  const addTranslationKey = () => {
    if (!newKey.key.trim() || !newKey.en.trim()) return;
    if (translations.find(t => t.key === newKey.key)) { alert('Key already exists!'); return; }
    setTranslations(prev => [...prev, { ...newKey }]);
    setNewKey({ key: '', en: '', ur: '', ar: '', group: 'General' });
    setShowAddKey(false);
    save();
  };

  const deleteTranslationKey = (key) => {
    if (!confirm(`Delete translation key "${key}"?`)) return;
    setTranslations(prev => prev.filter(t => t.key !== key));
  };

  const startEditing = (t) => {
    setEditingKey(t.key);
    setEditValues({ en: t.en, ur: t.ur, ar: t.ar, group: t.group });
  };

  const saveEditing = () => {
    setTranslations(prev => prev.map(t =>
      t.key === editingKey ? { ...t, ...editValues } : t
    ));
    setEditingKey(null);
    save();
  };

  const updateTransValue = (key, value) => {
    setTranslations(prev => prev.map(t =>
      t.key === key ? { ...t, [lang]: value } : t
    ));
  };

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

          {tab==='apikeys' && (
            <div className="fade-in">
              <div className="flex justify-between items-center mb-20">
                <h3 style={{margin:0}}>API & Integrations Console</h3>
                <button className="btn btn-primary" onClick={save}><Save size={14}/> Save Configurations</button>
              </div>
              <p className="text-muted text-sm mb-20">Securely manage credentials for third-party SaaS integrations. These settings propagate globally.</p>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24}}>
                <div style={{background:'var(--bg-input)', padding:20, borderRadius:12, border:'1px solid var(--border-color)'}}>
                  <h4 style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}><Shield size={16} color="var(--accent-dark)"/> Firebase Auth / DB</h4>
                  <div className="form-group mb-12"><label>API Key</label><input type="password" placeholder="AIzaSy..." className="form-input" /></div>
                  <div className="form-group mb-12"><label>Auth Domain</label><input placeholder="project.firebaseapp.com" className="form-input" /></div>
                  <div className="form-group mb-12"><label>Project ID</label><input placeholder="your-project-id" className="form-input" /></div>
                </div>

                <div style={{background:'var(--bg-input)', padding:20, borderRadius:12, border:'1px solid var(--border-color)'}}>
                  <h4 style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}><MapPin size={16} color="var(--accent-dark)"/> Google Maps</h4>
                  <div className="form-group mb-12"><label>JavaScript API Key</label><input type="password" placeholder="AIzaSy..." className="form-input" /></div>
                  <div className="form-group mb-12"><label>Distance Matrix Key</label><input type="password" placeholder="AIzaSy..." className="form-input" /></div>
                  <div className="text-xs text-muted">Required for Delivery Zones & Routing.</div>
                </div>

                <div style={{background:'var(--bg-input)', padding:20, borderRadius:12, border:'1px solid var(--border-color)'}}>
                  <h4 style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}><MessageCircle size={16} color="var(--accent-dark)"/> WhatsApp Cloud API</h4>
                  <div className="form-group mb-12"><label>Permanent Access Token</label><input type="password" placeholder="EAAI..." className="form-input" /></div>
                  <div className="form-group mb-12"><label>Phone Number ID</label><input placeholder="1049..." className="form-input" /></div>
                  <div className="form-group mb-12"><label>WABA ID</label><input placeholder="Business Account ID" className="form-input" /></div>
                </div>

                <div style={{background:'var(--bg-input)', padding:20, borderRadius:12, border:'1px solid var(--border-color)'}}>
                  <h4 style={{marginBottom:16, display:'flex', alignItems:'center', gap:8}}><Globe size={16} color="var(--accent-dark)"/> Email SMTP (SendGrid)</h4>
                  <div className="form-group mb-12"><label>SMTP Host</label><input defaultValue="smtp.sendgrid.net" className="form-input" /></div>
                  <div className="form-group mb-12"><label>SMTP Port</label><input defaultValue="587" className="form-input" /></div>
                  <div className="form-group mb-12"><label>API Key / Password</label><input type="password" placeholder="SG.xxxx" className="form-input" /></div>
                </div>
              </div>
            </div>
          )}

          {tab==='trans' && (
            <div className="fade-in">
              {/* Header with stats */}
              <div className="flex justify-between items-center mb-20">
                <div>
                  <h3 style={{marginBottom:4,display:'flex',alignItems:'center',gap:8}}><Languages size={20}/>Platform Translations</h3>
                  <p className="text-muted text-sm">{translations.length} keys across {transGroups.length - 1} groups</p>
                </div>
                <div className="flex gap-8">
                  <select className="form-input" style={{width:150}} value={lang} onChange={e=>setLang(e.target.value)}>
                    <option value="ur">Urdu (اردو)</option>
                    <option value="ar">Arabic (العربية)</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={()=>setShowAddKey(true)}>
                    <Plus size={14}/> Add Key
                  </button>
                </div>
              </div>

              {/* Add new key modal */}
              {showAddKey && (
                <div style={{background:'var(--bg-input)',border:'1px solid var(--accent)',borderRadius:'var(--radius-md)',padding:20,marginBottom:20,animation:'fadeIn 0.2s'}}>
                  <div className="flex justify-between items-center mb-12">
                    <div className="font-bold">Add New Translation Key</div>
                    <button className="btn-icon" onClick={()=>setShowAddKey(false)}><X size={14}/></button>
                  </div>
                  <div className="grid-2 mb-12" style={{gap:10}}>
                    <div className="form-group">
                      <label>Key Identifier</label>
                      <input className="form-input" placeholder="e.g. my_new_key" value={newKey.key} onChange={e=>setNewKey({...newKey,key:e.target.value.toLowerCase().replace(/\s/g,'_')})}/>
                    </div>
                    <div className="form-group">
                      <label>Group</label>
                      <select className="form-input" value={newKey.group} onChange={e=>setNewKey({...newKey,group:e.target.value})}>
                        {['General','Orders','Products','Users','Finance','Kitchen','Notifications','Custom'].map(g=>(
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>English (Default)</label>
                      <input className="form-input" placeholder="English text" value={newKey.en} onChange={e=>setNewKey({...newKey,en:e.target.value})}/>
                    </div>
                    <div className="form-group">
                      <label>Urdu</label>
                      <input className="form-input" placeholder="اردو متن" value={newKey.ur} onChange={e=>setNewKey({...newKey,ur:e.target.value})} style={{direction:'rtl'}}/>
                    </div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}>
                      <label>Arabic</label>
                      <input className="form-input" placeholder="النص العربي" value={newKey.ar} onChange={e=>setNewKey({...newKey,ar:e.target.value})} style={{direction:'rtl'}}/>
                    </div>
                  </div>
                  <div className="flex gap-8 justify-between">
                    <button className="btn btn-outline" onClick={()=>setShowAddKey(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={addTranslationKey}><Check size={14}/> Add Translation</button>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex gap-10 mb-16" style={{flexWrap:'wrap'}}>
                <div style={{position:'relative',flex:1,minWidth:200}}>
                  <Search size={14} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
                  <input className="form-input" style={{paddingLeft:32}} placeholder="Search keys or values..." value={transSearch} onChange={e=>setTransSearch(e.target.value)}/>
                </div>
                <div className="flex gap-4" style={{flexWrap:'wrap'}}>
                  {transGroups.map(g=>(
                    <button key={g} className={`tab ${transGroup===g?'active':''}`} onClick={()=>setTransGroup(g)} style={{fontSize:'0.75rem'}}>
                      {g} {g!=='All' && <span style={{opacity:0.6,marginLeft:2}}>({translations.filter(t=>t.group===g).length})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Translation Table */}
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{width:40}}>#</th>
                      <th>Key</th>
                      <th>Group</th>
                      <th>English</th>
                      <th>{lang==='ur'?'Urdu (اردو)':'Arabic (العربية)'}</th>
                      <th style={{width:120}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrans.length > 0 ? filteredTrans.map((t, idx) => (
                      <tr key={t.key}>
                        <td className="text-muted text-xs">{idx + 1}</td>
                        <td>
                          {editingKey === t.key ? (
                            <input className="form-input" style={{padding:'4px 8px',fontSize:'0.82rem',fontFamily:'monospace'}} value={editValues.en ? t.key : t.key} readOnly/>
                          ) : (
                            <code style={{fontSize:'0.82rem',fontWeight:600,color:'var(--accent-dark)',background:'var(--accent-bg)',padding:'2px 6px',borderRadius:4}}>{t.key}</code>
                          )}
                        </td>
                        <td><span className="badge badge-default" style={{fontSize:'0.65rem'}}>{t.group}</span></td>
                        <td>
                          {editingKey === t.key ? (
                            <input className="form-input" style={{padding:'4px 8px',fontSize:'0.82rem'}} value={editValues.en} onChange={e=>setEditValues({...editValues,en:e.target.value})}/>
                          ) : (
                            <span style={{color:'var(--text-main)',fontWeight:500}}>{t.en}</span>
                          )}
                        </td>
                        <td>
                          {editingKey === t.key ? (
                            <input className="form-input" style={{padding:'4px 8px',fontSize:'0.82rem',direction:lang==='ar'||lang==='ur'?'rtl':'ltr'}} value={editValues[lang]} onChange={e=>setEditValues({...editValues,[lang]:e.target.value})}/>
                          ) : (
                            <input
                              type="text"
                              className="form-input"
                              value={t[lang] || ''}
                              onChange={e => updateTransValue(t.key, e.target.value)}
                              style={{padding:'4px 8px',fontSize:'0.82rem',direction:lang==='ar'||lang==='ur'?'rtl':'ltr',minWidth:140}}
                              placeholder={`Enter ${lang==='ur'?'Urdu':'Arabic'}...`}
                            />
                          )}
                        </td>
                        <td>
                          <div className="flex gap-4">
                            {editingKey === t.key ? (
                              <>
                                <button className="btn btn-sm btn-primary" onClick={saveEditing} title="Save"><Check size={12}/></button>
                                <button className="btn btn-sm btn-outline" onClick={()=>setEditingKey(null)} title="Cancel"><X size={12}/></button>
                              </>
                            ) : (
                              <>
                                <button className="btn-icon" onClick={()=>startEditing(t)} title="Edit All"><Edit size={12}/></button>
                                <button className="btn-icon" onClick={()=>deleteTranslationKey(t.key)} title="Delete" style={{color:'var(--neon-red)'}}><Trash2 size={12}/></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" className="table-empty">No translation keys found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-16">
                <div className="text-sm text-muted">{filteredTrans.length} of {translations.length} keys shown</div>
                <button className="btn btn-primary" onClick={save}><Save size={14}/> Save All Translations</button>
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
