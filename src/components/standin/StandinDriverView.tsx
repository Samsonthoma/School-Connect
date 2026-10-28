import React, { useState, useEffect, useRef } from 'react';
import { useTransport } from '../../context/TransportContext';
import {
  Share2,
  Navigation,
  Smartphone,
  CheckCircle,
  Copy,
  ChevronRight
} from 'lucide-react';

export const StandinDriverView: React.FC = () => {
  const { buses, routes, updateBusPosition, advanceBusToNextStop, startTrip } = useTransport();

  const [selectedBusId, setSelectedBusId] = useState<string>('bus-12');
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const bus = buses.find(b => b.id === selectedBusId) || buses[0];
  const route = routes.find(r => r.id === bus.routeId) || routes[0];

  const standinUrl = `${window.location.origin}/#standin?bus=${bus.id}&token=token-${Date.now()}`;

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(
      `Hello driver, here is your one-click BusTrak live tracking link for ${bus.busName} (${bus.numberPlate}) today: ${standinUrl}. No installation needed—just open the link in Chrome/Safari and tap Start Tracking.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(standinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBrowserTracking = () => {
    if (!isTracking) {
      if (!bus.isTripActive) {
        startTrip(bus.id, 'morning');
      }

      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 32;
            setLastCoords({ lat, lng });
            updateBusPosition(bus.id, lat, lng, speed);
          },
          () => {},
          { enableHighAccuracy: true }
        );
      }
      setIsTracking(true);
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6 text-slate-900">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Stand-in Driver Web Tracking Link</h2>
            <p className="text-xs text-slate-500">
              One-click WhatsApp link for relief drivers — runs directly in mobile browser with zero install
            </p>
          </div>
        </div>

        {/* Bus Selector */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Select Target Fleet Vehicle</label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-medium px-3 py-2.5 rounded-xl focus:outline-none focus:border-amber-500"
          >
            {buses.map(b => (
              <option key={b.id} value={b.id}>
                {b.busName} ({b.numberPlate}) — Route {routes.find(r => r.id === b.routeId)?.code}
              </option>
            ))}
          </select>
        </div>

        {/* WhatsApp & Copy Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleShareWhatsapp}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Send Direct Link on WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link' : 'Copy URL'}</span>
          </button>
        </div>
      </div>

      {/* Stand-in Driver's Mobile Web Screen Mockup */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Driver Mobile Web Browser View
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
            No Install Needed
          </span>
        </div>

        <div className="text-center space-y-1">
          <div className="text-xl font-bold text-slate-900">{bus.busName}</div>
          <div className="text-xs text-slate-500">
            Assigned Run: {route.name} · Plate: {bus.numberPlate}
          </div>
        </div>

        {/* Big Start Web Tracking Button */}
        <button
          onClick={toggleBrowserTracking}
          className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            isTracking
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-200'
          }`}
        >
          <Navigation className={`w-5 h-5 ${isTracking ? 'animate-spin' : ''}`} />
          <span>{isTracking ? 'Stop Web GPS Tracking' : 'Start Web GPS Tracking'}</span>
        </button>

        {isTracking && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1 text-center animate-pulse">
            <div className="font-semibold">Live GPS Streaming to Oakridge Central Fleet</div>
            <div className="text-[11px] text-emerald-700 font-mono">
              Coordinates: {lastCoords ? `${lastCoords.lat.toFixed(4)}, ${lastCoords.lng.toFixed(4)}` : `${bus.currentLat.toFixed(4)}, ${bus.currentLng.toFixed(4)}`}
            </div>
          </div>
        )}

        {/* Step Forward / Simulation Helper */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={() => advanceBusToNextStop(bus.id)}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Simulate Advancing to Next Stop</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
