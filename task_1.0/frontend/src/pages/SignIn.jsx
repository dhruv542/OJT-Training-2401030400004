import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  // Form toggle state
  const [isRegister, setIsRegister] = useState(false);

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }

    if (isRegister && (!firstName || !lastName)) {
      setErrorMsg('First and last name are required for sign up.');
      return;
    }

    if (isRegister && password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const body = isRegister 
        ? { firstName, lastName, email, password }
        : { email, password };

      const response = await fetch(`http://127.0.0.1:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegister) {
          setSuccessMsg('Account registered successfully! Switching to sign in...');
          setIsRegister(false);
          setPassword('');
        } else {
          login(data.token, data.user);
          // Redirect to profile or home
          const redirect = searchParams.get('redirect') || '/';
          navigate(redirect);
        }
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      console.error('Auth submit error:', err.message);
      setErrorMsg('Network error reaching the login API server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <div className="login-form-header">
          <h1>MakerBazar.in</h1>
          <p className="login-subtitle">
            {isRegister ? 'Create a secure builder account' : 'Sign in or create an account'}
          </p>
        </div>

        <div className="oauth-row">
          <button className="oauth-btn" onClick={() => alert('OAuth login integration coming soon!')}>
            <img src="https://e7.pngegg.com/pngimages/344/344/png-clipart-google-logo-google-logo-g-suite-google-text-logo-thumbnail.png" alt="Google Login icon" />
            <span>Google</span>
          </button>
          <button className="oauth-btn" onClick={() => alert('OAuth login integration coming soon!')}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZLOzalQSCYx6ZcGyNR_7WAK81EkZf9G6tkw&s" alt="Facebook Login icon" />
            <span>Facebook</span>
          </button>
        </div>

        <div className="form-divider">
          <hr />
          <span>or</span>
          <hr />
        </div>

        <form onSubmit={handleSubmit} className="auth-inputs-form">
          {errorMsg && <div className="auth-feedback-box error">{errorMsg}</div>}
          {successMsg && <div className="auth-feedback-box success">{successMsg}</div>}

          {isRegister && (
            <div className="names-row">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={submitting} className="auth-submit-btn">
            {submitting ? 'Authenticating...' : isRegister ? 'Register' : 'Continue'}
          </button>

          <div className="newsletter-checkbox-row">
            <input 
              type="checkbox" 
              id="newsletter-chk"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            <label htmlFor="newsletter-chk">Email me with custom updates and offers</label>
          </div>
        </form>

        <div className="terms-privacy-footer">
          <p>
            By continuing, you agree to our <a href="/">Terms of Service</a> & <a href="/">Privacy Policy</a>.
          </p>
          <button onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }} className="toggle-register-btn">
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
