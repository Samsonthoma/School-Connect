import React, { useState, useEffect, useRef } from 'react';
import { useTransport } from '../../context/TransportContext';
import { LeafletMap } from '../common/LeafletMap';
import { QrCardModal } from '../common/QrCardModal';
import {
  Bus as BusIcon,
  MapPin,
  Users,
  History,
  Activity,
  Plus,
  Trash2,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  ShieldAlert,
  RefreshCw,
  QrCode,
  Radio,
  Clock,
  CreditCard,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { Student, Stop, Bus, Route, TripHistoryRecord, FeeItem } from '../../types/transport';

type AdminTab = 'fleet' | 'routes' | 'health' | 'students' | 'fees' | 'replay';

export const AdminDashboard: React.FC<{
  isReplacementModalOpen: boolean;
  setIsReplacementModalOpen: (open: boolean) => void;
}> = ({ isReplacementModalOpen, setIsReplacementModalOpen }) => {
  const {
    buses,
    routes,
    drivers,
    students,
    fees,
    tripHistory,
    checkGpsHealthNow,
    toggleDeviceHealthProp,
    setReplacementBusAndDriver,
    revertReplacement,
    addStopToRoute,
    updateStopPosition,
    updateStopDetails,
    removeStopFromRoute,
    bulkImportStudents,
    updateStudentPhoto,
    markAttendance,
    startTrip,
    completeTrip,
    payFee
  } = useTransport();

  const [activeTab, setActiveTab] = useState<AdminTab>('fleet');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || 'route-101');
  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0]?.id || 'bus-12');
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);

  // Stop editor states
  const [isEditingStops, setIsEditingStops] = useState<boolean>(true);
  const [isAddingStopPin, setIsAddingStopPin] = useState<boolean>(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  // Fees Filter
  const [feeCategoryFilter, setFeeCategoryFilter] = useState<string>('all');

  // CSV Import state
  const [csvText, setCsvText] = useState<string>('');
  const [csvImportMessage, setCsvImportMessage] = useState<string | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);

  // Device health diagnostics
  const [diagnosticResult, setDiagnosticResult] = useState<{ busId: string; message: string } | null>(null);
  const [isProbing, setIsProbing] = useState<boolean>(false);

  // Replacement Form state
  const [repBusId, setRepBusId] = useState<string>(buses[0]?.id || 'bus-12');
  const [tempBusNumber, setTempBusNumber] = useState<string>('UP 62 T 9940 (Reserve Force Bus)');
  const [tempDriverName, setTempDriverName] = useState<string>('Manoj Kumar Bind');
  const [tempDriverPhone, setTempDriverPhone] = useState<string>('+91 95325 46785');
  const [repReason, setRepReason] = useState<string>('Bus 12 scheduled fitness & brake inspection');
  const [repAutoRevert, setRepAutoRevert] = useState<string>('Tomorrow at 06:00 AM');

  // Ride Replay state
  const [selectedReplayTripId, setSelectedReplayTripId] = useState<string>(tripHistory[0]?.id || '');
  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
  const selectedBus = buses.find(b => b.id === selectedBusId) || buses[0];
  const selectedReplayTrip = tripHistory.find(t => t.id === selectedReplayTripId) || tripHistory[0];

  // Ride Replay Animation Player
  useEffect(() => {
    if (isReplaying && selectedReplayTrip && selectedReplayTrip.breadcrumbs.length > 0) {
      replayTimerRef.current = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= selectedReplayTrip.breadcrumbs.length - 1) {
            setIsReplaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    }
    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [isReplaying, selectedReplayTrip]);

  // Handle Map Click to Drop Stop Pin
  const handleMapAddStop = (lat: number, lng: number) => {
    const nextNum = selectedRoute.stops.length + 1;
    addStopToRoute(selectedRoute.id, `New Pickup Stop #${nextNum}`, lat, lng);
    setIsAddingStopPin(false);
  };

  // Handle Stop Marker Drag-End
  const handleStopDragEnd = (stopId: string, lat: number, lng: number) => {
    updateStopPosition(selectedRoute.id, stopId, lat, lng);
  };

  // Run Check Now hardware diagnostic probe
  const handleCheckHealth = async (busId: string) => {
    setIsProbing(true);
    const msg = await checkGpsHealthNow(busId);
    setDiagnosticResult({ busId, message: msg });
    setIsProbing(false);
  };

  // Process CSV Import
  const handleImportCsv = () => {
    if (!csvText.trim()) return;
    const res = bulkImportStudents(csvText);
    if (res.errors.length > 0) {
      setCsvImportMessage(`Error: ${res.errors.join(', ')}`);
    } else {
      setCsvImportMessage(`Successfully imported ${res.added} students into fleet roster!`);
      setTimeout(() => {
        setIsCsvModalOpen(false);
        setCsvImportMessage(null);
        setCsvText('');
      }, 1500);
    }
  };

  // Submit Replacement Bus & Driver
  const handleSaveReplacement = (e: React.FormEvent) => {
    e.preventDefault();
    setReplacementBusAndDriver(
      repBusId,
      tempBusNumber,
      tempDriverName,
      tempDriverPhone,
      repReason,
      repAutoRevert
    );
    setIsReplacementModalOpen(false);
  };

  // Filtered fees
  const filteredFees = fees.filter(f =>
    feeCategoryFilter === 'all' ? true : f.category === feeCategoryFilter
  );

  const totalAssessed = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalCollected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalOutstanding = totalAssessed - totalCollected;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-900">
      {/* Admin Tab Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>THE SOUTH INDIAN SCHOOL · Fleet Command</span>
            <span className="text-xs bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded font-mono font-semibold">
              Shahganj, Jaunpur
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shahganj, Jaunpur, UP - 223101 · School Helpline: +91 9598142455 / +91 9532546785
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1 rounded-2xl text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'fleet' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BusIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Fleet Map</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'routes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Route & Stop Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'health' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>GPS Health</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'students' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>Students & Photos</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'fees' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-600" />
            <span>School Fees</span>
          </button>

          <button
            onClick={() => setActiveTab('replay')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'replay' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-rose-600" />
            <span>Ride Replay</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FLEET MAP */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>District Fleet Map (Normal Street View)</span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Pulsing green = active trip · 10s auto-refresh
                </div>
              </div>

              <div className="h-[520px] w-full">
                <LeafletMap
                  buses={buses}
                  route={selectedRoute}
                  activeBusId={selectedBusId}
                  center={[26.0538, 82.6845]}
                  zoom={12}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-2 border-b border-slate-100">
                <span>Fleet Roster ({buses.length})</span>
                <button
                  onClick={() => setIsReplacementModalOpen(true)}
                  className="text-amber-700 hover:text-amber-800 flex items-center gap-1 text-[11px] font-semibold"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Assign Replacement</span>
                </button>
              </div>

              <div className="space-y-3">
                {buses.map(bus => {
                  const driver = drivers.find(d => d.id === bus.assignedDriverId);
                  const isSelected = selectedBusId === bus.id;

                  return (
                    <div
                      key={bus.id}
                      onClick={() => setSelectedBusId(bus.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50/50 border-sky-400 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${bus.isTripActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></div>
                          <span>{bus.busName}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {bus.numberPlate}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 my-2">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <img
                            src={driver?.photoUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs min-w-0">
                          <div className="text-slate-900 font-semibold truncate">{driver?.name}</div>
                          <div className="text-slate-500 text-[11px]">
                            Tracker: <strong className="capitalize text-slate-700">{bus.trackingSource.replace('_', ' ')}</strong>
                          </div>
                        </div>
                      </div>

                      {bus.replacement?.isActive && (
                        <div className="mt-2 p-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                          <strong>Replaced by:</strong> {bus.replacement.tempBusNumber} ({bus.replacement.tempDriverName})
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-700 font-semibold text-[11px]">
                          {bus.isTripActive ? `${bus.currentSpeedKmh} km/h en route` : 'Idle at Base'}
                        </span>
                        <div className="flex items-center gap-2">
                          {bus.isTripActive ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                completeTrip(bus.id);
                              }}
                              className="text-[11px] px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 font-semibold"
                            >
                              Stop Run
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startTrip(bus.id, 'morning');
                              }}
                              className="text-[11px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 font-semibold"
                            >
                              Start Run
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROUTE & STOP EDITOR */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Interactive Map Stop Editor</span>
                  <span className="text-slate-500">· Click map to drop pin or drag existing markers</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddingStopPin(!isAddingStopPin)}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                      isAddingStopPin
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingStopPin ? 'Click Map to Place...' : 'Drop New Stop Pin'}</span>
                  </button>

                  <button
                    onClick={() => setIsEditingStops(!isEditingStops)}
                    className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-colors ${
                      isEditingStops
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    {isEditingStops ? 'Markers Draggable: ON' : 'Markers Draggable: OFF'}
                  </button>
                </div>
              </div>

              <div className="h-[520px] w-full">
                <LeafletMap
                  route={selectedRoute}
                  isEditingStops={isEditingStops}
                  isAddingStop={isAddingStopPin}
                  onMapClick={handleMapAddStop}
                  onStopDragEnd={handleStopDragEnd}
                  selectedStopId={selectedStopId || undefined}
                  onSelectStop={setSelectedStopId}
                  center={[26.0538, 82.6845]}
                  zoom={13}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <label className="text-xs font-semibold text-slate-700">Select Route</label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium px-2.5 py-1.5 rounded-xl focus:outline-none"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatic Timing */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>Automatic Trips Timing</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-mono bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                    Automated
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-700">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Morning Shift:</span>
                    {selectedRoute.schedule.morningDeparture} - {selectedRoute.schedule.morningArrival}
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Afternoon Shift:</span>
                    {selectedRoute.schedule.afternoonDeparture} - {selectedRoute.schedule.afternoonArrival}
                  </div>
                </div>
              </div>

              {/* Stops list */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Stops in Order ({selectedRoute.stops.length})</span>
                  <span className="text-[11px] text-slate-500 font-mono">120m Geo-radius</span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {selectedRoute.stops.map((stop, idx) => (
                    <div
                      key={stop.id}
                      onClick={() => setSelectedStopId(stop.id)}
                      className={`p-3 rounded-2xl border text-xs transition-colors cursor-pointer ${
                        selectedStopId === stop.id
                          ? 'bg-sky-50/50 border-sky-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-sky-700 font-bold flex items-center justify-center text-[10px] border border-slate-200">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={stop.name}
                            onChange={(e) => updateStopDetails(selectedRoute.id, stop.id, { name: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent font-semibold text-slate-900 text-xs border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStopFromRoute(selectedRoute.id, stop.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 mt-2">
                        <div>
                          <span>AM: </span>
                          <input
                            type="text"
                            value={stop.scheduledTimeMorning}
                            onChange={(e) =>
                              updateStopDetails(selectedRoute.id, stop.id, {
                                scheduledTimeMorning: e.target.value
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 bg-slate-50 border border-slate-300 rounded px-1 text-slate-800"
                          />
                        </div>
                        <div>
                          <span>PM: </span>
                          <input
                            type="text"
                            value={stop.scheduledTimeAfternoon}
                            onChange={(e) =>
                              updateStopDetails(selectedRoute.id, stop.id, {
                                scheduledTimeAfternoon: e.target.value
                              })
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 bg-slate-50 border border-slate-300 rounded px-1 text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GPS HARDWARE HEALTH & TELEMETRY */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>GPS Device Health & Telemetry Prober</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live monitoring of online status, vehicle power, ignition state, and satellite fix
                </p>
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Email Dispatch: <span className="text-sky-700 font-semibold">samsonthomasminithomas@gmail.com</span>
              </div>
            </div>

            {diagnosticResult && (
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 flex items-center justify-between animate-in fade-in">
                <span>{diagnosticResult.message}</span>
                <button
                  onClick={() => setDiagnosticResult(null)}
                  className="text-slate-500 hover:text-slate-900 text-xs underline ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {buses.map(bus => {
                const { deviceHealth } = bus;

                return (
                  <div
                    key={bus.id}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">{bus.busName}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-semibold">
                        {bus.trackingSource.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Device Online:</span>
                        <button
                          onClick={() => toggleDeviceHealthProp(bus.id, 'online')}
                          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border transition-colors ${
                            deviceHealth.online
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {deviceHealth.online ? 'Online' : 'Offline'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Bus Power (13.8V):</span>
                        <button
                          onClick={() => toggleDeviceHealthProp(bus.id, 'busPower')}
                          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border transition-colors ${
                            deviceHealth.busPower
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {deviceHealth.busPower ? `${deviceHealth.voltage}V (Normal)` : 'Power Cut!'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Ignition:</span>
                        <button
                          onClick={() => toggleDeviceHealthProp(bus.id, 'ignition')}
                          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border transition-colors ${
                            deviceHealth.ignition
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {deviceHealth.ignition ? 'Ignition ON' : 'Engine OFF'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">GPS Satellites:</span>
                        <button
                          onClick={() => toggleDeviceHealthProp(bus.id, 'gpsFix')}
                          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border transition-colors ${
                            deviceHealth.gpsFix
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {deviceHealth.gpsFix ? '3D Locked' : 'No Fix'}
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                        <span>Ping: {deviceHealth.lastPing}</span>
                        <span>{deviceHealth.batteryLevel}% Batt</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCheckHealth(bus.id)}
                      disabled={isProbing}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-sky-700 border border-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
                      <span>Check Now (Live Answer)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENTS & PHOTO PROFILES */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  <span>Student Directory, Photo Profiles & QR Passes</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual confirmation at every stop, unique QR pass issuance, and bulk CSV ingestion
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCsvModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Bulk Import CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-3">Student & Avatar</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 px-3">Assigned Bus & Stop</th>
                    <th className="py-3 px-3">Guardian Contact</th>
                    <th className="py-3 px-3">Today Attendance</th>
                    <th className="py-3 px-3 text-right">QR Pass</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => {
                    const bus = buses.find(b => b.id === student.busId);
                    const route = routes.find(r => r.id === bus?.routeId);
                    const stop = route?.stops.find(s => s.id === student.stopId);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs">
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                              <label className="text-[10px] text-sky-600 hover:underline cursor-pointer block font-medium">
                                Upload Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        updateStudentPhoto(student.id, reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-medium text-slate-700">{student.grade}</td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{bus?.busName || 'Unassigned'}</div>
                          <div className="text-[11px] text-slate-500">{stop?.name || 'Assigned Stop'}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">{student.parentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{student.parentPhone}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            student.attendanceStatus === 'present'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : student.attendanceStatus === 'absent'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {student.attendanceStatus.toUpperCase()}
                            {student.boardTime ? ` (${student.boardTime})` : ''}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedStudentForQr(student)}
                            className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View QR Pass</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCHOOL & FLEET FEES */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Total Fees Assessed</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                ₹{totalAssessed.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Transport + Tuition + Lab</span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 block">Total Collected</span>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                ₹{totalCollected.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-600 mt-0.5 block">
                {Math.round((totalCollected / (totalAssessed || 1)) * 100)}% Collection Rate
              </span>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
              <span className="text-xs font-semibold text-amber-700 block">Pending Outstanding</span>
              <div className="text-2xl font-black font-mono text-amber-700 mt-1">
                ₹{totalOutstanding.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-amber-600 mt-0.5 block">Dues across fleet students</span>
            </div>
          </div>

          {/* Fees Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span>Student Fee Ledger & Receipts</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track bus passes, term tuition, and record offline/cash payments
                </p>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={feeCategoryFilter}
                  onChange={(e) => setFeeCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="transport">Transport Pass Only</option>
                  <option value="tuition">Tuition Only</option>
                  <option value="activities">Activities & Lab</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Fee Item</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFees.map(fee => {
                    const student = students.find(s => s.id === fee.studentId);

                    return (
                      <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {student?.name || 'Student'} ({student?.grade})
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-medium">{fee.title}</td>
                        <td className="py-3 px-3 capitalize">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            {fee.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          ₹{fee.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{fee.dueDate}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            fee.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {fee.status.toUpperCase()}
                          </span>
                          {fee.paidAt && (
                            <span className="text-[10px] text-slate-500 block mt-0.5">{fee.receiptNumber}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {fee.status !== 'paid' ? (
                            <button
                              onClick={() => payFee(fee.id, 'Cash / School Admin Check')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                            >
                              Record Paid
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Settled</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: TRIP HISTORY & RIDE REPLAY */}
      {activeTab === 'replay' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>Ride Replay: {selectedReplayTrip?.routeName}</span>
                </div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Red P-Pins = Standing / Idle Locations
                </div>
              </div>

              <div className="h-[460px] w-full">
                <LeafletMap
                  replayBreadcrumbs={selectedReplayTrip?.breadcrumbs || []}
                  replayIdleLocations={selectedReplayTrip?.idleLocations || []}
                  replayCurrentIndex={replayIndex}
                  center={[26.0538, 82.6845]}
                  zoom={13}
                />
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsReplaying(!isReplaying)}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors"
                  >
                    {isReplaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsReplaying(false);
                      setReplayIndex(0);
                    }}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors"
                    title="Rewind"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="text-xs">
                    <span className="font-mono text-indigo-700 font-bold">
                      {selectedReplayTrip?.breadcrumbs[replayIndex]?.timestamp || '07:15:00'}
                    </span>
                    <span className="text-slate-500 text-[11px] block">
                      Speed: {selectedReplayTrip?.breadcrumbs[replayIndex]?.speedKmh || 0} km/h
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max={(selectedReplayTrip?.breadcrumbs.length || 1) - 1}
                  value={replayIndex}
                  onChange={(e) => setReplayIndex(Number(e.target.value))}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />

                <div className="text-xs font-mono text-slate-500 shrink-0">
                  {replayIndex + 1} / {selectedReplayTrip?.breadcrumbs.length || 1} points
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Completed Trip</label>
                <select
                  value={selectedReplayTripId}
                  onChange={(e) => {
                    setSelectedReplayTripId(e.target.value);
                    setReplayIndex(0);
                    setIsReplaying(false);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium px-3 py-2 rounded-xl focus:outline-none"
                >
                  {tripHistory.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.date} · {t.routeName} ({t.shift.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedReplayTrip && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                      <span className="text-slate-500 block text-[10px]">Duration:</span>
                      {selectedReplayTrip.durationMinutes} minutes
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                      <span className="text-slate-500 block text-[10px]">Distance:</span>
                      {selectedReplayTrip.distanceKm} km
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                      <span className="text-slate-500 block text-[10px]">Avg Speed:</span>
                      {selectedReplayTrip.avgSpeedKmh} km/h
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                      <span className="text-slate-500 block text-[10px]">Max Speed:</span>
                      {selectedReplayTrip.maxSpeedKmh} km/h
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                      <span>Standing / Idle Locations ({selectedReplayTrip.idleLocations.length})</span>
                      <span className="text-[10px] text-rose-600 font-mono">P-Pins on Map</span>
                    </div>

                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                      {selectedReplayTrip.idleLocations.map((loc, i) => (
                        <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                          <div className="font-semibold text-rose-700">{loc.description}</div>
                          <div className="text-slate-500 font-mono text-[10px]">
                            Duration: {loc.durationSeconds}s · Started: {loc.startTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPLACEMENT BUS & DRIVER MODAL */}
      {isReplacementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-base">Replacement Bus & Driver Assignment</span>
              </div>
              <button
                onClick={() => setIsReplacementModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Bus broke down or driver on leave? Set the replacement in one form — parents are instantly notified with the new vehicle number and driver's name, and it switches back automatically.
            </p>

            <form onSubmit={handleSaveReplacement} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Target Bus To Replace</label>
                <select
                  value={repBusId}
                  onChange={(e) => setRepBusId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                >
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.busName} ({b.numberPlate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Replacement Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={tempBusNumber}
                    onChange={(e) => setTempBusNumber(e.target.value)}
                    placeholder="e.g. TX-SUB-994"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Replacement Driver Name</label>
                  <input
                    type="text"
                    required
                    value={tempDriverName}
                    onChange={(e) => setTempDriverName(e.target.value)}
                    placeholder="e.g. Robert Miller"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Driver Phone Number</label>
                  <input
                    type="text"
                    required
                    value={tempDriverPhone}
                    onChange={(e) => setTempDriverPhone(e.target.value)}
                    placeholder="+1 555-0812"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Auto-Revert Date / Time</label>
                  <input
                    type="text"
                    required
                    value={repAutoRevert}
                    onChange={(e) => setRepAutoRevert(e.target.value)}
                    placeholder="e.g. Tomorrow 06:00 AM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Reason for Substitution</label>
                <input
                  type="text"
                  required
                  value={repReason}
                  onChange={(e) => setRepReason(e.target.value)}
                  placeholder="e.g. Mechanical inspection"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Broadcast Replacement & Notify Parents
                </button>

                {buses.find(b => b.id === repBusId)?.replacement?.isActive && (
                  <button
                    type="button"
                    onClick={() => {
                      revertReplacement(repBusId);
                      setIsReplacementModalOpen(false);
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Revert Now
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV IMPORT MODAL */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-600" />
                <span className="font-bold text-base">Bulk Import Students via CSV</span>
              </div>
              <button
                onClick={() => {
                  setIsCsvModalOpen(false);
                  setCsvImportMessage(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste CSV text with headers: <code>name,grade,bus,parent_name,phone</code>
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`name,grade,bus,parent_name,phone\nAditya Mishra,Grade 3-B,bus-12,Manoj Mishra,+91 95981 42455\nKavya Gupta,Grade 4-A,bus-12,Rajendra Gupta,+91 95325 46785`}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-sky-500"
            />

            {csvImportMessage && (
              <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800">
                {csvImportMessage}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleImportCsv}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
              >
                Process CSV Import
              </button>
              <button
                onClick={() => {
                  setCsvText(`name,grade,bus,parent_name,phone\nAditya Mishra,Grade 4-B,bus-12,Manoj Mishra,+91 95981 42455\nKavya Gupta,Grade 2-C,bus-12,Rajendra Gupta,+91 95325 46785`);
                }}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Load Sample CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR PASS MODAL */}
      {selectedStudentForQr && (
        <QrCardModal
          student={selectedStudentForQr}
          bus={buses.find(b => b.id === selectedStudentForQr.busId)}
          route={routes.find(r => r.id === buses.find(b => b.id === selectedStudentForQr.busId)?.routeId)}
          stop={routes
            .find(r => r.id === buses.find(b => b.id === selectedStudentForQr.busId)?.routeId)
            ?.stops.find(s => s.id === selectedStudentForQr.stopId)}
          onClose={() => setSelectedStudentForQr(null)}
          onSimulateScan={(token) => {
            markAttendance(selectedStudentForQr.id, 'present', 'qr');
          }}
        />
      )}
    </div>
  );
};
