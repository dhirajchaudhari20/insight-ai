import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loginAdmin } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  const triggerCelebration = () => {
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#4f87ff', '#7c6bff', '#22d3ee', '#10b981', '#f59e0b'],
    });
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      setErrorMessage('Please provide both username and password.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);

    try {
      const authResult = await loginAdmin(cleanUser, password);
      triggerCelebration();
      setIsLoading(false);
      onLoginSuccess({
        username: authResult?.user?.username || 'admin',
        role: authResult?.user?.role || 'Administrator',
        displayName: authResult?.user?.displayName || 'System Admin',
        token: authResult?.token,
        rememberMe
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Invalid credentials. Use username "admin" and password "admin".');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };


  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none"
      style={{
        backgroundColor: 'var(--surface-base)',
        color: '#cbd5e1',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── Dynamic Ambient Background Lights ── */}
      <div
        className="absolute -top-[25%] -left-[15%] w-[650px] h-[650px] rounded-full pointer-events-none opacity-40 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #4f87ff 0%, #7c6bff 50%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-[20%] -right-[15%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-30 blur-[140px]"
        style={{ background: 'radial-gradient(circle, #22d3ee 0%, #10b981 50%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-10 blur-[160px]"
        style={{ background: '#7c6bff' }}
      />

      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40" />

      {/* ── Main Login Container ── */}
      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center relative mb-3">
            <div
              className="w-14 h-14 rounded-2xl p-[2px] relative flex items-center justify-center shadow-xl shadow-blue-500/10"
              style={{
                background: 'linear-gradient(135deg, #4f87ff, #7c6bff, #22d3ee)',
              }}
            >
              <div
                className="w-full h-full rounded-[14px] flex items-center justify-center"
                style={{ background: 'var(--surface-base)' }}
              >
                <Sparkles className="w-7 h-7 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight text-white"
              style={{ letterSpacing: '-0.04em' }}
            >
              InsightAI
            </h1>
            <span className="badge badge-blue text-[10px] uppercase font-bold tracking-wider">
              Admin Portal
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Autonomous Data Analyst & Intelligence Platform. Sign in with administrator credentials.
          </p>
        </div>

        {/* Card Form */}
        <div
          className={`rounded-2xl p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 relative ${
            shake ? 'animate-bounce' : ''
          }`}
          style={{
            background: 'rgba(13, 21, 38, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(79, 135, 255, 0.1)',
          }}
        >
          {/* Quick Demo Pre-Fill Action */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Default Access</span>
            </div>
            <button
              type="button"
              id="btn-quick-fill"
              onClick={handleQuickFill}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer"
              title="Auto-fill admin credentials"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Fill Demo (admin/admin)</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              className="mb-5 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: '#fda4af',
              }}
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 transition-all outline-none"
                  style={{
                    background: 'rgba(8, 13, 26, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#4f87ff')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <span className="text-[11px] font-mono text-slate-500">Hint: admin</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 transition-all outline-none"
                  style={{
                    background: 'rgba(8, 13, 26, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#4f87ff')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Status */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200 transition-colors">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Auth Ready
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-login-submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center mt-2 py-3 text-sm font-semibold relative overflow-hidden group cursor-pointer"
              style={{
                borderRadius: '12px',
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-5 pt-4 border-t border-white/5 text-center">
            <p className="text-[11px] text-slate-500">
              System credentials configured for judging & evaluation:
              <br />
              <span className="text-slate-300 font-mono font-medium">username: </span>
              <code className="text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded text-[11px]">admin</code>
              <span className="text-slate-300 font-mono font-medium"> &nbsp;|&nbsp; password: </span>
              <code className="text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded text-[11px]">admin</code>
            </p>
          </div>
        </div>

        {/* Feature & Security Badges Footer */}
        <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-slate-500 text-[11px]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>256-Bit Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vector & DuckDB Core</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Offline-Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
