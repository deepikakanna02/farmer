import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (!token) {
      setError('Reset token is missing from the URL'); return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="form-page">
        <div className="form-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
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
          <h2 style={{ marginBottom: 10 }}>Password Updated!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
            Your password has been reset successfully. Redirecting you to login...
          </p>
          <Link to="/login" className="primary-btn" style={{ display: 'inline-flex', width: 'auto', padding: '11px 28px' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <form className="form-card" onSubmit={onSubmit}>
        <div>
          <h2>Set New Password</h2>
          <p className="form-desc">Choose a strong password for your account.</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            className="form-input"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            className="form-input"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Password strength indicator */}
        {password.length > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {[1, 2, 3, 4].map((level) => {
              const strength = password.length < 6 ? 1 : password.length < 8 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
              return (
                <div key={level} style={{
                  height: 4, flex: 1, borderRadius: 4,
                  background: level <= strength
                    ? strength <= 1 ? '#C0392B' : strength === 2 ? '#E67E22' : strength === 3 ? '#F1C40F' : '#2E7D32'
                    : 'var(--border)',
                  transition: 'background 0.2s'
                }} />
              );
            })}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {password.length < 6 ? 'Too short' : password.length < 8 ? 'Weak' : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Strong' : 'Fair'}
            </span>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting
            ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Updating...</>
            : 'Update Password'
          }
        </button>

        <p className="form-footer">
          <Link className="link-text" to="/login">Cancel — back to login</Link>
        </p>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
