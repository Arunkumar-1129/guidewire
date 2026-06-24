import React from 'react';
import { getWorkers, getClaims, getTriggers } from '../store';
import { Users, FileCheck, Wallet, Zap, TrendingUp, Activity, CloudRain, Thermometer, Wind, Ban, Smartphone } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const CLAIM_EVENT_ICONS = {
  Rain: CloudRain,
  Heat: Thermometer,
  AQI: Wind,
  Curfew: Ban,
  'Platform Downtime': Smartphone,
};
const CLAIM_EVENT_COLORS = {
  Rain: '#3b82f6',
  Heat: '#f97316',
  AQI: '#8b5cf6',
  Curfew: '#ef4444',
  'Platform Downtime': '#6b7280',
};

function StatCard({ label, value, icon: Icon, iconColor, sub, accentColor, delay }) {
  return (
    <div
      className="scroll-scale morph-card rounded-2xl p-5 stat-card"
      style={{ transitionDelay: delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}18`, boxShadow: `0 0 12px ${accentColor}30` }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
        <TrendingUp size={14} className="text-text-muted opacity-50" />
      </div>
      <p className="text-text-main text-3xl font-bold mb-1">{value}</p>
      <p className="text-text-sub text-sm font-medium">{label}</p>
      <p className="text-text-muted text-xs mt-0.5">{sub}</p>
    </div>
  );
}

export default function AdminOverview() {
  const pageRef = useScrollReveal();
  const workers = getWorkers();
  const claims = getClaims();
  const triggers = getTriggers();

  const totalPayout = claims.filter((c) => c.status === 'Paid').reduce((sum, c) => sum + c.payout, 0);
  const activeTriggers = Object.values(triggers).filter((t) => t.active).length;
  const paidClaims = claims.filter((c) => c.status === 'Paid').length;

  const stats = [
    {
      label: 'Registered Workers',
      value: workers.length,
      icon: Users,
      accentColor: '#6366f1',
      sub: `${workers.filter((w) => w.status === 'Active').length} active`,
      delay: '0s',
    },
    {
      label: 'Claims Processed',
      value: paidClaims,
      icon: FileCheck,
      accentColor: '#22c55e',
      sub: `${claims.filter((c) => c.status === 'Processing').length} processing`,
      delay: '0.1s',
    },
    {
      label: 'Total Payouts',
      value: `₹${totalPayout.toLocaleString()}`,
      icon: Wallet,
      accentColor: '#a78bfa',
      sub: 'All time',
      delay: '0.2s',
    },
    {
      label: 'Active Triggers',
      value: activeTriggers,
      icon: Zap,
      accentColor: '#ef4444',
      sub: 'of 5 triggers',
      delay: '0.3s',
    },
  ];

  const recentClaims = claims.slice(0, 8);

  return (
    <div ref={pageRef} className="p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="scroll-reveal flex items-center gap-2 mb-2">
          <Activity size={14} className="text-indigo-400" />
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">
            Dashboard
          </p>
        </div>
        <h1 className="scroll-reveal delay-100 text-3xl font-bold text-text-main">
          Overview
        </h1>
        <p className="scroll-reveal delay-200 text-text-sub mt-1">
          Real-time insurance operations
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Recent Claims Table */}
      <div className="scroll-reveal delay-300 morph-card rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-4 border-b border-border-line flex items-center justify-between">
          <div>
            <h2 className="text-text-main font-bold text-lg">Recent Claims</h2>
            <p className="text-text-muted text-xs mt-0.5">{claims.length} total claims</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            Live
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-line">
                {['Worker', 'Date', 'Event', 'Zone', 'Payout', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-text-muted text-[10px] font-bold uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted text-sm">
                    No claims yet
                  </td>
                </tr>
              ) : (
                recentClaims.map((claim, i) => {
                  const worker = getWorkers().find((w) => w.id === claim.workerId);
                  const EventIcon = CLAIM_EVENT_ICONS[claim.event] || Zap;
                  const eventColor = CLAIM_EVENT_COLORS[claim.event] || '#6366f1';
                  return (
                    <tr
                      key={claim.id}
                      className="border-b border-border-line last:border-0 hover:bg-bg-element/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-400 text-xs font-bold flex-shrink-0">
                            {worker?.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-text-main text-sm font-medium">
                            {worker?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-sub text-sm">{claim.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${eventColor}18` }}
                          >
                            <EventIcon size={13} style={{ color: eventColor }} />
                          </div>
                          <span className="text-text-main text-sm">{claim.event}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-text-muted text-xs font-medium px-2 py-1 bg-bg-element/60 rounded-lg">
                          {claim.zone}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-bold text-sm">₹{claim.payout}</span>
                      </td>
                      <td className="px-6 py-4">
                        {claim.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                            Processing
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
