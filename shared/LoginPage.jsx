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

  const API = apiBase || import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';

  useEffect(() => {
    gsap.fromTo('.login-container',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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

      gsap.to('.login-container', {
        scale: 0.95,
        opacity: 0,
        duration: 0.3,
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-brand-icon">{icon || '🔐'}</div>
          <h1>{title || 'Login'}</h1>
          <p>{subtitle || 'Sign in to your account'}</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          Powered by <a href="#">SaaS ERP Platform</a>
        </div>
      </div>
    </div>
  );
}
