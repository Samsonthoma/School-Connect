# School Connect - School Transport Management System

> **Unified 3-in-1 School Fleet Management Platform**: Admin Fleet Command, Driver Android Portal, and Parent Live Tracker with In-App Masked Voice Calling and Online School Fees Payments.

---

## Table of Contents
1. [Overview & Architectural Highlights](#1-overview--architectural-highlights)
2. [How to Operate the System](#2-how-to-operate-the-system)
   - [Admin Fleet Command](#a-admin-fleet-command)
   - [Driver Android Application](#b-driver-android-application)
   - [Parent Live Portal](#c-parent-live-portal)
   - [Stand-in Driver WhatsApp Web Link](#d-stand-in-driver-whatsapp-web-link)
3. [Key New Capabilities](#3-key-new-capabilities)
   - [In-App Masked Calling (VoIP Number Privacy)](#in-app-masked-calling-voip-number-privacy)
   - [Online School & Transport Fees Portal](#online-school--transport-fees-portal)
   - [Standard Street Map View](#standard-street-map-view)
4. [Database Setup & Schema Guide](#4-database-setup--schema-guide)
   - [Option 1: PostgreSQL / Cloud SQL / Supabase (Recommended)](#option-1-postgresql--cloud-sql--supabase)
   - [Option 2: Firebase Firestore](#option-2-firebase-firestore)
5. [Packaging & Publishing to Google Play Console](#5-packaging--publishing-to-google-play-console)
   - [Step 1: Android Build via Capacitor](#step-1-android-build-via-capacitor)
   - [Step 2: Android Permissions Configuration](#step-2-android-permissions-configuration)
   - [Step 3: Generate Upload Keystore & Build Release AAB](#step-3-generate-upload-keystore--build-release-aab)
   - [Step 4: Google Play Console Submission Checklist](#step-4-google-play-console-submission-checklist)
6. [How to Push This Repository to GitHub](#6-how-to-push-this-repository-to-github)
7. [Local Development Commands](#7-local-development-commands)

---

## 1. Overview & Architectural Highlights

**THE SOUTH INDIAN SCHOOL Transport Management System (BusTrak)**
- **Institution**: THE SOUTH INDIAN SCHOOL
- **Location & Depot**: Shahganj, Jaunpur, Uttar Pradesh - 223101
- **School Helplines**: +91 9598142455 / +91 9532546785
- **Default Currency**: Indian Rupee (₹ INR) with UPI, RuPay, and Net Banking checkout

BusTrak delivers a complete school transport operating system in one unified codebase:
- **No Third-Party Tracker App Lock-in**: Connect dedicated BusTrak GPS devices, existing 3rd-party fleet trackers (Teltonika/Geotab API), or driver smartphones.
- **Privacy First (Number Masking & In-App Ringing)**: Neither driver nor parent can see each other's real telephone numbers. Phone calls ring directly inside the app with synthesized dual-frequency ringing without launching the default native dialer.
- **Hands-Free Parent Experience**: Spoken voice announcements ("Bus has started", "Bus approaching your stop") powered by the Web Speech API.
- **Integrated Fee Management**: Pay tuition, bus transport passes, and activity fees with instant downloadable receipts in ₹ INR.
- **Zero-Install Relief Driver Tracking**: Stand-in drivers can stream live GPS from their mobile browser via a single WhatsApp link.

---

## 2. How to Operate the System

### A. Admin Fleet Command
1. **Live Fleet Map**:
   - Navigate to **Admin Fleet -> Fleet Map**.
   - Active buses automatically pulse green on the standard street map centered on Shahganj, Jaunpur (`[26.0538, 82.6845]`).
   - Click any bus pin to view license plate (e.g., UP 62 T 4122), assigned driver (e.g., Ramesh Yadav), current speed, tracking hardware source, and last ping timestamp.
2. **Interactive Route & Stop Editor**:
   - Go to **Route & Stop Editor**. Select the target route (e.g., Route 101: Faizabad Road Line).
   - Click **Drop New Stop Pin** and tap anywhere on the map to add a stop.
   - Click **Markers Draggable: ON** to drag any stop pin to fine-tune its latitude/longitude.
   - Edit stop pickup and drop-off timings directly inline.
   - Configure **Automatic Trips** morning/afternoon schedules so buses automatically begin tracking when departing the depot.
3. **GPS Device Health & Live Probing**:
   - Go to **GPS Health**.
   - Review each vehicle's hardware status: Online state, 13.8V vehicle power, ignition switch, and GPS satellite fix.
   - Tap **Check Now (Live Answer)** to perform an on-demand hardware telemetry diagnostic probe.
   - If bus power is cut or a tracker goes offline during a trip, dispatch alert emails are automatically logged.
4. **Student Directory & Bulk CSV Ingestion**:
   - Go to **Students & Photos**.
   - Click **Bulk Import CSV** to import student rosters with format: `name,grade,bus,parent_name,phone`.
   - Click **Upload Photo** to update circular avatars for students and drivers.
   - Tap **View QR Pass** to generate and print boarding passes with unique QR tokens.
5. **Replacement Bus & Driver Assignment**:
   - Click **Replacement Bus** in the top navigation or fleet sidebar.
   - Fill in replacement vehicle plate, relief driver name, phone, reason, and auto-revert date/time.
   - Broadcasts instant notifications to parents and sets an active substitution banner across parent and driver apps.
6. **Ride Replay & Stop Idle Analysis**:
   - Go to **Ride Replay**.
   - Select any historical trip to view the path driven.
   - Press **Play** or scrub the timeline slider to view the bus position and real-time speed readout.
   - Red **P** markers pinpoint every location where the bus was stationary with duration and reason.

---

### B. Driver Android Application
1. **Login**:
   - Enter your School Code (`SIS-2026`) and registered Driver Email (e.g., `ramesh.yadav@southindianschool.org`).
2. **Starting a Trip**:
   - Tap **Start Morning Trip**. GPS tracking immediately runs in the background.
   - Select between hardware device telemetry or **Use Phone GPS** to track via the phone's native geolocation sensor.
3. **Stop Arrival Tracking**:
   - As the bus approaches within 120 meters of a stop, the system auto-detects arrival (or the driver can tap **Tap Arrived**).
   - Triggers once per stop with duplicate protection, notifying all parents assigned to that stop.
4. **Student Attendance Roster**:
   - View students assigned to the current stop.
   - Tap **Check (✓)** for present or **Cross (✕)** for absent.
5. **QR Code Boarding Pass Scanner**:
   - Tap **Scan Student QR Card** at boarding to open the camera viewfinder.
   - Student is immediately marked present with an exact boarding timestamp.
6. **Calling Parents (Number Masked & Rings Inside App)**:
   - Tap the **Phone Call** icon next to any student.
   - The phone rings directly in the app with dual-frequency audio; numbers are masked (`+91 95981 ••••55`). The native system dialer does not open.

---

### C. Parent Live Portal
1. **Live GPS Tracking**:
   - View your child's assigned bus on the standard street map, updated automatically every 10 seconds.
   - The bus marker pulses green when actively moving along the route.
2. **Arrival Time & Stop Proximity**:
   - Live ETA countdown displays minutes remaining until the bus reaches your pickup stop.
3. **Voice Announcements**:
   - Toggle the audio volume icon in the header or parent strip.
   - Hands-free audio alerts announce: *"Bus has started"*, *"Bus approaching your stop"*, *"Bus has reached your stop"*, and *"Bus arrived at school"*.
4. **Calling the Bus Driver (Number Masked)**:
   - In the Driver Profile card, tap **Call Driver**.
   - Initiates an in-app encrypted voice call with audio duration timer, mute, and speakerphone controls.
   - **Privacy Notice**: The driver's personal phone number is completely hidden.
5. **School & Transport Fees**:
   - View pending transport passes, tuition fees, and lab fees.
   - Tap **Manage / Pay Fees** to open the secure checkout modal.
   - Choose Credit/Debit Card, Google Pay, or ACH Direct Debit.
   - Authorize payment to receive an instant official school receipt (`REC-OAK-XXXXXX`) with one-click print/download support.

---

### D. Stand-in Driver WhatsApp Web Link
1. Admin selects the vehicle under **Stand-in Link** and clicks **Send Direct Link on WhatsApp**.
2. The relief driver opens the link in Chrome/Safari on their phone.
3. No app installation or login is required.
4. The driver taps **Start Web GPS Tracking**, streaming coordinates directly to the central fleet map for the duration of the shift.

---

## 3. Key New Capabilities

### In-App Masked Calling (VoIP Number Privacy)
- **Problem Solved**: Drivers and parents often need to communicate regarding late arrivals or delays, but sharing personal mobile numbers creates harassment risks and compliance liabilities.
- **Implementation**:
  - Direct in-app VoIP screen with timer, mute/unmute, earpiece/speakerphone, and hang-up controls.
  - Number masking algorithm transforms numbers into carrier VoIP proxies (e.g., `+1 (512) •••-••92 (VoIP Relay)`).
  - The system bypasses external phone dialers (`tel:` links), keeping contact details strictly private.

### Online School & Transport Fees Portal
- Supports category breakdown: Bus Fleet Transport, Academic Tuition, Lab & Activities.
- Features one-click payment checkout with card, Google Pay, and ACH options.
- Generates official receipt reference IDs with printable PDF-friendly layout.
- Admin dashboard includes a fee collection ledger with category filters and manual cash recording.

### Standard Street Map View
- Standard OpenStreetMap street cartography with crisp road names, buildings, stops, and school campus landmarks.
- Compliant with accessible light-mode contrast standards.

---

## 4. Database Setup & Schema Guide

### Option 1: PostgreSQL / Cloud SQL / Supabase

Run the following SQL migration script to set up all required tables:

```sql
-- 1. Routes Table
CREATE TABLE routes (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  color VARCHAR(16) DEFAULT '#3b82f6',
  school_lat DOUBLE PRECISION NOT NULL,
  school_lng DOUBLE PRECISION NOT NULL,
  morning_departure TIME NOT NULL,
  morning_arrival TIME NOT NULL,
  afternoon_departure TIME NOT NULL,
  afternoon_arrival TIME NOT NULL,
  auto_start_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Stops Table
CREATE TABLE stops (
  id VARCHAR(64) PRIMARY KEY,
  route_id VARCHAR(64) REFERENCES routes(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  stop_order INT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  scheduled_am TIME NOT NULL,
  scheduled_pm TIME NOT NULL,
  radius_meters INT DEFAULT 120
);

-- 3. Drivers Table
CREATE TABLE drivers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  phone VARCHAR(32) NOT NULL,
  school_code VARCHAR(32) NOT NULL,
  photo_url TEXT,
  license_number VARCHAR(64),
  years_experience INT DEFAULT 0
);

-- 4. Buses & GPS Hardware Table
CREATE TABLE buses (
  id VARCHAR(64) PRIMARY KEY,
  number_plate VARCHAR(32) NOT NULL,
  bus_name VARCHAR(128) NOT NULL,
  capacity INT DEFAULT 48,
  route_id VARCHAR(64) REFERENCES routes(id),
  driver_id VARCHAR(64) REFERENCES drivers(id),
  tracking_source VARCHAR(32) DEFAULT 'bustrak_device', -- bustrak_device, 3rd_party_gps, driver_phone
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  current_speed INT DEFAULT 0,
  heading_deg INT DEFAULT 0,
  is_trip_active BOOLEAN DEFAULT FALSE,
  is_device_online BOOLEAN DEFAULT TRUE,
  bus_power BOOLEAN DEFAULT TRUE,
  ignition BOOLEAN DEFAULT TRUE,
  gps_fix BOOLEAN DEFAULT TRUE,
  voltage NUMERIC(4, 2) DEFAULT 13.80,
  battery_level INT DEFAULT 100,
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Students Table
CREATE TABLE students (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  grade VARCHAR(32) NOT NULL,
  bus_id VARCHAR(64) REFERENCES buses(id),
  stop_id VARCHAR(64) REFERENCES stops(id),
  parent_name VARCHAR(128) NOT NULL,
  parent_phone VARCHAR(32) NOT NULL,
  parent_email VARCHAR(128) NOT NULL,
  photo_url TEXT,
  qr_token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Attendance Logs Table
CREATE TABLE attendance_logs (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(64) REFERENCES students(id),
  bus_id VARCHAR(64) REFERENCES buses(id),
  stop_id VARCHAR(64) REFERENCES stops(id),
  status VARCHAR(16) NOT NULL, -- present, absent
  method VARCHAR(16) NOT NULL, -- qr, manual
  board_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. School & Transport Fees Table
CREATE TABLE fees (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) REFERENCES students(id),
  title VARCHAR(128) NOT NULL,
  category VARCHAR(32) NOT NULL, -- transport, tuition, activities
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(16) DEFAULT 'pending', -- pending, paid, overdue
  paid_at TIMESTAMP WITH TIME ZONE,
  receipt_number VARCHAR(64),
  payment_method VARCHAR(64)
);
```

---

### Option 2: Firebase Firestore Structure

If using Firebase, structure your Firestore collections as follows:
- `routes/{routeId}`: metadata, school coordinates, timing windows.
  - Subcollection: `stops/{stopId}`: order, lat, lng, radius (120m).
- `buses/{busId}`: current position, speed, health telemetry (`online`, `busPower`, `ignition`, `gpsFix`), replacement records.
- `drivers/{driverId}`: credentials, school code, photo URL.
- `students/{studentId}`: grade, bus ID, stop ID, parent info, `qrCodeToken`.
- `fees/{feeId}`: student ID, title, category, amount, status, receipt number.
- `trips/{tripId}`: trip logs, breadcrumb arrays, idle locations, stop arrivals.

---

## 5. Packaging & Publishing to Google Play Console

Follow these steps to package the React web app into an Android App Bundle (`.aab`) for Google Play.

### Step 1: Android Build via Capacitor
In the project directory, install Capacitor:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "BusTrak" "com.bustrak.schooltransport" --web-dir dist
npm run build
npx cap add android
```

### Step 2: Android Permissions Configuration
Open `android/app/src/main/AndroidManifest.xml` and ensure the following permissions are present:
```xml
<!-- Background GPS tracking for drivers -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

<!-- Camera for student QR scanning -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Audio microphone for in-app masked VoIP calls -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- Push notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.INTERNET" />
```

### Step 3: Generate Upload Keystore & Build Release AAB
1. Generate an upload keystore:
   ```bash
   keytool -genkey -v -keystore bustrak-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias bustrak-key
   ```
2. Configure credentials in `android/app/build.gradle`.
3. Build the release Android App Bundle:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   The generated bundle will be at: `android/app/build/outputs/bundle/release/app-release.aab`.

### Step 4: Google Play Console Submission Checklist
1. **Create App**: Sign in to [Google Play Console](https://play.google.com/console), click **Create app**, select **BusTrak**, choose **App** and **Free**.
2. **Set up Store Listing**:
   - Short description: *"School transport management with live GPS, QR attendance, and masked VoIP calling."*
   - Upload high-resolution icon (512x512 PNG), feature graphic (1024x500 PNG), and phone/tablet screenshots.
3. **App Content Declarations**:
   - **Privacy Policy**: Provide URL outlining location and student privacy compliance (COPPA / FERPA compliant).
   - **Target Audience**: Select Families / School Education.
   - **Location in Background**: Declare justification for school bus driver navigation during active pickup shifts.
4. **Internal / Closed Testing**:
   - Under **Testing -> Internal testing**, upload `app-release.aab`.
   - Add driver and parent test email accounts to verify live tracking.
5. **Roll out to Production**:
   - After internal verification, promote the release to Production review.

---

## 6. How to Push This Repository to GitHub

The local Git repository is already initialized with the `main` branch and initial commit. To push it to your GitHub account:

1. Create a new empty repository on [GitHub](https://github.com/new) named `school-transport-management-system` (do not initialize with a README since one already exists).
2. Connect your GitHub remote and push:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/school-transport-management-system.git
   git push -u origin main
   ```
3. If using the GitHub CLI (`gh`):
   ```bash
   gh repo create school-transport-management-system --public --source=. --remote=origin --push
   ```

---

## 7. Local Development Commands

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run TypeScript compilation check
npm run lint

# Build production bundle
npm run build
```
