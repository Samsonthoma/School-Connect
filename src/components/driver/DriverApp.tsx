import React, { useState, useEffect, useRef } from 'react';
import { useTransport } from '../../context/TransportContext';
import {
  Navigation,
  QrCode,
  MapPin,
  Clock,
  Compass,
  Sparkles,
  Smartphone,
  LogOut,
  ChevronRight,
  Check,
  XCircle,
  PhoneCall,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DriverApp: React.FC = () => {
  const {
    buses,
    routes,
    drivers,
    students,
    activeTrip,
    startTrip,
    completeTrip,
    markArrivalAtStop,
    markAttendance,
    advanceBusToNextStop,
    updateBusPosition,
    startMaskedCall
  } = useTransport();

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [schoolCode, setSchoolCode] = useState<string>('SIS-2026');
  const [driverEmail, setDriverEmail] = useState<string>('ramesh.yadav@southindianschool.org');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('driver-1');

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Phone real GPS tracking state
  const [usePhoneGps, setUsePhoneGps] = useState<boolean>(false);
  const geoWatchId = useRef<number | null>(null);

  const currentDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];
  const assignedBus = buses.find(b => b.assignedDriverId === currentDriver.id) || buses[0];
  const assignedRoute = routes.find(r => r.id === assignedBus.routeId) || routes[0];

  const currentStopIndex = activeTrip?.currentStopIndex || 0;
  const currentStop = assignedRoute.stops[currentStopIndex] || assignedRoute.stops[0];
  const isTripInProgress = activeTrip && activeTrip.status === 'in_progress' && activeTrip.busId === assignedBus.id;

  const studentsAtCurrentStop = students.filter(
    s => s.busId === assignedBus.id && s.stopId === currentStop?.id
  );

  const allBusStudents = students.filter(s => s.busId === assignedBus.id);
  const boardedCount = allBusStudents.filter(s => s.attendanceStatus === 'present').length;

  // Real GPS Geolocation Watcher
  useEffect(() => {
    if (usePhoneGps && isTripInProgress && navigator.geolocation) {
      geoWatchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 25;
          const heading = pos.coords.heading || 0;
          updateBusPosition(assignedBus.id, lat, lng, speed, heading);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    } else {
      if (geoWatchId.current !== null) {
        navigator.geolocation.clearWatch(geoWatchId.current);
        geoWatchId.current = null;
      }
    }

    return () => {
      if (geoWatchId.current !== null) {
        navigator.geolocation.clearWatch(geoWatchId.current);
      }
    };
  }, [usePhoneGps, isTripInProgress, assignedBus.id, updateBusPosition]);

  const handleProcessScanToken = (token: string) => {
    const matched = students.find(s => s.qrCodeToken.toLowerCase() === token.trim().toLowerCase());
    if (matched) {
      markAttendance(matched.id, 'present', 'qr');
      setScanMessage(`Verified: ${matched.name} boarded!`);
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      } catch {
        // fallback
      }
      setTimeout(() => {
        setIsScannerOpen(false);
        setScanMessage(null);
      }, 1200);
    } else {
      setScanMessage('Invalid QR Pass. Student not found in fleet roster.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-slate-100">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-4">
            <Smartphone className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-center text-slate-900">Driver Android Portal</h2>
          <p className="text-xs text-center text-slate-500 mt-1 mb-6">Enter School Code and Registered Email</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">School Code</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:border-emerald-500"
                placeholder="e.g. SIS-2026"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Driver Email</label>
              <select
                value={driverEmail}
                onChange={(e) => {
                  setDriverEmail(e.target.value);
                  const d = drivers.find(drv => drv.email === e.target.value);
                  if (d) setSelectedDriverId(d.id);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.email}>
                    {d.name} ({d.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-md"
            >
              Log In to Android Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-6 bg-white border border-slate-300 rounded-[36px] overflow-hidden shadow-2xl text-slate-900 flex flex-col min-h-[760px]">
      {/* Android Mobile Status Bar Mock */}
      <div className="bg-slate-100 px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-600 border-b border-slate-200">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <span>07:25</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </div>
        <div className="flex items-center gap-2">
          <span>5G</span>
          <span>{assignedBus.deviceHealth.batteryLevel}%</span>
          <div className="w-4 h-2 border border-slate-500 rounded-xs flex p-0.5">
            <div className="w-3/4 bg-emerald-500 h-full rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Driver Identity Card */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Circular Photo Avatar */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0 bg-slate-200">
              <img
                src={currentDriver.photoUrl}
                alt={currentDriver.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>{currentDriver.name}</span>
                <span className="text-[10px] bg-slate-200 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                  {currentDriver.schoolCode}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <span>{assignedBus.busName}</span>
                <span>·</span>
                <span>{assignedRoute.code}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsLoggedIn(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Replacement Banner if active */}
        {assignedBus.replacement?.isActive && (
          <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
            <div>
              <span className="font-bold">Substituted:</span> {assignedBus.replacement.tempBusNumber}
              <div className="text-[11px] text-amber-700">Covering for regular fleet vehicle</div>
            </div>
            <span className="text-[10px] font-mono bg-amber-100 px-2 py-0.5 rounded text-amber-800 font-semibold">
              Active
            </span>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 space-y-4 overflow-y-auto">
        {/* Big Start / End Trip CTA */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Run: {assignedRoute.name}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <Compass className={`w-3.5 h-3.5 ${isTripInProgress ? 'text-emerald-600 animate-spin' : 'text-slate-400'}`} />
              <span className={isTripInProgress ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
                {isTripInProgress ? 'GPS Active (Background)' : 'Stationary'}
              </span>
            </div>
          </div>

          {!isTripInProgress ? (
            <button
              onClick={() => startTrip(assignedBus.id, 'morning')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
            >
              <Navigation className="w-5 h-5 fill-current" />
              Start Morning Trip
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => advanceBusToNextStop(assignedBus.id)}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  Simulate Reach Next Stop
                </button>
                <button
                  onClick={() => completeTrip(assignedBus.id)}
                  className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  End Trip
                </button>
              </div>

              {/* Stop arrival indicator */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-xs">
                <div>
                  <div className="text-[11px] text-slate-500">Approaching Stop:</div>
                  <div className="font-semibold text-slate-900">{currentStop?.name}</div>
                </div>
                <button
                  onClick={() => markArrivalAtStop(currentStop.id)}
                  disabled={activeTrip?.visitedStopIds.includes(currentStop.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeTrip?.visitedStopIds.includes(currentStop.id)
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  }`}
                >
                  {activeTrip?.visitedStopIds.includes(currentStop.id) ? 'Arrived (120m)' : 'Tap Arrived'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tracking Hardware Source Toggle */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-800">Tracking Engine</div>
            <div className="text-[11px] text-slate-500 capitalize">
              {assignedBus.trackingSource.replace('_', ' ')}
            </div>
          </div>
          <button
            onClick={() => setUsePhoneGps(!usePhoneGps)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              usePhoneGps
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {usePhoneGps ? 'Phone GPS: ON' : 'Use Phone GPS'}
          </button>
        </div>

        {/* QR Scan Action Bar */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Student QR Card</span>
          </button>
        </div>

        {/* Student Roster per Stop */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>Roster for: {currentStop?.name}</span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {boardedCount}/{allBusStudents.length} Boarded
            </span>
          </div>

          <div className="space-y-2">
            {studentsAtCurrentStop.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl text-xs text-slate-400">
                No students registered at this stop
              </div>
            ) : (
              studentsAtCurrentStop.map(student => {
                const isPresent = student.attendanceStatus === 'present';
                const isAbsent = student.attendanceStatus === 'absent';

                return (
                  <div
                    key={student.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Circular student photo */}
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-xs truncate">{student.name}</div>
                        <div className="text-[11px] text-slate-500">{student.grade} · {student.parentName}</div>
                        {student.boardTime && (
                          <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono font-medium">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Boarded {student.boardTime} ({student.boardMethod?.toUpperCase()})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Calling and Attendance controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Masked In-App VoIP Call Parent (Hidden Number) */}
                      <button
                        onClick={() =>
                          startMaskedCall(
                            'driver',
                            'parent',
                            currentDriver.name,
                            student.parentName,
                            student.photoUrl,
                            student.parentPhone
                          )
                        }
                        title="Encrypted in-app call to parent (number hidden)"
                        className="p-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>

                      {/* Present */}
                      <button
                        onClick={() => markAttendance(student.id, 'present', 'manual')}
                        title="Mark Present"
                        className={`p-2 rounded-xl text-xs font-bold transition-all ${
                          isPresent
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:text-emerald-700 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {/* Absent */}
                      <button
                        onClick={() => markAttendance(student.id, 'absent', 'manual')}
                        title="Mark Absent"
                        className={`p-2 rounded-xl text-xs font-bold transition-all ${
                          isAbsent
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:text-rose-700 hover:bg-slate-200'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner / Simulation Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-sm">QR Boarding Scanner</span>
              </div>
              <button
                onClick={() => {
                  setIsScannerOpen(false);
                  setScanMessage(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="relative my-4 aspect-square bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 text-white">
              <div className="w-48 h-48 border-2 border-dashed border-indigo-400 rounded-xl relative flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse rounded-lg"></div>
                <div className="text-center p-3">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-spin" />
                  <span className="text-xs text-slate-300">Point phone camera at student pass</span>
                </div>
              </div>

              {scanMessage && (
                <div className="absolute bottom-3 left-3 right-3 p-2 bg-slate-950/95 border border-indigo-500/50 rounded-lg text-xs text-center font-medium text-emerald-400">
                  {scanMessage}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-600">Quick Test Scan Student:</div>
              <div className="grid grid-cols-2 gap-2">
                {allBusStudents.slice(0, 4).map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleProcessScanToken(s.qrCodeToken)}
                    className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left text-xs transition-colors flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                      <img src={s.photoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="truncate font-medium text-slate-900">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
