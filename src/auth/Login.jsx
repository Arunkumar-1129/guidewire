import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { login } from '../store';
import ThemeToggle from '../ThemeToggle';

/* ── floating orb component ── */
function Orb({ style, className }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none blur-3xl ${className}`}
      style={style}
    />
  );
}

/* ── animated particle dots ── */
function ParticleDots() {
  const dots = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-indigo-400/30"
          style={{
            left: `${(i * 23 + 7) % 100}%`,
            top: `${(i * 17 + 11) % 100}%`,
            animation: `particle-drift ${4 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.4) % 3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── feature pill ── */
function FeaturePill({ icon: Icon, label, delay }) {
  return (
    <div
      className="scroll-reveal flex items-center gap-2 glass rounded-full px-3 py-1.5 border border-indigo-500/20"
      style={{ transitionDelay: delay }}
    >
      <Icon size={13} className="text-indigo-400" />
      <span className="text-xs text-text-sub font-medium">{label}</span>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const formRef = useRef(null);

  const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : '';
  const isAdmin = domain === 'admin.org';
  const isWorker = domain === 'worker.org';
  const isInvalidDomain = domain && !isAdmin && !isWorker;

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!isAdmin && !isWorker) {
      setError('Invalid email domain. Use @admin.org or @worker.org');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const session = login(email, password);
      if (session) {
        if (session.role === 'admin') navigate('/admin');
        else navigate('/');
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-bg-base flex relative overflow-hidden">
      {/* Background layer */}
      <Orb
        className="w-96 h-96 opacity-30"
        style={{
          background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)',
          top: '-10%',
          left: '-10%',
        }}
      />
      <Orb
        className="w-80 h-80 opacity-20"
        style={{
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          bottom: '-5%',
          right: '-5%',
        }}
      />
      <Orb
        className="w-60 h-60 opacity-10"
        style={{
          background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
          bottom: '30%',
          left: '30%',
        }}
      />
      <ParticleDots />

      {/* Theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Left panel — hero (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10">
        {/* Logo */}
        <div
          className={`flex items-center gap-3 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center glow-indigo">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-text-main">StillPaid</span>
        </div>

        {/* Hero text */}
        <div className="space-y-8">
          <div
            className={`transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">
              AI-Powered Insurance
            </p>
            <h1 className="text-5xl font-bold text-text-main leading-tight mb-4">
              Your income,
              <br />
              <span className="gradient-text text-glow">protected.</span>
            </h1>
            <p className="text-text-sub text-lg leading-relaxed max-w-sm">
              Parametric insurance that pays automatically when disruptions hit —
              no claims, no paperwork, instant payouts.
            </p>
          </div>

          {/* Feature pills */}
          <div
            className={`flex flex-wrap gap-2 transition-all duration-700 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          >
            {[
              { icon: Zap, label: 'Auto Triggered' },
              { icon: Shield, label: 'Zero-Fraud AI' },
              { icon: CheckCircle, label: 'Instant Payout' },
            ].map(({ icon, label }, i) => (
              <FeaturePill key={label} icon={icon} label={label} delay={`${i * 100}ms`} />
            ))}
          </div>

          {/* Stats row */}
          <div
            className={`grid grid-cols-3 gap-4 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {[
              { value: '₹700', label: 'Max Daily Payout' },
              { value: '3s', label: 'Claim Processing' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map(({ value, label }) => (
              <div key={label} className="morph-card rounded-2xl p-4">
                <p className="text-2xl font-bold gradient-text mb-1">{value}</p>
                <p className="text-text-muted text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p
          className={`text-text-muted text-xs transition-all duration-700 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          © 2025 StillPaid · Team Crashers · Guidewire Hackathon
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-12 relative z-10">
        {/* Mobile logo */}
        <div
          className={`lg:hidden flex items-center gap-3 mb-8 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center glow-indigo">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-text-main">StillPaid</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Card */}
          <div
            className={`morph-card rounded-3xl p-8 transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-text-main mb-1">Welcome back</h2>
              <p className="text-text-sub text-sm">Sign in to your account</p>
            </div>

            <form ref={formRef} onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-text-sub mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="name@worker.org or name@admin.org"
                  className={`w-full bg-bg-elevated/60 border-2 ${
                    isInvalidDomain
                      ? 'border-red-500/50 focus:border-red-400'
                      : 'border-border-focus focus:border-indigo-500'
                  } rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none transition-all duration-200 backdrop-blur-sm`}
                />
              </div>

              {/* Domain badge */}
              <div className="h-7 flex items-center justify-center">
                {isAdmin && (
                  <div className="animate-slide-in-up flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/25 rounded-full">
                    <Shield size={11} className="text-orange-400" />
                    <span className="text-orange-400 text-xs font-bold">Admin Account</span>
                  </div>
                )}
                {isWorker && (
                  <div className="animate-slide-in-up flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full">
                    <Shield size={11} className="text-indigo-400" />
                    <span className="text-indigo-400 text-xs font-bold">Worker Account</span>
                  </div>
                )}
                {isInvalidDomain && (
                  <div className="animate-slide-in-up flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/25 rounded-full">
                    <AlertTriangle size={11} className="text-red-400" />
                    <span className="text-red-400 text-xs font-bold">Invalid domain</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-text-sub mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full bg-bg-elevated/60 border-2 border-border-focus focus:border-indigo-500 rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none transition-all duration-200 backdrop-blur-sm pr-12"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors p-1 cursor-pointer"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="animate-slide-in-up bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading || (!isAdmin && !isWorker) || !email || !password}
                className="btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={16} />
                    Secure Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-7 pt-6 border-t border-border-line text-center">
              <p className="text-text-sub text-sm">
                New gig worker?{' '}
                <Link
                  to="/register"
                  className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors hover:underline underline-offset-2"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>

          {/* Hint cards */}
          <div
            className={`mt-5 grid grid-cols-2 gap-3 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="glass rounded-2xl p-3 border border-border-focus/30">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Admin</p>
              <p className="text-text-sub text-xs font-mono">@admin.org</p>
            </div>
            <div className="glass rounded-2xl p-3 border border-indigo-500/20">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Worker</p>
              <p className="text-text-sub text-xs font-mono">@worker.org</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
