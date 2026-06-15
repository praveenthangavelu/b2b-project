import { API_BASE } from '../config';

export const getStoredToken = () =>
  (typeof window !== 'undefined' && localStorage.getItem('prospecto_token')) || '';

export async function apiLogin(email, password) {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function apiRegister(name, email, password) {
  const res = await fetch(API_BASE + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function apiGetMe(token) {
  const res = await fetch(API_BASE + '/auth/me', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (res.status === 401) return { error: 'Unauthorized' };
  return res.json();
}

export async function enrichFetch(path, body) {
  const token = getStoredToken();
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body || {}),
  });
  let data = {};
  try { data = await res.json(); } catch { data = {}; }
  return { ok: res.ok, status: res.status, data };
}

export async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE.replace(/\/api$/, '')}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getStoredToken()}`,
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('prospecto_token');
    window.location.reload();
    throw new Error('unauthorized');
  }
  return res.json();
}
