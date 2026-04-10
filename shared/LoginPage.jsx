import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Mail, Phone, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage({ title, subtitle, icon, onSuccess, allowedRoles }) {
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials = {
        email: loginMethod === 'email' ? email : undefined,
        phone: loginMethod === 'phone' ? phone : undefined,
        password
      };

      const user = await login(credentials);
      
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
        throw new Error('Access denied: Unauthorized role');
      }

      if (onSuccess) onSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ 
      background: 'radial-gradient(circle at top left, #050906, #000000)',
      height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: "'Inter', sans-serif", color: '#fff', overflow: 'hidden'
    }}>
      <div className="login-container" style={{
        width: 400, padding: 40, borderRadius: 32, 
        background: 'rgba(15, 25, 17, 0.7)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(57, 255, 20, 0.15)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div className="login-brand" style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className="login-brand-icon" style={{
            width: 64, height: 64, margin: '0 auto 16px', background: 'linear-gradient(135deg, #39FF14 0%, #1E4023 100%)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(57, 255, 20, 0.3)', color: '#000', fontSize: '2rem'
          }}>
            {icon || '⚡'}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#fff' }}>{title || 'Galaxy Express'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8, fontSize: '0.9rem' }}>{subtitle || 'Secure Enterprise Node'}</p>
        </div>

        {error && <div className="login-error" style={{
          padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
          borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 24,
          fontSize: '0.85rem', fontWeight: 700, textAlign: 'center'
        }}>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', color: '#39FF14', fontSize: '0.7rem', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{loginMethod === 'email' ? 'Root Email' : 'Console Phone'}</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="form-input" 
                type={loginMethod === 'email' ? 'email' : 'text'} 
                placeholder={loginMethod === 'email' ? "Enter your email" : "Enter phone number"}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: 12, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem', outline: 'none'
                }}
                value={loginMethod === 'email' ? email : phone} 
                onChange={e => loginMethod === 'email' ? setEmail(e.target.value) : setPhone(e.target.value)} 
                required 
                autoComplete="off"
                spellCheck="false"
              />
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                {loginMethod === 'email' ? <Mail size={18} /> : <Phone size={18} />}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', color: '#39FF14', fontSize: '0.7rem', fontWeight: 800, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Security Key</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="form-input" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: 12, background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem', outline: 'none'
                }}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                autoComplete="new-password"
              />
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                <Lock size={18} />
              </div>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading} style={{
            width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #39FF14 0%, #1E4023 100%)',
            color: '#000', fontWeight: 900, border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            boxShadow: '0 8px 24px rgba(57, 255, 20, 0.3)', fontSize: '1rem'
          }}>
            {loading ? 'AUTHENTICATING...' : 'INITIALIZE SYSTEM →'}
          </button>
          
          <button 
            type="button"
            onClick={() => setLoginMethod(loginMethod === 'email' ? 'phone' : 'email')}
            style={{
              width: '100%', marginTop: 16, padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.6)', fontWeight: 700, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            SWITCH TO {loginMethod === 'email' ? 'PHONE' : 'EMAIL'} LOGIN
          </button>
        </form>

        <div className="login-footer" style={{ textAlign: 'center', marginTop: 32, color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
            <ShieldCheck size={14} color="#39FF14" />
            <span style={{ color: '#39FF14', fontWeight: 800 }}>SECURE CONNECTION ACTIVE</span>
          </div>
          Restricted Access · Galaxy Express v3.2 Production
        </div>
      </div>
    </div>
  );
}
