import React, { useState, useEffect } from 'react';
import gsap from 'gsap';

/**
 * Shared LoginPage component for all frontend modules.
 * Props:
 *   title: string — app name shown on login card
 *   subtitle: string — description text
 *   icon: string — emoji or text for the brand icon
 *   onSuccess: (userData) => void — called after successful login
 *   allowedRoles: string[] — optional role filter (rejects login if role doesn't match)
 *   apiBase: string — optional API base URL override
 */
export default function LoginPage({ title, subtitle, icon, onSuccess, allowedRoles, apiBase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API = apiBase || import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    gsap.fromTo('.login-card',
      { opacity: 0, y: 40, scale: 0.9, rotateX: -10 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1, ease: 'expo.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Credentials required');
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role !== 'SUPER_ADMIN' && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(data.user.role)) {
        throw new Error('Access denied: Unauthorized role for this application');
      }

      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));

      gsap.to('.login-card', {
        scale: 1.1,
        opacity: 0,
        blur: 10,
        duration: 0.5,
        onComplete: () => {
          if (onSuccess) onSuccess(data);
        }
      });
    } catch (err) {
      setError(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root" style={{ 
      background: 'radial-gradient(circle at top left, #1e1b4b, #020617, #000)',
      height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: 'Inter, system-ui, sans-serif', color: '#fff', overflow: 'hidden', position: 'relative'
    }}>
      {/* Background Decorative Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', background: 'rgba(57, 255, 20, 0.05)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '30vw', height: '30vw', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>

      <div className="login-card" style={{ 
        width: '100%', maxWidth: 420, padding: '48px 40px', borderRadius: 32, background: 'rgba(2, 8, 23, 0.7)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        zIndex: 1, position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ 
            fontSize: '3.5rem', marginBottom: 16, display: 'inline-block',
            background: 'linear-gradient(45deg, #39FF14, #8de02c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>{icon || '🔐'}</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>{title || 'GalaxyERP Login'}</h1>
          <p style={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '0.95rem', fontWeight: 500 }}>{subtitle || 'Elevate your enterprise operations'}</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '14px 18px', borderRadius: 16,
            border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 24, fontSize: '0.85rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 10, animation: 'shake 0.4s ease'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="input-group">
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8, marginLeft: 4, letterSpacing: '0.05em' }}>Access Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@galaxyexpress.pk"
              required
              style={{
                width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none', transition: '0.3s'
              }}
              onFocus={e => { e.target.style.border = '1px solid #39FF14'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 8, marginLeft: 4, letterSpacing: '0.05em' }}>Key Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: '100%', padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1rem', outline: 'none', transition: '0.3s'
              }}
              onFocus={e => { e.target.style.border = '1px solid #39FF14'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
              onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '18px', borderRadius: 16, border: 'none', background: 'linear-gradient(45deg, #39FF14, #8de02c)',
              color: '#000', fontWeight: 900, fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 12px 24px -6px rgba(57, 255, 20, 0.4)',
              marginTop: 10
            }}
            onMouseOver={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
            onMouseOut={e => { if(!loading) e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
          >
            {loading ? 'Validating Credentials...' : 'Authenticate & Enter →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 600 }}>
            Powered by <span style={{ color: 'rgba(57, 255, 20, 0.6)' }}>GalaxyExpress Enterprise</span> · v3.0
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
      `}</style>
    </div>
  );
}
