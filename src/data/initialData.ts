import { Route, Bus, Driver, Student, TripHistoryRecord, FeeItem } from '../types/transport';

export const SCHOOL_HQ = {
  lat: 26.0538,
  lng: 82.6845,
  name: 'THE SOUTH INDIAN SCHOOL',
  address: 'Shahganj, Jaunpur, Uttar Pradesh - 223101',
  phones: ['+91 9598142455', '+91 9532546785']
};

export const INITIAL_ROUTES: Route[] = [
  {
    id: 'route-101',
    code: 'RT-101',
    name: 'Force Bus Faizabad Road',
    color: '#3b82f6', // blue
    schoolLocation: {
      lat: SCHOOL_HQ.lat,
      lng: SCHOOL_HQ.lng,
      name: SCHOOL_HQ.name
    },
    schedule: {
      morningDeparture: '06:15 AM',
      morningArrival: '07:15 AM',
      afternoonDeparture: '01:30 PM',
      afternoonArrival: '02:30 PM',
      autoStartEnabled: true
    },
    stops: [
      {
        id: 'stop-101-1',
        name: 'Purvanchal Chauraha (Faizabad Road)',
        order: 1,
        lat: 26.0820,
        lng: 82.6680,
        scheduledTimeMorning: '06:22 AM',
        scheduledTimeAfternoon: '01:40 PM',
        radiusMeters: 120
      },
      {
        id: 'stop-101-2',
        name: 'Galla Mandi Shahganj',
        order: 2,
        lat: 26.0690,
        lng: 82.6740,
        scheduledTimeMorning: '06:35 AM',
        scheduledTimeAfternoon: '01:52 PM',
        radiusMeters: 120
      },
      {
        id: 'stop-101-3',
        name: 'Railway Station Road & Bus Stand Tiraha',
        order: 3,
        lat: 26.0590,
        lng: 82.6790,
        scheduledTimeMorning: '06:48 AM',
        scheduledTimeAfternoon: '02:08 PM',
        radiusMeters: 120
      },
      {
        id: 'stop-101-4',
        name: 'THE SOUTH INDIAN SCHOOL Main Gate',
        order: 4,
        lat: 26.0538,
        lng: 82.6845,
        scheduledTimeMorning: '07:10 AM',
        scheduledTimeAfternoon: '02:25 PM',
        radiusMeters: 120
      }
    ]
  },
  {
    id: 'route-102',
    code: 'RT-102',
    name: 'Azamgarh Road - Kheta Sarai Line',
    color: '#10b981', // emerald
    schoolLocation: {
      lat: SCHOOL_HQ.lat,
      lng: SCHOOL_HQ.lng,
      name: SCHOOL_HQ.name
    },
    schedule: {
      morningDeparture: '06:20 AM',
      morningArrival: '07:20 AM',
      afternoonDeparture: '01:35 PM',
      afternoonArrival: '02:35 PM',
      autoStartEnabled: true
    },
    stops: [
      {
        id: 'stop-102-1',
        name: 'Kheta Sarai Main Market Chauraha',
        order: 1,
        lat: 26.0210,
        lng: 82.7250,
        scheduledTimeMorning: '06:28 AM',
        scheduledTimeAfternoon: '01:45 PM',
        radiusMeters: 120
      },
      {
        id: 'stop-102-2',
        name: 'Manikalan Morh Crossing',
        order: 2,
        lat: 26.0380,
        lng: 82.7050,
        scheduledTimeMorning: '06:45 AM',
        scheduledTimeAfternoon: '02:02 PM',
        radiusMeters: 120
      },
      {
        id: 'stop-102-3',
        name: 'THE SOUTH INDIAN SCHOOL Main Gate',
        order: 3,
        lat: 26.0538,
        lng: 82.6845,
        scheduledTimeMorning: '07:15 AM',
        scheduledTimeAfternoon: '02:30 PM',
        radiusMeters: 120
      }
    ]
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'driver-1',
    name: 'Ramesh Yadav',
    email: 'ramesh.yadav@southindianschool.edu.in',
    phone: '+91 95981 42455',
    schoolCode: 'SIS-223101',
    photoUrl: '/src/assets/images/driver_marcus_vance_1792981812695.jpg',
    assignedBusId: 'bus-12',
    licenseNumber: 'UP-62-DL-2018-09124',
    yearsExperience: 9
  },
  {
    id: 'driver-2',
    name: 'Rajesh Bind',
    email: 'rajesh.bind@southindianschool.edu.in',
    phone: '+91 95325 46785',
    schoolCode: 'SIS-223101',
    photoUrl: '/src/assets/images/driver_sarah_jenkins_1792981813067.jpg',
    assignedBusId: 'bus-18',
    licenseNumber: 'UP-62-DL-2020-44912',
    yearsExperience: 6
  },
  {
    id: 'driver-3',
    name: 'Suresh Vishwakarma',
    email: 'suresh.v@southindianschool.edu.in',
    phone: '+91 98391 22891',
    schoolCode: 'SIS-223101',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80',
    assignedBusId: 'bus-24',
    licenseNumber: 'UP-62-DL-2017-88419',
    yearsExperience: 11
  }
];

