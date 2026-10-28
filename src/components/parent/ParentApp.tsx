import React, { useState } from 'react';
import { useTransport } from '../../context/TransportContext';
import { LeafletMap } from '../common/LeafletMap';
import { FeesPaymentModal } from '../common/FeesPaymentModal';
import {
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2,
  Bus as BusIcon,
  ShieldAlert,
  ChevronDown,
  Navigation,
  PhoneCall,
  CreditCard,
  Lock,
  ArrowRight
} from 'lucide-react';

export const ParentApp: React.FC = () => {
  const {
    students,
    buses,
    routes,
    drivers,
    fees,
    activeTrip,
    selectedChildId,
    setSelectedChildId,
    notifications,
    speechEnabled,
    setSpeechEnabled,
    speakAnnouncement,
    markNotificationAsRead,
    startMaskedCall,
    payFee
  } = useTransport();

  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isFeesModalOpen, setIsFeesModalOpen] = useState(false);

  const selectedStudent = students.find(s => s.id === selectedChildId) || students[0];
  const assignedBus = buses.find(b => b.id === selectedStudent.busId) || buses[0];
  const assignedRoute = routes.find(r => r.id === assignedBus.routeId) || routes[0];
  const assignedDriver = drivers.find(d => d.id === assignedBus.assignedDriverId) || drivers[0];
  const assignedStop = assignedRoute.stops.find(s => s.id === selectedStudent.stopId) || assignedRoute.stops[0];

  const isTripActive = assignedBus.isTripActive;

  // Calculate ETA to assigned stop
  const currentStopIndex = activeTrip?.currentStopIndex || 0;
  const stopIndex = assignedRoute.stops.findIndex(s => s.id === assignedStop.id);
  const stopsAway = Math.max(0, stopIndex - currentStopIndex);

  let etaMinutes = 0;
  let statusText = 'Trip not started yet';
  if (isTripActive) {
    if (selectedStudent.attendanceStatus === 'present') {
      statusText = 'Onboard Bus · En route to School';
      etaMinutes = Math.max(5, (assignedRoute.stops.length - currentStopIndex) * 4);
    } else if (stopsAway === 0) {
      statusText = 'Bus Arrived at Your Stop Now!';
      etaMinutes = 0;
    } else {
      etaMinutes = stopsAway * 4 + 2;
      statusText = `Approx. ${etaMinutes} mins away (${stopsAway} stop${stopsAway > 1 ? 's' : ''} prior)`;
    }
  }

  const childNotifications = notifications.filter(
    n => n.busId === assignedBus.id || n.studentId === selectedStudent.id
  );

  const studentFees = fees.filter(f => f.studentId === selectedStudent.id);
  const pendingFees = studentFees.filter(f => f.status === 'pending' || f.status === 'overdue');
  const totalPendingAmount = pendingFees.reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4 text-slate-900">
      {/* Top Child Selector Strip */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Circular Student Photo Avatar */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-sky-400 shrink-0 bg-slate-100 shadow-sm">
            <img
              src={selectedStudent.photoUrl}
              alt={selectedStudent.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">{selectedStudent.name}</span>
              <span className="text-xs bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-md border border-sky-200">
                {selectedStudent.grade}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Parent: {selectedStudent.parentName}</span>
              <span>·</span>
              <span className="text-slate-700 font-medium">{assignedStop.name}</span>
            </div>
          </div>
        </div>

        {/* Controls and Switchers */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="appearance-none bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Voice Announcement Audio Toggle */}
          <button
            onClick={() => {
              const next = !speechEnabled;
              setSpeechEnabled(next);
              if (next) speakAnnouncement(`Voice announcements activated for ${selectedStudent.name}`);
            }}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              speechEnabled
                ? 'bg-sky-50 border-sky-300 text-sky-700'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title="Spoken audio arrival alerts"
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
            className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
            title="Push alerts"
          >
            <Bell className="w-4 h-4" />
            {childNotifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* School Fees Payment Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-white border border-sky-200 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>School & Transport Fees</span>
              {totalPendingAmount > 0 ? (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Due: ₹{totalPendingAmount.toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  All Fees Paid
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Online UPI (GPay/PhonePe), RuPay card, or Net Banking with instant official receipt
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFeesModalOpen(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Manage / Pay Fees</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Replacement Bus / Driver Alert Banner */}
      {assignedBus.replacement?.isActive && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 shadow-sm text-amber-900 animate-in fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-amber-950 text-sm">
                Temporary Replacement Bus & Driver Active
              </div>
              <div>
                Notice: Regular {assignedBus.busName} is temporarily serviced by{' '}
                <strong className="text-slate-900">{assignedBus.replacement.tempBusNumber}</strong>.
              </div>
              <div className="text-amber-800">
                Driver: <strong className="text-slate-900">{assignedBus.replacement.tempDriverName}</strong> ·
                Reason: {assignedBus.replacement.reason}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live ETA & Arrival Status Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isTripActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'
            }`}>
              <BusIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>{assignedBus.busName}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                  isTripActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isTripActive ? 'LIVE ON ROUTE' : 'AT DEPOT'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Route: {assignedRoute.name} ({assignedRoute.code})
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono tracking-tight text-slate-900">
              {isTripActive ? (etaMinutes > 0 ? `${etaMinutes}m` : 'HERE') : '--'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">ETA to your stop</div>
          </div>
        </div>

        {/* Dynamic status pill */}
        <div className="flex items-center justify-between text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>{statusText}</span>
          </div>
          <span className="font-mono text-emerald-700 font-semibold text-[11px]">
            {isTripActive ? `${assignedBus.currentSpeedKmh} km/h` : '0 km/h'}
          </span>
        </div>

        {/* Assigned Driver Profile with In-App Masked Calling */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-200 shadow-xs">
              <img
                src={assignedDriver.photoUrl}
                alt={assignedDriver.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{assignedDriver.name}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Licensed Fleet Driver</span>
                <span>·</span>
                <span className="font-mono">{assignedBus.numberPlate}</span>
              </div>
            </div>
          </div>

          {/* Masked In-App VoIP Call Driver (Phone Number strictly hidden from dialer) */}
          <button
            onClick={() =>
              startMaskedCall(
                'parent',
                'driver',
                selectedStudent.parentName,
                assignedDriver.name,
                assignedDriver.photoUrl,
                assignedDriver.phone
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            title="Encrypted in-app call (driver's phone number is hidden)"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Driver</span>
          </button>
        </div>

        {/* Child Boarding Status */}
        <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className={`w-5 h-5 ${
              selectedStudent.attendanceStatus === 'present' ? 'text-emerald-600' : 'text-slate-400'
            }`} />
            <div>
              <div className="font-semibold text-xs text-slate-900">
                {selectedStudent.attendanceStatus === 'present'
                  ? `Boarded: ${selectedStudent.boardTime}`
                  : selectedStudent.attendanceStatus === 'absent'
                  ? 'Marked Absent Today'
                  : 'Awaiting Boarding'}
              </div>
              <div className="text-[11px] text-slate-500">
                Stop: {assignedStop.name} (Scheduled: {assignedStop.scheduledTimeMorning})
              </div>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-lg font-bold font-mono ${
            selectedStudent.attendanceStatus === 'present'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-100 text-slate-600'
          }`}>
            {selectedStudent.attendanceStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Live Interactive Map (Normal street view with pulsing green active marker) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Navigation className="w-4 h-4 text-sky-600" />
            <span>Live Interactive GPS Map (Standard Street View)</span>
          </div>
          <span className="text-slate-500 text-[11px] font-mono">Auto-refreshes every 10s</span>
        </div>

        <div className="h-[420px] w-full">
          <LeafletMap
            buses={[assignedBus]}
            route={assignedRoute}
            activeBusId={assignedBus.id}
            highlightedStopId={assignedStop.id}
            center={[assignedBus.currentLat, assignedBus.currentLng]}
            zoom={14}
          />
        </div>
      </div>

      {/* Push Notifications Drawer Modal */}
      {isNotifDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl text-slate-900 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Bell className="w-4 h-4 text-sky-600" />
                <span>Push Alerts & Trip Activity</span>
              </div>
              <button
                onClick={() => setIsNotifDrawerOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto mt-2">
              {childNotifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No alerts yet today</div>
              ) : (
                childNotifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`py-3 px-2 transition-colors cursor-pointer rounded-xl hover:bg-slate-50 ${
                      !n.read ? 'bg-sky-50/50 font-medium' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* School & Transport Fees Modal */}
      {isFeesModalOpen && (
        <FeesPaymentModal
          student={selectedStudent}
          fees={fees}
          onClose={() => setIsFeesModalOpen(false)}
          onPayFee={(feeId, method) => payFee(feeId, method)}
        />
      )}
    </div>
  );
};
