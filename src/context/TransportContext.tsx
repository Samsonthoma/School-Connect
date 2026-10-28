import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Route,
  Stop,
  Bus,
  Driver,
  Student,
  ActiveTrip,
  TripHistoryRecord,
  NotificationItem,
  AttendanceStatus,
  Breadcrumb,
  ActiveCallState,
  FeeItem
} from '../types/transport';
import {
  INITIAL_ROUTES,
  INITIAL_BUSES,
  INITIAL_DRIVERS,
  INITIAL_STUDENTS,
  INITIAL_TRIP_HISTORY,
  INITIAL_FEES
} from '../data/initialData';

interface TransportContextType {
  routes: Route[];
  buses: Bus[];
  drivers: Driver[];
  students: Student[];
  fees: FeeItem[];
  activeTrip: ActiveTrip | null;
  tripHistory: TripHistoryRecord[];
  notifications: NotificationItem[];
  activeRole: 'admin' | 'driver' | 'parent' | 'standin';
  setActiveRole: (role: 'admin' | 'driver' | 'parent' | 'standin') => void;
  selectedChildId: string;
  setSelectedChildId: (id: string) => void;
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
  isSimulatingDrive: boolean;
  setIsSimulatingDrive: (simulating: boolean) => void;

  // Masked In-App VoIP Calling
  activeCall: ActiveCallState | null;
  startMaskedCall: (
    callerRole: 'driver' | 'parent',
    receiverRole: 'driver' | 'parent',
    callerName: string,
    receiverName: string,
    avatarUrl: string,
    rawPhone: string
  ) => void;
  endMaskedCall: () => void;
  toggleCallMute: () => void;
  toggleCallSpeaker: () => void;

  // School Fees
  payFee: (feeId: string, paymentMethod: string) => void;

  // Trip Actions
  startTrip: (busId: string, shift?: 'morning' | 'afternoon') => void;
  completeTrip: (busId: string) => void;
  advanceBusToNextStop: (busId: string) => void;
  markArrivalAtStop: (stopId: string) => void;
  markAttendance: (studentId: string, status: AttendanceStatus, method?: 'qr' | 'manual') => void;

  // Fleet & GPS Actions
  checkGpsHealthNow: (busId: string) => Promise<string>;
  toggleDeviceHealthProp: (busId: string, prop: 'online' | 'busPower' | 'ignition' | 'gpsFix') => void;
  updateBusPosition: (busId: string, lat: number, lng: number, speed?: number, heading?: number) => void;

  // Replacement Actions
  setReplacementBusAndDriver: (
    busId: string,
    tempBusNumber: string,
    tempDriverName: string,
    tempDriverPhone: string,
    reason: string,
    autoRevertDate: string
  ) => void;
  revertReplacement: (busId: string) => void;

  // Route & Stop Editor Actions
  addStopToRoute: (routeId: string, name: string, lat: number, lng: number) => void;
  updateStopPosition: (routeId: string, stopId: string, lat: number, lng: number) => void;
  updateStopDetails: (routeId: string, stopId: string, updates: Partial<Stop>) => void;
  removeStopFromRoute: (routeId: string, stopId: string) => void;

  // Students & Photos
  bulkImportStudents: (csvText: string) => { added: number; errors: string[] };
  updateStudentPhoto: (studentId: string, photoUrl: string) => void;
  updateDriverPhoto: (driverId: string, photoUrl: string) => void;

  // Notifications & Announcements
  sendNotification: (title: string, message: string, type: NotificationItem['type'], busId?: string, studentId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  speakAnnouncement: (text: string) => void;
}

const TransportContext = createContext<TransportContextType | undefined>(undefined);

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const CURRENT_DATA_VERSION = 'sis_shahganj_v3';

// Number masking utility to ensure real phone number is NEVER visible to either party
function maskPhoneNumber(rawNumber: string): string {
  const cleaned = rawNumber.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    const first5 = cleaned.slice(-10, -5);
    const last2 = cleaned.slice(-2);
    return `+91 ${first5} •••${last2} (In-App VoIP Relay)`;
  } else if (cleaned.length >= 4) {
    const last2 = cleaned.slice(-2);
    return `+91 95981 ••••${last2} (In-App VoIP Relay)`;
  }
  return '+91 95981 ••••55 (In-App VoIP Relay)';
}

