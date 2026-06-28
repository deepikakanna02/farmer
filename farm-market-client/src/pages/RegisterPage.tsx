import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password.trim() || !role.trim()) {
      setError('Name, email, password and role are required');
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, password, role, contactNumber });
      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Create Account</h2>
        <p className="form-desc">Join India's trusted farm marketplace</p>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">I am a...</label>
          <div className="role-selector">
            {[
              { value: 'buyer', label: 'Buyer' },
              { value: 'farmer', label: 'Farmer' },
              { value: 'representative', label: 'Rep' },
            ].map((r) => (
              <div className="role-option" key={r.value}>
                <input
                  type="radio"
                  id={`role-${r.value}`}
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                />
                <label htmlFor={`role-${r.value}`}>
                  <span className="role-option-name">{r.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-contact">
            Contact Number <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            id="reg-contact"
            className="form-input"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting
            ? <><span className="spinner" style={{ borderTopColor: '#fff' }} /> Creating account...</>
            : 'Create Account'
          }
        </button>

        <p className="form-footer">
          Already have an account?{' '}
          <Link className="link-text" to="/login">Sign in</Link>
        </p>
        <p className="form-footer">
          <Link className="link-text" to="/">Back to home</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
