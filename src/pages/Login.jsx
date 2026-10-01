import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }
    setError('');
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-badge">
            <ShieldCheck size={26} />
          </div>
          <h2 className="login-title">FraudNexus SOC Portal</h2>
          <p className="login-subtitle">Secure access for fraud investigators and SOC analysts</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="form-error-msg">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username-input">Username / Analyst ID</label>
            <div className="form-input-wrap">
              <User size={16} className="input-icon" />
              <input
                id="username-input"
                type="text"
                className="form-input"
                placeholder="e.g. analyst@fraudnexus.ai"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password / Token</label>
            <div className="form-input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="password-input"
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
              />
            </div>
          </div>

          <button id="btn-login-submit" type="submit" className="btn-login-submit">
            <span>Authenticate Session</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="login-demo-notice">
          Demo Mode: Enter any credentials to enter the SOC Investigation Dashboard.
        </p>
      </div>
    </div>
  );
}