export const TransportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if localStorage has outdated version or Austin coordinates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVer = localStorage.getItem('bustrak_version');
      if (storedVer !== CURRENT_DATA_VERSION) {
        localStorage.setItem('bustrak_version', CURRENT_DATA_VERSION);
        localStorage.setItem('bustrak_routes', JSON.stringify(INITIAL_ROUTES));
        localStorage.setItem('bustrak_buses', JSON.stringify(INITIAL_BUSES));
        localStorage.setItem('bustrak_drivers', JSON.stringify(INITIAL_DRIVERS));
        localStorage.setItem('bustrak_students', JSON.stringify(INITIAL_STUDENTS));
        localStorage.setItem('bustrak_fees', JSON.stringify(INITIAL_FEES));
        localStorage.setItem('bustrak_history', JSON.stringify(INITIAL_TRIP_HISTORY));
      }
    }
  }, []);

  const [routes, setRoutes] = useState<Route[]>(() => {
    const storedVer = typeof window !== 'undefined' ? localStorage.getItem('bustrak_version') : null;
    if (storedVer !== CURRENT_DATA_VERSION) return INITIAL_ROUTES;
    const saved = localStorage.getItem('bustrak_routes');
    return saved ? JSON.parse(saved) : INITIAL_ROUTES;
  });

  const [buses, setBuses] = useState<Bus[]>(() => {
    const storedVer = typeof window !== 'undefined' ? localStorage.getItem('bustrak_version') : null;
    if (storedVer !== CURRENT_DATA_VERSION) return INITIAL_BUSES;
    const saved = localStorage.getItem('bustrak_buses');
    return saved ? JSON.parse(saved) : INITIAL_BUSES;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const storedVer = typeof window !== 'undefined' ? localStorage.getItem('bustrak_version') : null;
    if (storedVer !== CURRENT_DATA_VERSION) return INITIAL_DRIVERS;
    const saved = localStorage.getItem('bustrak_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const storedVer = typeof window !== 'undefined' ? localStorage.getItem('bustrak_version') : null;
    if (storedVer !== CURRENT_DATA_VERSION) return INITIAL_STUDENTS;
    const saved = localStorage.getItem('bustrak_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [fees, setFees] = useState<FeeItem[]>(() => {
    const storedVer = typeof window !== 'undefined' ? localStorage.getItem('bustrak_version') : null;
    if (storedVer !== CURRENT_DATA_VERSION) return INITIAL_FEES;
    const saved = localStorage.getItem('bustrak_fees');
    return saved ? JSON.parse(saved) : INITIAL_FEES;
  });

  const [tripHistory, setTripHistory] = useState<TripHistoryRecord[]>(() => {
    const storedVer = typeof window !== 'undefined' ? localStorage.getItem('bustrak_version') : null;
    if (storedVer !== CURRENT_DATA_VERSION) return INITIAL_TRIP_HISTORY;
    const saved = localStorage.getItem('bustrak_history');
    return saved ? JSON.parse(saved) : INITIAL_TRIP_HISTORY;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return [
      {
        id: 'notif-init-1',
        timestamp: '06:15 AM',
        title: 'Trip Started',
        message: 'Force Bus #12 (Faizabad Road) departed for morning pickup route.',
        type: 'trip_start',
        read: false,
        busId: 'bus-12'
      },
      {
        id: 'notif-init-2',
        timestamp: '06:23 AM',
        title: 'Student Boarded',
        message: 'Aarav Sharma was scanned and boarded Bus #12 at Purvanchal Chauraha.',
        type: 'stop_reached',
        read: false,
        studentId: 'stud-101'
      }
    ];
  });

  const [activeRole, setActiveRole] = useState<'admin' | 'driver' | 'parent' | 'standin'>('admin');
  const [selectedChildId, setSelectedChildId] = useState<string>('stud-101');
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState<boolean>(true);

  // Masked In-App VoIP Calling State
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);

  // Active trip state
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(() => {
    const activeBus = INITIAL_BUSES.find(b => b.isTripActive);
    if (!activeBus) return null;
    return {
      id: 'trip-active-101',
      busId: activeBus.id,
      routeId: activeBus.routeId,
      driverId: activeBus.assignedDriverId,
      status: 'in_progress',
      shift: 'morning',
      startedAt: '06:15 AM',
      currentStopIndex: 1,
      visitedStopIds: ['stop-101-1'],
      breadcrumbs: [
        { lat: 26.0690, lng: 82.6740, speedKmh: 36, timestamp: '06:35:10', isIdle: false }
      ],
      idleLocations: [],
      attendanceLogs: {
        'stud-101': {
          status: 'present',
          timestamp: '06:23 AM',
          method: 'qr',
          stopId: 'stop-101-1'
        }
      }
    };
  });

  // Cross-tab broadcast channel for multi-tab sync
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('bustrak_fleet_sync');
      channelRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          if (event.data.buses) setBuses(event.data.buses);
          if (event.data.students) setStudents(event.data.students);
          if (event.data.activeTrip) setActiveTrip(event.data.activeTrip);
          if (event.data.fees) setFees(event.data.fees);
        }
      };
      return () => {
        channel.close();
      };
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('bustrak_buses', JSON.stringify(buses));
  }, [buses]);

  useEffect(() => {
    localStorage.setItem('bustrak_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('bustrak_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('bustrak_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('bustrak_fees', JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem('bustrak_history', JSON.stringify(tripHistory));
  }, [tripHistory]);

  // Voice announcement helper
  const speakAnnouncement = useCallback((text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [speechEnabled]);

  // Notification helper
  const sendNotification = useCallback((
    title: string,
    message: string,
    type: NotificationItem['type'],
    busId?: string,
    studentId?: string
  ) => {
    const newItem: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title,
      message,
      type,
      read: false,
      busId,
      studentId
    };
    setNotifications(prev => [newItem, ...prev.slice(0, 49)]);

    if (type === 'trip_start' || type === 'approaching_stop' || type === 'stop_reached' || type === 'school_arrival') {
      speakAnnouncement(message);
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body: message, icon: '/favicon.ico' });
      } catch {
        // Fallback
      }
    }
  }, [speakAnnouncement]);

  // Masked In-App Calling Functions
  const startMaskedCall = useCallback((
    callerRole: 'driver' | 'parent',
    receiverRole: 'driver' | 'parent',
    callerName: string,
    receiverName: string,
    avatarUrl: string,
    rawPhone: string
  ) => {
    const masked = maskPhoneNumber(rawPhone);
    setActiveCall({
      isInCall: true,
      callerRole,
      callerName,
      receiverRole,
      receiverName,
      maskedNumber: masked,
      avatarUrl,
      callDurationSeconds: 0,
      isMuted: false,
      isSpeaker: true,
      status: 'ringing'
    });
  }, []);

  const endMaskedCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const toggleCallMute = useCallback(() => {
    setActiveCall(prev => (prev ? { ...prev, isMuted: !prev.isMuted } : null));
  }, []);

  const toggleCallSpeaker = useCallback(() => {
    setActiveCall(prev => (prev ? { ...prev, isSpeaker: !prev.isSpeaker } : null));
  }, []);

  // School Fees Payment Function
  const payFee = useCallback((feeId: string, paymentMethod: string) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const receiptNum = `REC-OAK-${Math.floor(100000 + Math.random() * 900000)}`;

    setFees(prev =>
      prev.map(f => {
        if (f.id === feeId) {
          return {
            ...f,
            status: 'paid',
            paidAt: nowStr,
            receiptNumber: receiptNum,
            paymentMethod
          };
        }
        return f;
      })
    );

    const fee = fees.find(f => f.id === feeId);
    if (fee) {
      sendNotification(
        'School Fee Paid',
        `Payment of $${fee.amount.toFixed(2)} for ${fee.title} was confirmed (${receiptNum}).`,
        'stop_reached',
        undefined,
        fee.studentId
      );
    }
  }, [fees, sendNotification]);

  // Mark student attendance
  const markAttendance = useCallback((studentId: string, status: AttendanceStatus, method: 'qr' | 'manual' = 'manual') => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            attendanceStatus: status,
            boardTime: status === 'present' ? nowTime : undefined,
            boardMethod: method
          };
        }
        return s;
      })
    );

    const student = students.find(s => s.id === studentId);
    if (student) {
      const verb = status === 'present' ? `marked present (${method.toUpperCase()})` : 'marked absent';
      sendNotification(
        `Attendance: ${student.name}`,
        `${student.name} was ${verb} at ${nowTime}.`,
        'stop_reached',
        student.busId,
        student.id
      );
    }
  }, [students, sendNotification]);

  // Stop arrival tracking
  const markArrivalAtStop = useCallback((stopId: string) => {
    if (!activeTrip) return;
    if (activeTrip.visitedStopIds.includes(stopId)) return;

    const currentRoute = routes.find(r => r.id === activeTrip.routeId);
    const stop = currentRoute?.stops.find(s => s.id === stopId);
    if (!stop) return;

    const arrivalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveTrip(prev => {
      if (!prev) return null;
      return {
        ...prev,
        visitedStopIds: [...prev.visitedStopIds, stopId],
        currentStopIndex: Math.min(prev.currentStopIndex + 1, (currentRoute?.stops.length || 1) - 1)
      };
    });

    sendNotification(
      `Stop Reached: ${stop.name}`,
      `Bus has reached ${stop.name} at ${arrivalTime}. Boarding in progress.`,
      'stop_reached',
      activeTrip.busId
    );
  }, [activeTrip, routes, sendNotification]);

  // Update bus location
  const updateBusPosition = useCallback((busId: string, lat: number, lng: number, speed: number = 32, heading: number = 180) => {
    const nowTime = new Date().toLocaleTimeString();
    setBuses(prev =>
      prev.map(b => {
        if (b.id === busId) {
          return {
            ...b,
            currentLat: lat,
            currentLng: lng,
            currentSpeedKmh: speed,
            headingDeg: heading,
            lastUpdated: 'Just now'
          };
        }
        return b;
      })
    );

    if (activeTrip && activeTrip.busId === busId) {
      const route = routes.find(r => r.id === activeTrip.routeId);
      if (route) {
        route.stops.forEach(stop => {
          if (!activeTrip.visitedStopIds.includes(stop.id)) {
            const dist = getDistanceMeters(lat, lng, stop.lat, stop.lng);
            if (dist <= (stop.radiusMeters || 120)) {
              markArrivalAtStop(stop.id);
            }
          }
        });
      }

      setActiveTrip(prev => {
        if (!prev) return null;
        const newCrumb: Breadcrumb = {
          lat,
          lng,
          speedKmh: speed,
          timestamp: nowTime,
          isIdle: speed < 3
        };
        return {
          ...prev,
          breadcrumbs: [...prev.breadcrumbs, newCrumb]
        };
      });
    }
  }, [activeTrip, routes, markArrivalAtStop]);

  // Start trip
  const startTrip = useCallback((busId: string, shift: 'morning' | 'afternoon' = 'morning') => {
    const bus = buses.find(b => b.id === busId);
    if (!bus) return;

    const route = routes.find(r => r.id === bus.routeId);
    const startStop = route?.stops[0];
    const initialLat = startStop ? startStop.lat : bus.currentLat;
    const initialLng = startStop ? startStop.lng : bus.currentLng;
    const startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setBuses(prev =>
      prev.map(b => {
        if (b.id === busId) {
          return {
            ...b,
            isTripActive: true,
            isIdle: false,
            currentLat: initialLat,
            currentLng: initialLng,
            currentSpeedKmh: 28,
            lastUpdated: 'Active trip now'
          };
        }
        return b;
      })
    );

    const newTrip: ActiveTrip = {
      id: `trip-${Date.now()}`,
      busId,
      routeId: bus.routeId,
      driverId: bus.assignedDriverId,
      status: 'in_progress',
      shift,
      startedAt: startTime,
      currentStopIndex: 0,
      visitedStopIds: [],
      breadcrumbs: [
        { lat: initialLat, lng: initialLng, speedKmh: 28, timestamp: startTime, isIdle: false }
      ],
      idleLocations: [],
      attendanceLogs: {}
    };

    setActiveTrip(newTrip);

    setStudents(prev =>
      prev.map(s => {
        if (s.busId === busId) {
          return { ...s, attendanceStatus: 'pending', boardTime: undefined };
        }
        return s;
      })
    );

    sendNotification(
      'Trip Started',
      `${bus.busName} has departed on ${route?.name || 'pickup route'}. Live tracking is active.`,
      'trip_start',
      busId
    );
  }, [buses, routes, sendNotification]);

  // Complete trip
  const completeTrip = useCallback((busId: string) => {
    const bus = buses.find(b => b.id === busId);
    const route = routes.find(r => r.id === bus?.routeId);
    const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setBuses(prev =>
      prev.map(b => {
        if (b.id === busId) {
          return {
            ...b,
            isTripActive: false,
            isIdle: true,
            currentSpeedKmh: 0,
            lastUpdated: 'Trip completed'
          };
        }
        return b;
      })
    );

    if (activeTrip && activeTrip.busId === busId) {
      const studentList = students.filter(s => s.busId === busId);
      const presentCount = studentList.filter(s => s.attendanceStatus === 'present').length;

      const newHistory: TripHistoryRecord = {
        id: `trip-hist-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        routeId: activeTrip.routeId,
        routeName: route?.name || 'Faizabad Road Express',
        busNumber: bus?.numberPlate || 'UP 62 T 4122',
        driverName: drivers.find(d => d.id === bus?.assignedDriverId)?.name || 'Ramesh Yadav',
        shift: activeTrip.shift,
        startTime: activeTrip.startedAt || '06:15 AM',
        endTime,
        durationMinutes: 50,
        distanceKm: 18.2,
        avgSpeedKmh: 32.5,
        maxSpeedKmh: 52.0,
        studentsPresent: presentCount,
        studentsTotal: studentList.length,
        stopsCount: route?.stops.length || 4,
        breadcrumbs: activeTrip.breadcrumbs,
        idleLocations: [
          {
            lat: 26.0690,
            lng: 82.6740,
            startTime: '06:35 AM',
            durationSeconds: 120,
            description: 'Galla Mandi Shahganj passenger boarding'
          }
        ],
        stopArrivalLogs: (route?.stops || []).map(s => ({
          stopId: s.id,
          stopName: s.name,
          arrivedAt: '06:35 AM',
          studentsBoarded: 1
        }))
      };

      setTripHistory(prev => [newHistory, ...prev]);
      setActiveTrip(null);
    }

    sendNotification(
      'Trip Completed',
      `${bus?.busName || 'Bus'} safely arrived at THE SOUTH INDIAN SCHOOL Campus Gate, Shahganj. All stops completed.`,
      'school_arrival',
      busId
    );
  }, [buses, routes, activeTrip, students, drivers, sendNotification]);

  const advanceBusToNextStop = useCallback((busId: string) => {
    const bus = buses.find(b => b.id === busId);
    if (!bus) return;
    const route = routes.find(r => r.id === bus.routeId);
    if (!route || route.stops.length === 0) return;

    const visited = activeTrip?.visitedStopIds || [];
    const nextStop = route.stops.find(s => !visited.includes(s.id));

    if (nextStop) {
      updateBusPosition(busId, nextStop.lat, nextStop.lng, 36, 180);
      markArrivalAtStop(nextStop.id);
    } else {
      updateBusPosition(busId, route.schoolLocation.lat, route.schoolLocation.lng, 0, 0);
      completeTrip(busId);
    }
  }, [buses, routes, activeTrip, updateBusPosition, markArrivalAtStop, completeTrip]);

  // Live simulation tick: every 10s
  useEffect(() => {
    if (!isSimulatingDrive || !activeTrip || activeTrip.status !== 'in_progress') return;

    const interval = setInterval(() => {
      const currentBus = buses.find(b => b.id === activeTrip.busId);
      const currentRoute = routes.find(r => r.id === activeTrip.routeId);
      if (!currentBus || !currentRoute) return;

      const stops = currentRoute.stops;
      const targetStop = stops.find(s => !activeTrip.visitedStopIds.includes(s.id));

      if (targetStop) {
        const step = 0.0018;
        const dLat = targetStop.lat - currentBus.currentLat;
        const dLng = targetStop.lng - currentBus.currentLng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist <= 0.0025) {
          updateBusPosition(currentBus.id, targetStop.lat, targetStop.lng, 0, currentBus.headingDeg);
          markArrivalAtStop(targetStop.id);
        } else {
          const angle = Math.atan2(dLng, dLat);
          const newLat = currentBus.currentLat + Math.cos(angle) * step;
          const newLng = currentBus.currentLng + Math.sin(angle) * step;
          const headingDeg = Math.round(((angle * 180) / Math.PI + 360) % 360);
          const currentSpeed = 30 + Math.floor(Math.random() * 12);
          updateBusPosition(currentBus.id, newLat, newLng, currentSpeed, headingDeg);
        }
      } else {
        const school = currentRoute.schoolLocation;
        const dLat = school.lat - currentBus.currentLat;
        const dLng = school.lng - currentBus.currentLng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist <= 0.002) {
          completeTrip(currentBus.id);
        } else {
          const angle = Math.atan2(dLng, dLat);
          const newLat = currentBus.currentLat + Math.cos(angle) * 0.002;
          const newLng = currentBus.currentLng + Math.sin(angle) * 0.002;
          updateBusPosition(currentBus.id, newLat, newLng, 32, 180);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isSimulatingDrive, activeTrip, buses, routes, updateBusPosition, markArrivalAtStop, completeTrip]);

  // GPS Device Health diagnostic check
  const checkGpsHealthNow = useCallback(async (busId: string): Promise<string> => {
    const bus = buses.find(b => b.id === busId);
    if (!bus) return 'Bus not found';

    await new Promise(res => setTimeout(res, 450));

    const isHealthy = bus.deviceHealth.online && bus.deviceHealth.busPower && bus.deviceHealth.gpsFix;

    setBuses(prev =>
      prev.map(b => {
        if (b.id === busId) {
          return {
            ...b,
            deviceHealth: {
              ...b.deviceHealth,
              lastPing: 'Live probed (0s ago)'
            }
          };
        }
        return b;
      })
    );

    if (isHealthy) {
      return `Telemetry OK: Tracker ${bus.deviceHealth.deviceId} online, bus 13.8V power normal, ignition ON, 12 GPS satellites fixed.`;
    } else {
      const issue = !bus.deviceHealth.online
        ? 'Tracker Offline'
        : !bus.deviceHealth.busPower
        ? 'Bus Power Disconnected'
        : 'GPS Fix Lost';
      sendNotification(
        `Hardware Alert: ${bus.busName}`,
        `Device health check warning: ${issue}. Automated dispatch notification sent.`,
        'device_alert',
        busId
      );
      return `Warning: ${issue}. Diagnostics sent to fleet dispatch email.`;
    }
  }, [buses, sendNotification]);

  const toggleDeviceHealthProp = useCallback((busId: string, prop: 'online' | 'busPower' | 'ignition' | 'gpsFix') => {
    setBuses(prev =>
      prev.map(b => {
        if (b.id === busId) {
          const updated = {
            ...b.deviceHealth,
            [prop]: !b.deviceHealth[prop]
          };
          if (b.isTripActive && (!updated.online || !updated.busPower)) {
            sendNotification(
              `Alert: GPS Issue on ${b.busName}`,
              `Tracker ${prop === 'busPower' ? 'lost bus power' : 'went offline'} during active morning run!`,
              'device_alert',
              b.id
            );
          }
          return { ...b, deviceHealth: updated };
        }
        return b;
      })
    );
  }, [sendNotification]);

  const setReplacementBusAndDriver = useCallback((
    busId: string,
    tempBusNumber: string,
    tempDriverName: string,
    tempDriverPhone: string,
    reason: string,
    autoRevertDate: string
  ) => {
    const bus = buses.find(b => b.id === busId);
    if (!bus) return;

    setBuses(prev =>
      prev.map(b => {
        if (b.id === busId) {
          return {
            ...b,
            replacement: {
              isActive: true,
              tempBusNumber,
              tempDriverName,
              tempDriverPhone,
              reason,
              autoRevertDate,
              notifiedParents: true
            }
          };
        }
        return b;
      })
    );

    sendNotification(
      'Bus & Driver Replacement Notice',
      `Attention Parents: ${bus.busName} has been temporarily replaced by ${tempBusNumber} (Driver: ${tempDriverName}, Phone: ${tempDriverPhone}). Auto-revert scheduled for ${autoRevertDate}.`,
      'replacement_alert',
      busId
    );
  }, [buses, sendNotification]);

  const revertReplacement = useCallback((busId: string) => {
    setBuses(prev =>
      prev.map(b => {
        if (b.id === busId) {
          return {
            ...b,
            replacement: {
              isActive: false,
              tempBusNumber: '',
              tempDriverName: '',
              tempDriverPhone: '',
              reason: '',
              autoRevertDate: '',
              notifiedParents: false
            }
          };
        }
        return b;
      })
    );
    sendNotification(
      'Service Restored',
      'The original bus and driver assignment has resumed regular service.',
      'replacement_alert',
      busId
    );
  }, [sendNotification]);

  const addStopToRoute = useCallback((routeId: string, name: string, lat: number, lng: number) => {
    setRoutes(prev =>
      prev.map(r => {
        if (r.id === routeId) {
          const newOrder = r.stops.length + 1;
          const newStop: Stop = {
            id: `stop-${Date.now()}`,
            name,
            order: newOrder,
            lat,
            lng,
            scheduledTimeMorning: '07:45 AM',
            scheduledTimeAfternoon: '03:45 PM',
            radiusMeters: 120
          };
          return {
            ...r,
            stops: [...r.stops, newStop]
          };
        }
        return r;
      })
    );
  }, []);

  const updateStopPosition = useCallback((routeId: string, stopId: string, lat: number, lng: number) => {
    setRoutes(prev =>
      prev.map(r => {
        if (r.id === routeId) {
          return {
            ...r,
            stops: r.stops.map(s => (s.id === stopId ? { ...s, lat, lng } : s))
          };
        }
        return r;
      })
    );
  }, []);

  const updateStopDetails = useCallback((routeId: string, stopId: string, updates: Partial<Stop>) => {
    setRoutes(prev =>
      prev.map(r => {
        if (r.id === routeId) {
          return {
            ...r,
            stops: r.stops.map(s => (s.id === stopId ? { ...s, ...updates } : s))
          };
        }
        return r;
      })
    );
  }, []);

  const removeStopFromRoute = useCallback((routeId: string, stopId: string) => {
    setRoutes(prev =>
      prev.map(r => {
        if (r.id === routeId) {
          const filtered = r.stops.filter(s => s.id !== stopId);
          return {
            ...r,
            stops: filtered.map((s, idx) => ({ ...s, order: idx + 1 }))
          };
        }
        return r;
      })
    );
  }, []);

  const bulkImportStudents = useCallback((csvText: string) => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { added: 0, errors: ['CSV file is empty or missing headers'] };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    const gradeIdx = headers.indexOf('grade');
    const busIdx = headers.indexOf('bus');
    const parentIdx = headers.indexOf('parent_name');
    const phoneIdx = headers.indexOf('phone');

    if (nameIdx === -1) {
      return { added: 0, errors: ['Missing required column: "name"'] };
    }

    const newStudents: Student[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length > nameIdx && parts[nameIdx]) {
        const studentName = parts[nameIdx];
        const studentId = `stud-${Date.now()}-${i}`;
        newStudents.push({
          id: studentId,
          name: studentName,
          grade: gradeIdx !== -1 && parts[gradeIdx] ? parts[gradeIdx] : 'Grade 3',
          busId: busIdx !== -1 && parts[busIdx] ? parts[busIdx] : 'bus-12',
          stopId: 'stop-101-2',
          parentName: parentIdx !== -1 && parts[parentIdx] ? parts[parentIdx] : 'Guardian',
          parentPhone: phoneIdx !== -1 && parts[phoneIdx] ? parts[phoneIdx] : '+1 555-0100',
          parentEmail: 'parent@example.com',
          photoUrl: '/src/assets/images/student_leo_chen_1792981814273.jpg',
          qrCodeToken: `BT-${studentId.toUpperCase()}`,
          attendanceStatus: 'pending'
        });
      }
    }

    setStudents(prev => [...prev, ...newStudents]);
    return { added: newStudents.length, errors: [] };
  }, []);

  const updateStudentPhoto = useCallback((studentId: string, photoUrl: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, photoUrl } : s))
    );
  }, []);

  const updateDriverPhoto = useCallback((driverId: string, photoUrl: string) => {
    setDrivers(prev =>
      prev.map(d => (d.id === driverId ? { ...d, photoUrl } : d))
    );
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <TransportContext.Provider
      value={{
        routes,
        buses,
        drivers,
        students,
        fees,
        activeTrip,
        tripHistory,
        notifications,
        activeRole,
        setActiveRole,
        selectedChildId,
        setSelectedChildId,
        speechEnabled,
        setSpeechEnabled,
        isSimulatingDrive,
        setIsSimulatingDrive,
        activeCall,
        startMaskedCall,
        endMaskedCall,
        toggleCallMute,
        toggleCallSpeaker,
        payFee,
        startTrip,
        completeTrip,
        advanceBusToNextStop,
        markArrivalAtStop,
        markAttendance,
        checkGpsHealthNow,
        toggleDeviceHealthProp,
        updateBusPosition,
        setReplacementBusAndDriver,
        revertReplacement,
        addStopToRoute,
        updateStopPosition,
        updateStopDetails,
        removeStopFromRoute,
        bulkImportStudents,
        updateStudentPhoto,
        updateDriverPhoto,
        sendNotification,
        markNotificationAsRead,
        clearNotifications,
        speakAnnouncement
      }}
    >
      {children}
    </TransportContext.Provider>
  );
};

export const useTransport = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within a TransportProvider');
  }
  return context;
};
