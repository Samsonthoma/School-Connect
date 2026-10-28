import React from 'react';
import { useTransport } from '../../context/TransportContext';
import { Volume2, VolumeX, ShieldAlert, Radio } from 'lucide-react';

export const Header: React.FC<{ onOpenEmergencyModal?: () => void }> = ({ onOpenEmergencyModal }) => {
  const {
    activeRole,
    setActiveRole,
    speechEnabled,
    setSpeechEnabled,
    isSimulatingDrive,
    setIsSimulatingDrive,
    notifications
  } = useTransport();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 select-none shadow-xs">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveRole('admin');
          }}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white font-black shadow-sm group-hover:bg-sky-600 transition-colors">
            BT
          </div>
          <span>BusTrak</span>
        </a>
        <span className="hidden sm:inline-block text-xs text-slate-500 font-medium border-l border-slate-200 pl-3">
          School Fleet 3-in-1
        </span>
      </div>

      {/* Zone 2: 4-5 Clean single-line links switching apps/roles */}
      <nav className="flex items-center gap-1.5 sm:gap-3 text-xs font-semibold text-slate-600 overflow-x-auto py-1 scrollbar-none">
        <button
          onClick={() => setActiveRole('admin')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeRole === 'admin'
              ? 'bg-slate-100 text-sky-700 shadow-xs border border-slate-200 font-bold'
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Admin Fleet
        </button>

        <button
          onClick={() => setActiveRole('driver')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
            activeRole === 'driver'
              ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200 font-bold'
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>Driver App</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        <button
          onClick={() => setActiveRole('parent')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
            activeRole === 'parent'
              ? 'bg-sky-50 text-sky-800 shadow-xs border border-sky-200 font-bold'
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>Parent Live</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-sky-500 text-white rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveRole('standin')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
            activeRole === 'standin'
              ? 'bg-amber-50 text-amber-800 shadow-xs border border-amber-200 font-bold'
              : 'hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Stand-in Link
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action & Utilities */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Voice Announcement Audio Toggle */}
        <button
          onClick={() => setSpeechEnabled(!speechEnabled)}
          title={speechEnabled ? 'Voice announcements ON' : 'Voice announcements MUTED'}
          className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
            speechEnabled
              ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
        >
          {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Live GPS Simulation Engine Toggle */}
        <button
          onClick={() => setIsSimulatingDrive(!isSimulatingDrive)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            isSimulatingDrive
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isSimulatingDrive ? 'text-emerald-600 animate-spin' : 'text-slate-400'}`} />
          <span className="hidden md:inline whitespace-nowrap">
            {isSimulatingDrive ? 'Sim 10s Ticker: Active' : 'Simulation: Paused'}
          </span>
        </button>

        {/* Emergency / Replacement Alert trigger */}
        {onOpenEmergencyModal && (
          <button
            onClick={onOpenEmergencyModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Replacement Bus</span>
          </button>
        )}
      </div>
    </header>
  );
};
