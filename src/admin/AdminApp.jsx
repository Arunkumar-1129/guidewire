import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Users, Zap, BarChart3,
  AlertTriangle, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

import TriggerPanel from './TriggerPanel';
import WorkerManagement from './WorkerManagement';
import Analytics from './Analytics';
import FraudMonitor from './FraudMonitor';
import AdminOverview from './AdminOverview';
import { logout } from '../store';
import ThemeToggle from '../ThemeToggle';

const NAV_ITEMS = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true, color: '#6366f1' },
  { path: '/admin/triggers', label: 'Trigger Control', icon: Zap, color: '#f59e0b' },
  { path: '/admin/workers', label: 'Workers', icon: Users, color: '#22c55e' },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, color: '#06b6d4' },
  { path: '/admin/fraud', label: 'Risk & Fraud', icon: AlertTriangle, color: '#ef4444' },
];

function SidebarItem({ item, active, onClick }) {
  const { label, icon: Icon, color } = item;
  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer relative overflow-hidden ${
        active
          ? 'nav-active-pill text-indigo-400'
          : 'text-text-sub hover:text-text-main hover:bg-bg-element/60'
      }`}
    >
      {/* Accent dot */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
          active ? 'bg-indigo-500/20' : 'bg-bg-element/50 group-hover:bg-bg-element'
        }`}
        style={active ? { boxShadow: `0 0 12px ${color}30` } : {}}
      >
        <Icon size={16} style={{ color: active ? color : undefined }} />
      </div>
      <span className="flex-1 text-left">{label}</span>
      {active && <ChevronRight size={14} className="text-indigo-400 opacity-60" />}
    </button>
  );
}

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-bg-base flex relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative lg:flex lg:z-auto`}
      >
        {/* Sidebar glass panel */}
        <div className="flex flex-col h-full glass-dark border-r border-border-line">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-border-line">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center glow-indigo flex-shrink-0">
                  <Shield size={17} className="text-white" />
                </div>
                <div>
                  <p className="text-text-main font-bold text-base leading-none">StillPaid</p>
                  <p className="text-indigo-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
                    Admin Console
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Section label */}
          <div className="px-5 pt-5 pb-2">
            <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest">
              Navigation
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <SidebarItem
                key={item.path}
                item={item}
                active={isActive(item.path, item.exact)}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              />
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-5 pt-4 border-t border-border-line space-y-1">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-text-muted font-semibold">Theme</span>
              <ThemeToggle />
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-sub hover:text-indigo-400 hover:bg-indigo-500/5 transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-bg-element/50">
                <Shield size={16} />
              </div>
              Worker Portal ↗
            </a>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-sub hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-bg-element/50">
                <LogOut size={16} />
              </div>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-0">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3.5 border-b border-border-line glass-dark sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-text-sub hover:text-text-main transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <span className="text-text-main font-bold">StillPaid Admin</span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/triggers" element={<TriggerPanel />} />
            <Route path="/workers" element={<WorkerManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/fraud" element={<FraudMonitor />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
