import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from '@/components/auth/AuthLayout.jsx';
import logo from '@/assets/logo.svg';
import { authService } from '../services/auth.service';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authService.forgotPassword(email.trim());
      setSuccess(true);
      toast.success(response.message || "If an account exists, a password reset email has been sent.");
      setEmail('');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Failed to send reset link.');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout wallpaperPosition="left">
      <ToastContainer position="top-right" autoClose={3000} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass w-full max-w-md rounded-2xl p-8 sm:p-10 shadow-sm relative"
      >
        <Link to="/login" className="absolute top-6 left-6 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        
        {/* Logo + Header */}
        <div className="mb-8 flex flex-col items-center text-center mt-2">
          <img src={logo} alt="ChatPlatform" className="mb-5 h-14 w-14" />
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Reset Password</h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">Enter your email to receive a reset link</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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

          {success && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500"
            >
              <span>If an account exists, a reset link has been sent to your email.</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-[15px] mt-2 gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending link…</>
            ) : (
              <>Send Reset Link <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
        </form>

        <p className="mt-7 text-center text-[13px] text-[var(--text-muted)]">
          Remembered your password?{' '}
          <Link to="/login" className="text-[var(--accent)] hover:text-indigo-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default ForgotPassword;
