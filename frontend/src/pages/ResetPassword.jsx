import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from '@/components/auth/AuthLayout.jsx';
import logo from '@/assets/logo.svg';
import { authService } from '../services/auth.service';

const ResetPassword = () => {
  const [showPass, setShowPass] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('New password is required.');
      return;
    }

    if (!uid || !token) {
      setError('Invalid or missing password reset link.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(uid, token, password);
      toast.success("Password has been reset successfully!");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Failed to reset password.');
      
      // If error is an array of messages (like password validation failed)
      const displayMsg = Array.isArray(msg) ? msg.join(', ') : msg;
      
      setError(displayMsg);
      toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout wallpaperPosition="right">
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
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Create New Password</h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">Please enter your new password below</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                New Password
              </label>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-11 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-[15px] mt-2 gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</>
            ) : (
              <>Reset Password <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </form>

        <p className="mt-7 text-center text-[13px] text-[var(--text-muted)]">
          <Link to="/login" className="text-[var(--accent)] hover:text-indigo-400 font-medium transition-colors">
            Back to Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPassword;
