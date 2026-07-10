import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout.jsx';
import { authService } from '../services/auth.service';
import { setAuthStart, setAuthSuccess, setAuthFailure } from '../store/slices/authSlice';

const Signup = () => {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      dispatch(setAuthFailure('Password must be at least 8 characters long.'));
      return;
    }

    dispatch(setAuthStart());
    try {
      await authService.signup(form);
      // Automatically login after signup
      const loginData = await authService.login({ username: form.username, password: form.password });
      dispatch(setAuthSuccess({ user: { username: form.username } }));
      navigate('/');
    } catch (err) {
      dispatch(setAuthFailure(
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data ? JSON.stringify(err.response.data) : 'Something went wrong creating your account. Please try again.')
      ));
    }
  };
 
  return (
    <AuthLayout wallpaperPosition="right">
    
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass w-full max-w-[420px] rounded-2xl p-3 sm:p-4 shadow-sm"
      >
      {/* Logo + Header */}
      
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]">
            <Zap className="h-7 w-7 text-white" fill="white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-[var(--text)]">
            ChatsApp
          </span>
        </div>
      


            {/* Form */}
            <form className="space-y-4" onSubmit={handleSignup}>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="first_name" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    First Name
                  </label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    className="h-11"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="last_name" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Last Name
                  </label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    className="h-11"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

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
                <label htmlFor="password" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
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
                <p className="text-[11px] text-[var(--text-muted)]">Must be at least 8 characters long.</p>
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
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
                ) : (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
          </form>

        <p className="mt-7 text-center text-[13px] text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent)] hover:text-indigo-400 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    
    </AuthLayout>
  );
};

export default Signup;