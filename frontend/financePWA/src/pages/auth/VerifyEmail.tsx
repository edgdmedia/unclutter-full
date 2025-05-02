import React, { useState } from 'react';

const API_BASE = 'https://dash.unclutter.com.ng/wp-json/api/v1/auth';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Email verified successfully!');
      } else {
        setError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Verify Email</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Verification Code"
        value={code}
        onChange={e => setCode(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
    <div className="mt-6 text-center text-sm space-y-2">
      <div>
        Back to{' '}
        <a href="/login" className="text-finance-blue hover:underline font-medium">Login</a>
      </div>
      <div>
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-finance-blue hover:underline font-medium">Register</a>
      </div>
    </div>
  );
}
