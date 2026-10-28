/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TransportProvider, useTransport } from './context/TransportContext';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DriverApp } from './components/driver/DriverApp';
import { ParentApp } from './components/parent/ParentApp';
import { StandinDriverView } from './components/standin/StandinDriverView';
import { MaskedCallModal } from './components/common/MaskedCallModal';
import { X, ShieldAlert, Bus as BusIcon, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    notifications,
    markNotificationAsRead,
    activeCall,
    endMaskedCall,
    toggleCallMute,
    toggleCallSpeaker
  } = useTransport();

  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; type: string } | null>(null);

  // Auto-detect hash route e.g. #standin
  useEffect(() => {
    if (window.location.hash.includes('standin')) {
      setActiveRole('standin');
    }
  }, [setActiveRole]);

  // Toast listener for recent incoming unread notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (!latest.read) {
        setActiveToast({
          id: latest.id,
          title: latest.title,
          message: latest.message,
          type: latest.type
        });
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white font-sans">
      {/* 3-zone Top Bar Contract */}
      <Header onOpenEmergencyModal={() => setIsReplacementModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeRole === 'admin' && (
          <AdminDashboard
            isReplacementModalOpen={isReplacementModalOpen}
            setIsReplacementModalOpen={setIsReplacementModalOpen}
          />
        )}

        {activeRole === 'driver' && <DriverApp />}

        {activeRole === 'parent' && <ParentApp />}

        {activeRole === 'standin' && <StandinDriverView />}
      </main>

      {/* Active Masked In-App VoIP Call Screen */}
      {activeCall && (
        <MaskedCallModal
          callState={activeCall}
          onEndCall={endMaskedCall}
          onToggleMute={toggleCallMute}
          onToggleSpeaker={toggleCallSpeaker}
        />
      )}

      {/* Live Toast Notification Popup */}
      {activeToast && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200 text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            {activeToast.type === 'replacement_alert' ? (
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            ) : activeToast.type === 'stop_reached' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <BusIcon className="w-4 h-4 text-sky-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs text-slate-900 truncate">{activeToast.title}</div>
            <div className="text-xs text-slate-600 mt-0.5 line-clamp-2">{activeToast.message}</div>
          </div>

          <button
            onClick={() => {
              markNotificationAsRead(activeToast.id);
              setActiveToast(null);
            }}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 bg-white">
        <span>BusTrak Unified Fleet System · </span>
        <span className="text-slate-500">Oakridge School District #412 · All 3 Apps Integrated</span>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TransportProvider>
      <AppContent />
    </TransportProvider>
  );
}