export const INITIAL_BUSES: Bus[] = [
  {
    id: 'bus-12',
    numberPlate: 'UP 62 T 4122',
    busName: 'Force Bus #12 (Faizabad Road)',
    capacity: 34,
    routeId: 'route-101',
    assignedDriverId: 'driver-1',
    trackingSource: 'bustrak_device',
    deviceHealth: {
      deviceId: 'SIS-GPS-4122',
      online: true,
      busPower: true,
      ignition: true,
      gpsFix: true,
      batteryLevel: 98,
      voltage: 13.8,
      lastPing: 'Just now (2s ago)',
      firmwareVersion: 'v3.4.1-hw7',
      signalStrengthDbm: -68
    },
    replacement: {
      isActive: false,
      tempBusNumber: '',
      tempDriverName: '',
      tempDriverPhone: '',
      reason: '',
      autoRevertDate: '',
      notifiedParents: false
    },
    currentLat: 26.0690,
    currentLng: 82.6740,
    currentSpeedKmh: 36,
    headingDeg: 155,
    isTripActive: true,
    isIdle: false,
    lastUpdated: '10 seconds ago'
  },
  {
    id: 'bus-18',
    numberPlate: 'UP 62 T 5188',
    busName: 'Tata Starbus #18 (Kheta Sarai Line)',
    capacity: 42,
    routeId: 'route-102',
    assignedDriverId: 'driver-2',
    trackingSource: '3rd_party_gps',
    thirdPartyGpsName: 'Teltonika FMB920 GPS',
    deviceHealth: {
      deviceId: 'TEL-SIS-5188',
      online: true,
      busPower: true,
      ignition: true,
      gpsFix: true,
      batteryLevel: 94,
      voltage: 13.5,
      lastPing: '8 seconds ago',
      firmwareVersion: 'v03.28.02',
      signalStrengthDbm: -72
    },
    replacement: {
      isActive: false,
      tempBusNumber: '',
      tempDriverName: '',
      tempDriverPhone: '',
      reason: '',
      autoRevertDate: '',
      notifiedParents: false
    },
    currentLat: 26.0380,
    currentLng: 82.7050,
    currentSpeedKmh: 28,
    headingDeg: 310,
    isTripActive: false,
    isIdle: true,
    lastUpdated: '25 seconds ago'
  },
  {
    id: 'bus-24',
    numberPlate: 'UP 62 T 6240',
    busName: 'Eicher Bus #24 (City Standby)',
    capacity: 48,
    routeId: 'route-101',
    assignedDriverId: 'driver-3',
    trackingSource: 'driver_phone',
    deviceHealth: {
      deviceId: 'PHONE-SIS-6240',
      online: true,
      busPower: false,
      ignition: true,
      gpsFix: true,
      batteryLevel: 85,
      voltage: 4.1,
      lastPing: '4 seconds ago',
      firmwareVersion: 'Android 14 App v2.4.0',
      signalStrengthDbm: -65
    },
    replacement: {
      isActive: false,
      tempBusNumber: '',
      tempDriverName: '',
      tempDriverPhone: '',
      reason: '',
      autoRevertDate: '',
      notifiedParents: false
    },
    currentLat: 26.0538,
    currentLng: 82.6845,
    currentSpeedKmh: 0,
    headingDeg: 0,
    isTripActive: false,
    isIdle: true,
    lastUpdated: '1 minute ago'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stud-101',
    name: 'Aarav Sharma',
    grade: 'Class 4-A',
    busId: 'bus-12',
    stopId: 'stop-101-1',
    parentName: 'Sunil Sharma',
    parentPhone: '+91 98382 11045',
    parentEmail: 'sunil.sharma@gmail.com',
    photoUrl: '/src/assets/images/student_leo_chen_1792981814273.jpg',
    qrCodeToken: 'SIS-STU-101-AARAV',
    attendanceStatus: 'present',
    boardTime: '06:23 AM',
    boardMethod: 'qr'
  },
  {
    id: 'stud-102',
    name: 'Ananya Verma',
    grade: 'Class 5-B',
    busId: 'bus-12',
    stopId: 'stop-101-2',
    parentName: 'Rajendra Verma',
    parentPhone: '+91 94152 88412',
    parentEmail: 'rajendra.verma@gmail.com',
    photoUrl: '/src/assets/images/student_maya_patel_1792981813481.jpg',
    qrCodeToken: 'SIS-STU-102-ANANYA',
    attendanceStatus: 'pending',
    boardTime: undefined
  },
  {
    id: 'stud-103',
    name: 'Vihaan Gupta',
    grade: 'Class 3-A',
    busId: 'bus-12',
    stopId: 'stop-101-2',
    parentName: 'Manoj Gupta',
    parentPhone: '+91 99194 77231',
    parentEmail: 'manoj.gupta@yahoo.com',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&q=80',
    qrCodeToken: 'SIS-STU-103-VIHAAN',
    attendanceStatus: 'pending',
    boardTime: undefined
  },
  {
    id: 'stud-104',
    name: 'Priya Singh',
    grade: 'Class 2-C',
    busId: 'bus-12',
    stopId: 'stop-101-3',
    parentName: 'Dharmendra Singh',
    parentPhone: '+91 97941 55620',
    parentEmail: 'dharmendra.singh@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&fit=crop&q=80',
    qrCodeToken: 'SIS-STU-104-PRIYA',
    attendanceStatus: 'pending',
    boardTime: undefined
  },
  {
    id: 'stud-105',
    name: 'Ishaan Tiwari',
    grade: 'Class 6-A',
    busId: 'bus-18',
    stopId: 'stop-102-1',
    parentName: 'Alok Tiwari',
    parentPhone: '+91 96214 33091',
    parentEmail: 'alok.tiwari@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&fit=crop&q=80',
    qrCodeToken: 'SIS-STU-105-ISHAAN',
    attendanceStatus: 'pending',
    boardTime: undefined
  }
];

