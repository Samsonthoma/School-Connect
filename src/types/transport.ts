export type TrackingSource = 'bustrak_device' | '3rd_party_gps' | 'driver_phone';

export type AttendanceStatus = 'present' | 'absent' | 'pending';

export interface Stop {
  id: string;
  name: string;
  order: number;
  lat: number;
  lng: number;
  scheduledTimeMorning: string; // e.g. "07:35 AM"
  scheduledTimeAfternoon: string; // e.g. "03:15 PM"
  radiusMeters: number; // default 120m
}

export interface Route {
  id: string;
  code: string; // e.g. "RT-101"
  name: string; // e.g. "Northside Campus Express"
  color: string;
  stops: Stop[];
  schoolLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  schedule: {
    morningDeparture: string; // "07:15 AM"
    morningArrival: string;   // "08:05 AM"
    afternoonDeparture: string; // "03:00 PM"
    afternoonArrival: string;   // "03:50 PM"
    autoStartEnabled: boolean;
  };
}

export interface GpsDeviceHealth {
  deviceId: string;
  online: boolean;
  busPower: boolean;
  ignition: boolean;
  gpsFix: boolean;
  batteryLevel: number; // percentage
  voltage: number; // e.g. 12.6V
  lastPing: string;
  firmwareVersion: string;
  signalStrengthDbm: number;
}

export interface ReplacementAssignment {
  isActive: boolean;
  tempBusNumber: string;
  tempDriverName: string;
  tempDriverPhone: string;
  reason: string;
  autoRevertDate: string; // ISO or date string
  notifiedParents: boolean;
}

export interface Bus {
  id: string;
  numberPlate: string;
  busName: string;
  capacity: number;
  routeId: string;
  assignedDriverId: string;
  trackingSource: TrackingSource;
  thirdPartyGpsName?: string;
  deviceHealth: GpsDeviceHealth;
  replacement?: ReplacementAssignment;
  currentLat: number;
  currentLng: number;
  currentSpeedKmh: number;
  headingDeg: number;
  isTripActive: boolean;
  isIdle: boolean;
  lastUpdated: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  schoolCode: string;
  photoUrl: string;
  assignedBusId: string;
  licenseNumber: string;
  yearsExperience: number;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  busId: string;
  stopId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  photoUrl: string;
  qrCodeToken: string;
  attendanceStatus: AttendanceStatus;
  boardTime?: string;
  boardMethod?: 'qr' | 'manual';
}

export interface Breadcrumb {
  lat: number;
  lng: number;
  speedKmh: number;
  timestamp: string;
  isIdle: boolean;
}

export interface IdleLocation {
  lat: number;
  lng: number;
  startTime: string;
  durationSeconds: number;
  description: string;
}

export interface ActiveTrip {
  id: string;
  busId: string;
  routeId: string;
  driverId: string;
  status: 'idle' | 'in_progress' | 'completed';
  shift: 'morning' | 'afternoon';
  startedAt?: string;
  completedAt?: string;
  currentStopIndex: number;
  visitedStopIds: string[];
  breadcrumbs: Breadcrumb[];
  idleLocations: IdleLocation[];
  attendanceLogs: Record<string, {
    status: AttendanceStatus;
    timestamp: string;
    method: 'qr' | 'manual';
    stopId: string;
  }>;
}

export interface TripHistoryRecord {
  id: string;
  date: string;
  routeId: string;
  routeName: string;
  busNumber: string;
  driverName: string;
  shift: 'morning' | 'afternoon';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  distanceKm: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  studentsPresent: number;
  studentsTotal: number;
  stopsCount: number;
  breadcrumbs: Breadcrumb[];
  idleLocations: IdleLocation[];
  stopArrivalLogs: {
    stopId: string;
    stopName: string;
    arrivedAt: string;
    studentsBoarded: number;
  }[];
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'trip_start' | 'approaching_stop' | 'stop_reached' | 'school_arrival' | 'replacement_alert' | 'device_alert';
  read: boolean;
  busId?: string;
  studentId?: string;
}

export interface ActiveCallState {
  isInCall: boolean;
  callerRole: 'driver' | 'parent';
  callerName: string;
  receiverName: string;
  receiverRole: 'driver' | 'parent';
  maskedNumber: string; // e.g. "+1 (512) •••-••92"
  avatarUrl: string;
  callDurationSeconds: number;
  isMuted: boolean;
  isSpeaker: boolean;
  status: 'ringing' | 'connected' | 'ended';
}

export interface FeeItem {
  id: string;
  studentId: string;
  title: string;
  category: 'transport' | 'tuition' | 'activities' | 'composite';
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidAt?: string;
  receiptNumber?: string;
  paymentMethod?: string;
}

