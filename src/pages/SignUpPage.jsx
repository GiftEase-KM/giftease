import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import '../styles/auth.css';

export default function SignUpPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.first_name || !form.last_name) {
      setError('Please enter your first and last name');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    const { error } = await signUp(form.email, form.password, {
      first_name: form.first_name,
      last_name: form.last_name,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Save name to profile table
      try {
        const { api } = await import('../lib/api');
        await api.updateProfile({ first_name: form.first_name, last_name: form.last_name });
      } catch (e) { console.error('Profile update failed:', e); }
      navigate('/onboarding');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <h1>Create Account</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              className="input-field"
              placeholder="First Name"
              value={form.first_name}
              onChange={update('first_name')}
              required
            />
          </div>

          <div className="input-group">
            <input
              className="input-field"
              placeholder="Last Name"
              value={form.last_name}
              onChange={update('last_name')}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              className="input-field"
              placeholder="Email Address"
              value={form.email}
              onChange={update('email')}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={form.password}
              onChange={update('password')}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="input-field"
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={update('confirm_password')}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}