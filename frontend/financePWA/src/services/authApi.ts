// src/services/authApi.ts
const API = 'https://dash.unclutter.com.ng/wp-json/api/v1/auth';

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  console.log(data);
  if (!res.ok) throw new Error(data.message || 'Login failed');
  if (data.access_token) localStorage.setItem('token', data.access_token);
  if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
  return data;
}

export async function register(user: any) {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function verifyEmail(email: string, code: string) {
  const res = await fetch(`${API}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Verification failed');
  return data;
}

export async function resendVerification(email: string) {
  const res = await fetch(`${API}/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Resend failed');
  return data;
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Reset failed');
  return data;
}

export async function resetPassword(email: string, code: string, password: string) {
  const res = await fetch(`${API}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Reset failed');
  return data;
}

export async function verifyToken(token: string) {
  const res = await fetch(`${API}/verify-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Token invalid');
  return data;
}

export async function refreshToken(token: string) {
  const res = await fetch(`${API}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Refresh failed');
  if (data.token) localStorage.setItem('token', data.token);
  return data;
}

export async function logout(token: string) {
  const res = await fetch(`${API}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  localStorage.removeItem('token');
  return res.ok;
}
