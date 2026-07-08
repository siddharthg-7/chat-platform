import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--bg-base)]">
      
      {/* Animated background orbs */}
      <div className="animate-float absolute top-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[140px] pointer-events-none" />
      <div className="animate-float-delay absolute bottom-[-15%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass z-10 w-full max-w-md rounded-2xl p-8 sm:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      >
        {/* Logo + Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_28px_rgba(99,102,241,0.5)] animate-pulse-glow">
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

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
            <span className="px-3 text-[var(--text-muted)]" style={{ background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(4px)' }}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-11 text-sm gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </Button>
          <Button variant="outline" className="h-11 text-sm gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
        </div>

        <p className="mt-7 text-center text-[13px] text-[var(--text-muted)]">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[var(--accent)] hover:text-indigo-400 font-medium transition-colors">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
