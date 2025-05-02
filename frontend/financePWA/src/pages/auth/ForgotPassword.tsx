import React, { useState } from 'react';

const API_BASE = 'https://dash.unclutter.com.ng/wp-json/api/v1/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Password reset email sent!');
      } else {
        setError(data.message || 'Failed to send reset email.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
    <div className="mt-6 text-center text-sm space-y-2">
      <div>
        Remember your password?{' '}
        <a href="/login" className="text-finance-blue hover:underline font-medium">Login</a>
      </div>
      <div>
        Have a code?{' '}
        <a href="/reset-password" className="text-finance-blue hover:underline font-medium">Reset Password</a>
      </div>
      <div>
        Don&apos;t have an account?{' '}
        <a href="/register" className="text-finance-blue hover:underline font-medium">Register</a>
      </div>
    </div>
    </>
  );
}
