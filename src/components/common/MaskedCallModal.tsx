import React, { useState, useEffect, useRef } from 'react';
import { ActiveCallState } from '../../types/transport';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  Lock,
  Radio,
  Check,
  PhoneCall
} from 'lucide-react';

interface MaskedCallModalProps {
  callState: ActiveCallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

export const MaskedCallModal: React.FC<MaskedCallModalProps> = ({
  callState,
  onEndCall,
  onToggleMute,
  onToggleSpeaker
}) => {
  const [duration, setDuration] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize realistic dual-frequency in-app phone ringing sound
  useEffect(() => {
    const playRingBurst = () => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = audioContextRef.current || new AudioCtx();
        audioContextRef.current = ctx;

        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        // Dual-tone frequency (440Hz standard dial/ring)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.setValueAtTime(0.05, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.4);
        osc2.stop(now + 1.4);
      } catch {
        // Fallback if audio policy blocked
      }
    };

    // First ring immediately
    playRingBurst();
    ringIntervalRef.current = setInterval(playRingBurst, 3200);

    // Auto-connect if not manually tapped after 3.2 seconds
    const autoConnectTimer = setTimeout(() => {
      setIsConnected(true);
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    }, 3200);

    return () => {
      clearTimeout(autoConnectTimer);
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleManualAccept = () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    setIsConnected(true);
  };

  // Duration timer once connected
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-[36px] shadow-2xl overflow-hidden p-6 text-slate-900 flex flex-col items-center">
        {/* Security / Number Masking Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-5 border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>In-App VoIP Only · Number Strictly Hidden</span>
        </div>

        {/* Circular Avatar */}
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 ring-4 ring-emerald-500/20">
            <img
              src={callState.avatarUrl}
              alt={callState.receiverName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          {isConnected ? (
            <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow">
              <Radio className="w-3.5 h-3.5 text-white animate-spin" />
            </span>
          ) : (
            <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center shadow animate-bounce">
              <PhoneCall className="w-3.5 h-3.5 text-white" />
            </span>
          )}
        </div>

        {/* Receiver Identity */}
        <h3 className="text-xl font-bold tracking-tight text-slate-900 text-center">
          {callState.receiverName}
        </h3>
        <p className="text-xs font-medium text-slate-500 capitalize mb-1">
          {callState.receiverRole === 'driver' ? 'THE SOUTH INDIAN SCHOOL Driver' : 'Student Parent / Guardian'}
        </p>

        {/* Masked Phone Number (Raw Number is strictly hidden from dialer) */}
        <div className="mt-1 font-mono text-xs font-bold text-slate-700 tracking-wider bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
          {callState.maskedNumber}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 text-center">
          Ringing inside the app · Will NOT open your phone's dialer
        </span>

        {/* Call Status / Duration Indicator */}
        <div className="my-5 text-center w-full">
          {!isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-sky-700 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></span>
                <span>Ringing inside app...</span>
              </div>

              {/* Explicit Answer Button during Ringing */}
              <div className="flex justify-center gap-3 pt-1">
                <button
                  onClick={handleManualAccept}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Answer Call</span>
                </button>
                <button
                  onClick={onEndCall}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-2xl font-mono font-bold text-slate-900">
                {formatDuration(duration)}
              </span>
              <div className="flex items-center justify-center gap-1 mt-1 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HD In-App Voice Connected</span>
              </div>
            </div>
          )}
        </div>

        {/* Audio Visualizer Waves (Simulated during connection) */}
        {isConnected && (
          <div className="flex items-center gap-1 mb-6 h-6">
            <span className="w-1 bg-emerald-500 rounded-full h-2 animate-pulse"></span>
            <span className="w-1 bg-emerald-500 rounded-full h-5 animate-pulse delay-75"></span>
            <span className="w-1 bg-emerald-500 rounded-full h-6 animate-pulse delay-150"></span>
            <span className="w-1 bg-emerald-500 rounded-full h-3 animate-pulse delay-100"></span>
            <span className="w-1 bg-emerald-500 rounded-full h-6 animate-pulse delay-200"></span>
            <span className="w-1 bg-emerald-500 rounded-full h-2 animate-pulse"></span>
          </div>
        )}

        {/* Action Controls when Connected */}
        {isConnected && (
          <div className="w-full grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            {/* Mute */}
            <button
              onClick={onToggleMute}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all ${
                callState.isMuted
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-[11px] font-semibold">{callState.isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 transition-all hover:scale-105"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="text-[11px] font-semibold">End</span>
            </button>

            {/* Speaker */}
            <button
              onClick={onToggleSpeaker}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all ${
                callState.isSpeaker
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {callState.isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span className="text-[11px] font-semibold">{callState.isSpeaker ? 'Speaker' : 'Earpiece'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