export const INITIAL_TRIP_HISTORY: TripHistoryRecord[] = [
  {
    id: 'trip-hist-901',
    date: '2026-10-27',
    routeId: 'route-101',
    routeName: 'Force Bus Faizabad Road',
    busNumber: 'UP 62 T 4122 (Bus #12)',
    driverName: 'Ramesh Yadav',
    shift: 'morning',
    startTime: '06:15 AM',
    endTime: '07:05 AM',
    durationMinutes: 50,
    distanceKm: 18.4,
    avgSpeedKmh: 32.4,
    maxSpeedKmh: 52.0,
    studentsPresent: 4,
    studentsTotal: 4,
    stopsCount: 4,
    breadcrumbs: [
      { lat: 26.0820, lng: 82.6680, speedKmh: 0, timestamp: '06:15:00', isIdle: true },
      { lat: 26.0770, lng: 82.6705, speedKmh: 35, timestamp: '06:22:15', isIdle: false },
      { lat: 26.0690, lng: 82.6740, speedKmh: 0, timestamp: '06:35:00', isIdle: true },
      { lat: 26.0640, lng: 82.6765, speedKmh: 38, timestamp: '06:42:30', isIdle: false },
      { lat: 26.0590, lng: 82.6790, speedKmh: 0, timestamp: '06:48:00', isIdle: true },
      { lat: 26.0550, lng: 82.6820, speedKmh: 28, timestamp: '06:58:10', isIdle: false },
      { lat: 26.0538, lng: 82.6845, speedKmh: 0, timestamp: '07:05:00', isIdle: true }
    ],
    idleLocations: [
      {
        lat: 26.0820,
        lng: 82.6680,
        startTime: '06:15:00',
        durationSeconds: 150,
        description: 'Purvanchal Chauraha Pickup'
      },
      {
        lat: 26.0690,
        lng: 82.6740,
        startTime: '06:35:00',
        durationSeconds: 120,
        description: 'Galla Mandi Shahganj Boarding'
      },
      {
        lat: 26.0620,
        lng: 82.6775,
        startTime: '06:44:10',
        durationSeconds: 75,
        description: 'Railway Crossing Gate Wait'
      },
      {
        lat: 26.0590,
        lng: 82.6790,
        startTime: '06:48:00',
        durationSeconds: 90,
        description: 'Bus Stand Tiraha Stop'
      }
    ],
    stopArrivalLogs: [
      { stopId: 'stop-101-1', stopName: 'Purvanchal Chauraha', arrivedAt: '06:22 AM', studentsBoarded: 1 },
      { stopId: 'stop-101-2', stopName: 'Galla Mandi Shahganj', arrivedAt: '06:35 AM', studentsBoarded: 2 },
      { stopId: 'stop-101-3', stopName: 'Railway Station Road & Bus Stand Tiraha', arrivedAt: '06:48 AM', studentsBoarded: 1 },
      { stopId: 'stop-101-4', stopName: 'THE SOUTH INDIAN SCHOOL Main Gate', arrivedAt: '07:05 AM', studentsBoarded: 0 }
    ]
  }
];

