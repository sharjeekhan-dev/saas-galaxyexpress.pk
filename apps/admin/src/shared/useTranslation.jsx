import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'https://api.galaxyexpress.pk';

// Global cache to avoid redundant fetching across components
let globalDict = null;
let fetchPromise = null;

export function useTranslation() {
  const [dict, setDict] = useState(globalDict || {});
  // Check user language preference, default to EN
  const savedUser = localStorage.getItem('erp_user');
  const lang = savedUser ? (JSON.parse(savedUser).language || 'en').toLowerCase() : 'en';

  useEffect(() => {
    if (globalDict) return;

    if (!fetchPromise) {
      const token = localStorage.getItem('erp_token');
      // Adding tenantId logic would be handled by the backend automatically using the JWT
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      fetchPromise = fetch(`${API}/api/settings/translations`, { headers })
        .then(res => res.json())
        .then(data => {
          globalDict = data;
          setDict(data);
        })
        .catch(err => {
          console.error('Translation fetch fail:', err);
          globalDict = {};
          setDict({});
        });
    } else {
      fetchPromise.then(() => setDict(globalDict));
    }
  }, []);

  const t = useCallback((key, fallback = '') => {
    if (!dict[key]) return fallback || key;
    return dict[key][lang] || dict[key].en || fallback || key;
  }, [dict, lang]);

  return { t, lang };
}
