import React, { useState } from 'react';

// PUBLIC_INTERFACE
export default function AuthForm({ onLogin, onSignup, loading, error }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(username, password);
    } else {
      onSignup(username, password);
    }
  };

  return (
    <div className="authform-container">
      <form className="auth-form" onSubmit={submit}>
        <h2 style={{ color: 'var(--primary-color)' }}>
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </h2>
        <input
          className="auth-input"
          autoFocus
          aria-label="Username"
          placeholder="Username"
          value={username}
          disabled={loading}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="auth-input"
          type="password"
          aria-label="Password"
          placeholder="Password"
          value={password}
          autoComplete="current-password"
          disabled={loading}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          className="btn btn-large"
          style={{ background: 'var(--primary-color)', color: '#fff', marginTop: 8 }}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
        </button>
        {error && (
          <div className="error-msg" style={{ color: 'var(--accent-color)', marginTop: 8 }}>{error}</div>
        )}
        <div className="auth-switcher">
          {mode === 'login' ? (
            <span>
              New here?{' '}
              <button className="link-btn" type="button" onClick={() => setMode('signup')} disabled={loading}>
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button className="link-btn" type="button" onClick={() => setMode('login')} disabled={loading}>
                Log in
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
