import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Sign In</h2>
        <p className="form-desc">Welcome back to Farm Market</p>

        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
            <Link className="link-text" to="/forgot-password" style={{ fontSize: 13 }}>Forgot password?</Link>
          </div>
          <input
            id="login-password"
            className="form-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting
            ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Signing in...</>
            : 'Sign In'
          }
        </button>

        <p className="form-footer">
          Don't have an account?{' '}
          <Link className="link-text" to="/register">Create one free</Link>
        </p>
        <p className="form-footer">
          <Link className="link-text" to="/">Back to home</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
