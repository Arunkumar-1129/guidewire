import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, FileText, Shield, User } from 'lucide-react';
import { getCurrentWorker } from '../store';

import Register from './Register';
import WhatsappOnboarding from './WhatsappOnboarding';
import Plans from './Plans';
import Dashboard from './Dashboard';
import Profile from './Profile';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/plans', label: 'Plans', icon: Shield },
  { path: '/claims', label: 'Claims', icon: FileText },
  { path: '/profile', label: 'Profile', icon: User },
];

function BottomNav({ location, navigate }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
      {/* Frosted glass nav bar */}
      <div
        className="glass-dark border-t border-border-line px-4 py-2 pb-safe"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex justify-around">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active =
              location.pathname === path ||
              (path === '/claims' && location.pathname === '/claims');
            return (
              <button
                key={path}
                id={`nav-${label.toLowerCase()}`}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-250 cursor-pointer relative group ${
                  active ? 'text-indigo-400' : 'text-text-muted hover:text-text-sub'
                }`}
              >
                {/* Active pill background */}
                {active && (
                  <div className="absolute inset-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20" />
                )}

                {/* Icon with glow when active */}
                <div className={`relative z-10 ${active ? 'text-indigo-400' : ''}`}>
                  {active && (
                    <div className="absolute -inset-1 rounded-full bg-indigo-500/15 blur-sm" />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.5}
                    className="relative z-10"
                  />
                </div>
                <span className="text-[10px] font-semibold relative z-10 tracking-wide">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function WorkerApp() {
  const [worker, setWorker] = useState(getCurrentWorker());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const w = getCurrentWorker();
    setWorker(w);
  }, [location.pathname]);

  const refreshWorker = () => {
    setWorker(getCurrentWorker());
  };

  const isOnboarding =
    location.pathname === '/' ||
    location.pathname === '/register' ||
    location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-bg-base flex flex-col max-w-md mx-auto relative">
      {/* Routes */}
      <div className={`flex-1 ${!isOnboarding ? 'pb-24' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/onboarding" element={<WhatsappOnboarding onComplete={refreshWorker} />} />
          <Route path="/dashboard" element={<Dashboard worker={worker} onRefresh={refreshWorker} />} />
          <Route path="/plans" element={<Plans worker={worker} onRefresh={refreshWorker} />} />
          <Route path="/claims" element={<Dashboard worker={worker} onRefresh={refreshWorker} claimsOnly />} />
          <Route path="/profile" element={<Profile worker={worker} onRefresh={refreshWorker} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      {!isOnboarding && worker && (
        <BottomNav location={location} navigate={navigate} />
      )}
    </div>
  );
}
