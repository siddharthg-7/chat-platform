import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginRequest } from '@/services/authService';
import AuthWallpaper from '@/components/AuthWallpaper';

const Login = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // NOTE: switches to the real API automatically once VITE_USE_MOCK_AUTH=false
      const { data } = await loginRequest({
        email: form.email,
        password: form.password,
      });

      if (data?.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }

      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center border-b border-[var(--border)] px-6 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
            <Zap className="h-4 w-4 text-white" fill="white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[var(--text)]">
            ChatsApp
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: static wallpaper */}
        <div className="relative hidden flex-1 lg:block">
          <AuthWallpaper />
        </div>

        {/* Right: auth panel */}
        <div className="flex w-full flex-1 items-center justify-center overflow-y-auto border-[var(--border)] px-6 py-10 lg:w-[440px] lg:flex-none lg:border-l">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Welcome back</h1>
              <p className="mt-1.5 text-sm text-[var(--text-muted)]">Sign in to continue to your workspace</p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="h-11"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[var(--accent)] hover:text-indigo-400 font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-11 pr-10"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500"
                >
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-[15px] mt-2 gap-2 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-7 text-center text-[13px] text-[var(--text-muted)]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[var(--accent)] hover:text-indigo-400 font-medium transition-colors">
                Sign up for free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;