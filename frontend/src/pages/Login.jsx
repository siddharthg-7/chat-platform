import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from '@/components/auth/AuthLayout.jsx';
import logo from '@/assets/logo.svg';
import { authService } from '../services/auth.service';
import { setAuthStart, setAuthSuccess, setAuthFailure } from '../store/slices/authSlice';

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
    if (!form.username.trim() || !form.password) {
      dispatch(setAuthFailure('Username and password are required.'));
      return;
    }

    dispatch(setAuthStart());
    try {
      // authService.login stores tokens in localStorage and returns token data
      await authService.login({ username: form.username.trim(), password: form.password });
      // Fetch the user profile to populate state.auth.user
      const user = await authService.getProfile();
      dispatch(setAuthSuccess({ user }));
      toast.success("Login successful!");
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Invalid username or password.');
      dispatch(setAuthFailure(msg));
      toast.error(msg);
    }
  };

  return (
    <AuthLayout wallpaperPosition="left">
      <ToastContainer position="top-right" autoClose={3000} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass w-full max-w-md rounded-2xl p-8 sm:p-10 shadow-sm"
      >
        {/* Logo + Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="ChatPlatform" className="mb-5 h-14 w-14" />
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
            className="w-full h-11 text-[15px] mt-2 gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              <>Sign In <ArrowRight className="h-4 w-4" /></>
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
    </AuthLayout>
  );
};

export default Login;

