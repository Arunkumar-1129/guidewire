import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Shield, Bell, CheckCircle, Clock, AlertTriangle,
  CloudRain, Thermometer, Wind, Ban, Smartphone, RefreshCw,
  TrendingUp, ArrowRight, Zap
} from 'lucide-react';
import {
  PLANS, TRIGGER_CONFIG,
  getCurrentWorker, getClaims, getTriggers,
  addClaim, updateClaim, updateWorker, getWorkers, saveWorkers,
  generateId, formatDate
} from '../store';
import { useScrollReveal } from '../hooks/useScrollReveal';

/* ── helpers ── */
function ClaimStatusBadge({ status }) {
  if (status === 'Paid')
    return (
      <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
        <CheckCircle size={11} />Paid
      </span>
    );
  if (status === 'Processing')
    return (
      <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold">
        <Clock size={11} />Processing
      </span>
    );
  return <span className="text-text-sub text-xs">{status}</span>;
}

const TRIGGER_ICONS = {
  Rain: CloudRain,
  Heat: Thermometer,
  AQI: Wind,
  Curfew: Ban,
  'Platform Downtime': Smartphone,
};

const TRIGGER_COLORS = {
  Rain: '#3b82f6',
  Heat: '#f97316',
  AQI: '#8b5cf6',
  Curfew: '#ef4444',
  'Platform Downtime': '#6b7280',
};

const CLAIM_ICONS = {
  Rain: CloudRain,
  Heat: Thermometer,
  AQI: Wind,
  Curfew: Ban,
  'Platform Downtime': Smartphone,
};

