import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/auth.service';
import { setAuthStart, setAuthSuccess, setAuthFailure } from '../store/slices/authSlice';
import AuthWallpaper from '@/components/AuthWallpaper';

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;

    dispatch(setAuthStart());
    try {
      const data = await authService.login({ username: form.username, password: form.password });
      dispatch(setAuthSuccess({ user: { username: form.username } }));
      navigate('/');
    } catch (err) {
      dispatch(setAuthFailure(err.response?.data?.detail || 'Invalid username or password. Please try again.'));
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
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="johndoe"
                  className="h-11"
                  value={form.username}
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
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