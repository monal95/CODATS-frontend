import React, { useState } from 'react';
import { loginUser } from '../services/api';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Invalid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res?.success && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        onAuthSuccess && onAuthSuccess(res.user);
        onClose && onClose();
      } else {
        setError(res.error || 'Login failed');
      }
    } catch (err) {
      setError(err.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/80 dark:bg-secondary-950/80 backdrop-blur-sm transition-colors duration-200">
      <div className="w-full max-w-md p-6 rounded-2xl bg-accent-white dark:bg-secondary-800 border-2 border-primary-200 dark:border-primary-700 shadow-lg transition-colors duration-200">
        <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-4 transition-colors duration-200">Login</h3>
        {error && <div className="text-sm text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 px-3 py-2 rounded mb-3 transition-colors duration-200">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-secondary-700 dark:text-secondary-300 mb-1 font-medium transition-colors duration-200">Email</label>
            <input 
              type="email"
              className="w-full px-3 py-2 rounded border-2 border-secondary-200 dark:border-secondary-700 bg-accent-white dark:bg-secondary-700 text-secondary-900 dark:text-accent-white focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors duration-200" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm text-secondary-700 dark:text-secondary-300 mb-1 font-medium transition-colors duration-200">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 rounded border-2 border-secondary-200 dark:border-secondary-700 bg-accent-white dark:bg-secondary-700 text-secondary-900 dark:text-accent-white focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none transition-colors duration-200" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded text-white font-semibold disabled:opacity-50 transition-colors duration-200">{loading ? 'Logging in...' : 'Login'}</button>
            <button type="button" className="text-sm text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