function TriggerRow({ name, config, data, index }) {
  const isToggle = !config.threshold;
  const active = data?.active;
  const value = data?.value;
  const Icon = TRIGGER_ICONS[name] || AlertTriangle;
  const color = TRIGGER_COLORS[name] || '#6b7280';

  let statusText = '';
  let statusColor = 'text-text-sub';
  if (isToggle) {
    statusText = active ? 'ACTIVE' : 'Inactive';
    statusColor = active ? 'text-red-400' : 'text-text-muted';
  } else {
    statusText = `${value} ${config.unit}`;
    if (active) statusColor = 'text-red-400';
    else if (value >= config.threshold * 0.8) statusColor = 'text-yellow-400';
    else statusColor = 'text-green-400';
  }

  return (
    <div
      className={`scroll-reveal flex items-center gap-3 py-3.5 border-b border-border-line last:border-0 transition-all duration-200 ${
        active ? 'opacity-100' : 'opacity-75'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          active ? 'shadow-lg' : 'bg-bg-element/60'
        }`}
        style={
          active
            ? { background: `${color}20`, boxShadow: `0 0 12px ${color}40` }
            : {}
        }
      >
        <Icon size={16} style={{ color: active ? color : undefined }} className={active ? '' : 'text-text-muted'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-main text-sm font-semibold truncate">{name}</p>
        {config.threshold && (
          <p className="text-text-muted text-xs">
            Threshold: {config.threshold} {config.unit}
          </p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${statusColor}`}>{statusText}</p>
        {active && (
          <p className="text-red-400 text-[9px] font-bold uppercase tracking-wider animate-pulse">
            ● Triggered
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Stat card with glow ── */
function StatCard({ icon: Icon, label, value, sub, color, delay, className = '' }) {
  return (
    <div
      className={`scroll-scale morph-card rounded-2xl p-4 stat-card ${className}`}
      style={{ transitionDelay: delay }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, boxShadow: `0 0 10px ${color}25` }}
        >
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-text-muted text-xs font-medium">{label}</span>
      </div>
      <p className="text-text-main text-2xl font-bold leading-none mb-1">{value}</p>
      {sub && <p className="text-text-muted text-xs">{sub}</p>}
    </div>
  );
}

/* ── Claims-only view ── */
function ClaimsView({ claims, navigate }) {
  const pageRef = useScrollReveal();

  return (
    <div ref={pageRef} className="min-h-screen bg-bg-base pb-8">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <p className="scroll-reveal text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
          History
        </p>
        <h1 className="scroll-reveal delay-100 text-2xl font-bold text-text-main">
          Claim History
        </h1>
      </div>

      <div className="px-5">
        {claims.length === 0 ? (
          <div className="scroll-reveal morph-card rounded-2xl p-10 text-center delay-200">
            <div className="w-14 h-14 rounded-2xl bg-bg-element flex items-center justify-center mx-auto mb-4">
              <Shield size={26} className="text-text-muted" />
            </div>
            <p className="text-text-sub text-sm font-medium">No claims yet</p>
            <p className="text-text-muted text-xs mt-1">
              Claims are processed automatically when triggers activate.
            </p>
          </div>
        ) : (
          <div className="scroll-reveal morph-card rounded-2xl overflow-hidden delay-200">
            {claims.map((claim, i) => {
              const Icon = CLAIM_ICONS[claim.event] || Shield;
              return (
                <div
                  key={claim.id}
                  className={`flex items-center gap-3 px-4 py-4 transition-colors hover:bg-bg-element/30 ${
                    i < claims.length - 1 ? 'border-b border-border-line' : ''
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${TRIGGER_COLORS[claim.event] || '#6366f1'}18` }}
                  >
                    <Icon size={18} style={{ color: TRIGGER_COLORS[claim.event] || '#6366f1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-main text-sm font-semibold truncate">{claim.event}</p>
                    <p className="text-text-muted text-xs">{claim.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-green-400 font-bold text-sm">₹{claim.payout}</p>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard({ worker, onRefresh, claimsOnly }) {
  const navigate = useNavigate();
  const [triggers, setTriggers] = useState(getTriggers());
  const [claims, setClaims] = useState([]);
  const [successBanner, setSuccessBanner] = useState(null);
  const [processing, setProcessing] = useState(false);
  const pageRef = useScrollReveal();

  const loadClaims = useCallback(() => {
    if (!worker) return;
    const all = getClaims();
    setClaims(all.filter((c) => c.workerId === worker.id));
  }, [worker]);

  useEffect(() => { loadClaims(); }, [loadClaims]);

  // Poll triggers every 5s
  useEffect(() => {
    const interval = setInterval(() => setTriggers(getTriggers()), 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-claim logic
  useEffect(() => {
    if (!worker || !worker.planId || worker.suspicious || processing) return;
    const t = getTriggers();
    const plan = PLANS.find((p) => p.id === worker.planId);
    if (!plan) return;

    const activeTriggers = Object.entries(t).filter(([name, data]) => {
      if (!data.active) return false;
      if (!plan.triggers.includes(name)) return false;
      return true;
    });

    if (activeTriggers.length === 0) return;

    const allClaims = getClaims();
    const today = formatDate();
    const todayClaims = allClaims.filter(
      (c) => c.workerId === worker.id && c.date === today
    );
    const pendingTriggers = activeTriggers.filter(
      ([name]) => !todayClaims.some((c) => c.event === name)
    );

    if (pendingTriggers.length === 0) return;

    setProcessing(true);
    const [triggerName] = pendingTriggers[0];

    const claimId = generateId('c');
    const newClaim = {
      id: claimId,
      workerId: worker.id,
      date: today,
      event: triggerName,
      payout: plan.coverage,
      status: 'Processing',
      zone: worker.zone,
    };
    addClaim(newClaim);
    loadClaims();

    setTimeout(() => {
      updateClaim(claimId, { status: 'Paid' });
      const workers = getWorkers();
      const idx = workers.findIndex((w) => w.id === worker.id);
      if (idx !== -1) {
        workers[idx].walletBalance = (workers[idx].walletBalance || 0) + plan.coverage;
        saveWorkers(workers);
      }
      onRefresh && onRefresh();
      loadClaims();
      setSuccessBanner({ event: triggerName, amount: plan.coverage });
      setProcessing(false);
      setTimeout(() => setSuccessBanner(null), 6000);
    }, 3000);
  }, [triggers, worker]);

  if (!worker) {
    navigate('/');
    return null;
  }

  if (claimsOnly) return <ClaimsView claims={claims} navigate={navigate} />;

  const plan = PLANS.find((p) => p.id === worker.planId);
  const activeTriggersList = Object.entries(triggers).filter(([, d]) => d.active);
  const nextRenewal = new Date();
  nextRenewal.setDate(nextRenewal.getDate() + 7);
  const totalEarned = claims
    .filter((c) => c.status === 'Paid')
    .reduce((sum, c) => sum + c.payout, 0);

  return (
    <div ref={pageRef} className="min-h-screen bg-bg-base pb-8">
      {/* Success Banner */}
      {successBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-slide-in-up">
          <div className="morph-card rounded-2xl px-5 py-4 flex items-center gap-3 border border-green-500/30 glow-green">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div>
              <p className="font-bold text-text-main text-sm">
                {successBanner.event} trigger activated!
              </p>
              <p className="text-green-400 text-xs font-semibold mt-0.5">
                ₹{successBanner.amount} credited to your wallet
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="relative px-5 pt-12 pb-6">
        {/* Decorative orb behind header */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
        <div className="scroll-reveal flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm mb-0.5">Welcome back,</p>
            <h1 className="text-xl font-bold text-text-main">
              {worker.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-[10px] uppercase tracking-wider mb-0.5">Zone</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              {worker.zone}
            </span>
          </div>
        </div>
      </div>

      {/* ── ALERT BANNER ── */}
      {activeTriggersList.length > 0 && (
        <div className="mx-5 mb-5 scroll-reveal delay-100">
          <div className="morph-card rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-red-500/30 animate-pulse-glow">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-red-400 font-bold text-sm">Disruption Alert Active!</p>
              <p className="text-red-300/70 text-xs truncate">
                {activeTriggersList.map(([name]) => name).join(', ')} — Claim processing
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
          </div>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-5">
        <StatCard
          icon={Wallet}
          label="Wallet Balance"
          value={`₹${(worker.walletBalance || 0).toLocaleString()}`}
          color="#6366f1"
          delay="0.1s"
        />
        <StatCard
          icon={Shield}
          label="Active Plan"
          value={plan ? plan.name : '—'}
          sub={plan ? `₹${plan.coverage} coverage` : undefined}
          color="#22c55e"
          delay="0.2s"
        />
      </div>

      {/* ── TOTAL EARNED BANNER ── */}
      {claims.length > 0 && (
        <div className="px-5 mb-5 scroll-reveal delay-200">
          <div
            className="morph-card rounded-2xl px-4 py-3.5 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(99,102,241,0.06) 100%)',
              borderColor: 'rgba(34,197,94,0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-text-muted text-xs">Total Earned</p>
                <p className="text-green-400 font-bold text-lg leading-tight">
                  ₹{totalEarned.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-muted text-xs">{claims.filter(c => c.status === 'Paid').length} claims</p>
              <p className="text-indigo-400 text-xs font-medium">paid out</p>
            </div>
          </div>
        </div>
      )}

      {/* ── COVERAGE INFO ── */}
      {plan && (
        <div className="px-5 mb-5 scroll-reveal delay-300">
          <div className="morph-card rounded-2xl px-4 py-3 grid grid-cols-3 divide-x divide-border-line">
            {[
              { label: 'Max Coverage', value: `₹${plan.coverage}` },
              { label: 'Plan Type', value: plan.name },
              { label: 'Next Renewal', value: formatDate(nextRenewal).split('-').slice(0,2).join('-') },
            ].map(({ label, value }) => (
              <div key={label} className="px-3 first:pl-0 last:pr-0 text-center">
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-text-main text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!plan && (
        <div className="px-5 mb-5 scroll-reveal delay-300">
          <div className="gradient-border rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-text-main font-bold text-sm">No Active Plan</p>
              <p className="text-text-muted text-xs mt-0.5">Activate coverage to start earning payouts</p>
            </div>
            <button
              onClick={() => navigate('/plans')}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            >
              Choose Plan <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── LIVE TRIGGER STATUS ── */}
      <div className="px-5 mb-5">
        <div className="scroll-reveal delay-100 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-indigo-400" />
            <h2 className="text-text-main font-bold text-sm">Live Trigger Status</h2>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-xs">Auto-updating</span>
          </div>
        </div>
        <div className="morph-card rounded-2xl px-4 py-1">
          {Object.entries(TRIGGER_CONFIG).map(([name, config], i) => (
            <TriggerRow
              key={name}
              name={name}
              config={config}
              data={triggers[name]}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* ── RECENT CLAIMS ── */}
      <div className="px-5">
        <div className="scroll-reveal flex items-center justify-between mb-3">
          <h2 className="text-text-main font-bold text-sm">Recent Claims</h2>
          <button
            onClick={() => navigate('/claims')}
            className="text-indigo-400 text-xs font-semibold flex items-center gap-1 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {claims.length === 0 ? (
          <div className="scroll-reveal delay-100 morph-card rounded-2xl p-7 text-center">
            <div className="w-12 h-12 rounded-2xl bg-bg-element flex items-center justify-center mx-auto mb-3">
              <Bell size={20} className="text-text-muted" />
            </div>
            <p className="text-text-sub text-sm font-medium">No claims yet</p>
            <p className="text-text-muted text-xs mt-1">
              Claims are processed automatically when triggers activate.
            </p>
          </div>
        ) : (
          <div className="morph-card rounded-2xl overflow-hidden">
            {claims.slice(0, 3).map((claim, i) => {
              const Icon = CLAIM_ICONS[claim.event] || Shield;
              return (
                <div
                  key={claim.id}
                  className={`scroll-reveal flex items-center gap-3 px-4 py-4 hover:bg-bg-element/30 transition-colors ${
                    i < Math.min(claims.length, 3) - 1 ? 'border-b border-border-line' : ''
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${TRIGGER_COLORS[claim.event] || '#6366f1'}18` }}
                  >
                    <Icon size={18} style={{ color: TRIGGER_COLORS[claim.event] || '#6366f1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-main text-sm font-semibold truncate">{claim.event}</p>
                    <p className="text-text-muted text-xs">{claim.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-green-400 font-bold text-sm">₹{claim.payout}</p>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
