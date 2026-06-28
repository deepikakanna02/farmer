import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address'); return; }

    setSubmitting(true);
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        {sent ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(46, 125, 50, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 style={{ marginBottom: 10 }}>Check Your Email</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              If an account with <strong>{email}</strong> exists, we've sent a password reset link to that address.
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24 }}>
              Check your spam folder if you don't see it. The link expires in 1 hour.
            </p>

            {/* Ethereal note for development */}
            <div style={{
              background: 'rgba(193, 123, 47, 0.08)', border: '1px solid rgba(193,123,47,0.2)',
              borderRadius: 'var(--radius-sm)', padding: '12px 16px', textAlign: 'left',
              fontSize: 13, color: 'var(--primary-dark)', marginBottom: 20
            }}>
              <strong>Dev Note:</strong> Using Ethereal test email — check the backend console for the preview URL to view the email.
            </div>

            <Link to="/login" className="primary-btn" style={{ display: 'inline-flex', width: 'auto', padding: '11px 28px' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ display: 'contents' }}>
            <div>
              <h2>Forgot Password</h2>
              <p className="form-desc">Enter your email and we'll send you a reset link.</p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting
                ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Sending...</>
                : 'Send Reset Link'
              }
            </button>

            <p className="form-footer">
              Remembered it?{' '}
              <Link className="link-text" to="/login">Back to login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
