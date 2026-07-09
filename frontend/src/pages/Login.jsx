import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout.jsx';

const Login = () => {
  const [showPass, setShowPass] = useState(false);

  return (
    <AuthLayout wallpaperPosition="left">
  
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass w-full max-w-md rounded-2xl p-8 sm:p-10 shadow-sm"
      >
        {/* Logo + Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]">
            <Zap className="h-7 w-7 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Welcome back</h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">Sign in to continue to your workspace</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Email</label>
            <Input type="email" placeholder="name@example.com" className="h-11" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs text-[var(--accent)] hover:text-indigo-400 font-medium transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-11 pr-10"
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

          <Button
            type="button"
            className="w-full h-11 text-[15px] mt-2 gap-2"
            onClick={() => window.location.href = '/'}
          >
            Sign In <ArrowRight className="h-4 w-4" />
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