export const INITIAL_FEES: FeeItem[] = [
  {
    id: 'fee-101-trans',
    studentId: 'stud-101', // Aarav Sharma
    title: 'Term 1 School Bus Transport Pass (Bus #12)',
    category: 'transport',
    amount: 2800.0,
    dueDate: '2026-11-15',
    status: 'pending'
  },
  {
    id: 'fee-101-tuit',
    studentId: 'stud-101', // Aarav Sharma
    title: 'Quarter 1 Tuition Fee',
    category: 'tuition',
    amount: 14500.0,
    dueDate: '2026-11-05',
    status: 'paid',
    paidAt: '2026-10-20',
    receiptNumber: 'REC-SIS-2026-8819',
    paymentMethod: 'UPI (GPay / PhonePe)'
  },
  {
    id: 'fee-101-tech',
    studentId: 'stud-101', // Aarav Sharma
    title: 'Digital Computer Lab & Library Fee',
    category: 'activities',
    amount: 1200.0,
    dueDate: '2026-11-20',
    status: 'pending'
  },
  {
    id: 'fee-102-trans',
    studentId: 'stud-102', // Ananya Verma
    title: 'Term 1 School Bus Transport Pass (Bus #12)',
    category: 'transport',
    amount: 2800.0,
    dueDate: '2026-11-15',
    status: 'paid',
    paidAt: '2026-10-22',
    receiptNumber: 'REC-SIS-2026-9041',
    paymentMethod: 'RuPay Debit Card (••4910)'
  },
  {
    id: 'fee-102-tuit',
    studentId: 'stud-102', // Ananya Verma
    title: 'Quarter 1 Tuition Fee',
    category: 'tuition',
    amount: 14500.0,
    dueDate: '2026-11-05',
    status: 'pending'
  },
  {
    id: 'fee-103-composite',
    studentId: 'stud-103', // Vihaan Gupta
    title: 'Term 1 Composite Tuition & Bus Fee',
    category: 'composite',
    amount: 17300.0,
    dueDate: '2026-11-10',
    status: 'pending'
  }
];
