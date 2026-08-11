let accessToken = null;
const KEY = 'green.accessToken';

const storage = () => {
  try { return window.sessionStorage; } catch { return null; }
};

export const migrateLegacyToken = () => {
  try {
    const legacy = window.localStorage.getItem('token');
    if (legacy && !storage()?.getItem(KEY)) storage()?.setItem(KEY, legacy);
    window.localStorage.removeItem('token');
  } catch { /* Storage may be unavailable. */ }
};

export const getAccessToken = () => {
  if (accessToken) return accessToken;
  migrateLegacyToken();
  accessToken = storage()?.getItem(KEY) || null;
  return accessToken;
};

export const setAccessToken = token => {
  accessToken = token || null;
  const target = storage();
  if (!target) return;
  if (accessToken) target.setItem(KEY, accessToken);
  else target.removeItem(KEY);
};

export const clearAccessToken = () => setAccessToken(null);
