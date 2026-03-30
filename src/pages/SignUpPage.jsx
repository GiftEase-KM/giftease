import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import '../styles/auth.css';

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '',
    email: '', address: '', country: '', state: '', zip_code: '',
    password: '', confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) {
      setError('Please fill in your name');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
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
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <h1>Sign Up</h1>

        {/* Avatar placeholder */}
        <div className="signup-avatar">
          <div className="avatar avatar-lg">
            <span>+</span>
          </div>
          <p className="signup-avatar-label">Add Photo</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1}>
            <div className="input-group">
              <input className="input-field" placeholder="Enter First Name" value={form.first_name} onChange={update('first_name')} required />
            </div>
            <div className="input-group">
              <input className="input-field" placeholder="Enter Last Name" value={form.last_name} onChange={update('last_name')} required />
            </div>
            <div className="input-group">
              <input className="input-field" placeholder="Enter Mobile Number" value={form.phone} onChange={update('phone')} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Continue</button>
            <button type="button" className="btn btn-text btn-full" onClick={() => navigate('/')}>Cancel</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2}>
            <div className="input-group">
              <input type="email" className="input-field" placeholder="Enter Email Address" value={form.email} onChange={update('email')} required />
            </div>
            <div className="input-group">
              <input className="input-field" placeholder="Enter Address" value={form.address} onChange={update('address')} />
            </div>
            <div className="input-group">
              <select className="input-field" value={form.country} onChange={update('country')}>
                <option value="">Select Country</option>
                <option value="US">United States</option>
              </select>
            </div>
            <div className="input-group">
              <select className="input-field" value={form.state} onChange={update('state')}>
                <option value="">Select State</option>
                <option value="AZ">Arizona</option>
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
              </select>
            </div>
            <div className="input-group">
              <input className="input-field" placeholder="Enter Zip Code" value={form.zip_code} onChange={update('zip_code')} />
            </div>
            <div className="input-group">
              <input type="password" className="input-field" placeholder="Enter Password" value={form.password} onChange={update('password')} required />
            </div>
            <div className="input-group">
              <input type="password" className="input-field" placeholder="Confirm Password" value={form.confirm_password} onChange={update('confirm_password')} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Continue'}
            </button>
            <button type="button" className="btn btn-text btn-full" onClick={() => setStep(1)}>Back</button>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
