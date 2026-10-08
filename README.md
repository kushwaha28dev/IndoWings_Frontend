# IndoWings Aerial Logistics - Frontend Web & Mobile Application

Modern, real-time autonomous drone delivery and logistics command center built with React, TypeScript, Vite, Tailwind CSS, and Lucide Icons.

---

## 📂 Files Sitemap & Setup Guide (Kahan Kya Milega)

| File Name / Purpose | Exact Repository Path | Description |
| :--- | :--- | :--- |
| **Android Firebase Config** | `android/app/google-services.json` | Main `google-services.json` file for React Native Android builds |
| **Web Assets Firebase Config** | `public/google-services.json` | Backup / Web static asset copy of `google-services.json` |
| **Environment Template** | `.env.example` | Template file containing all active Firebase & Razorpay environment variables |
| **Active Environment File** | `.env` | Local environment variables file (copy from `.env.example`) |

---

## Environment Variables (.env & .env.example)

Create a `.env` file in the root of the `client` directory with the following exact ChotU Firebase credentials:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_SKjbolJvdxju2R

# Firebase Config - ChotU (Project ID: chotu-4d1e0)
VITE_FIREBASE_API_KEY=AIzaSyBlaKIqDS15uSbSeRLDCSzuc5KFv2EgUdg
VITE_FIREBASE_AUTH_DOMAIN=chotu-4d1e0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=chotu-4d1e0
VITE_FIREBASE_STORAGE_BUCKET=chotu-4d1e0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=947976549226
VITE_FIREBASE_APP_ID=1:947976549226:android:bf8ee7d1e2371a3984eb13
VITE_FIREBASE_PACKAGE_NAME=com.chotu.chotu_customer_app
VITE_FIREBASE_VAPID_KEY=BBRSZ36_Y3pX2CocpJfF9J3kP35Heiet86d0CgxRuOYF-eb1jMD30D6SeDjd9_UzJRCWgXpkBOffk1jmxTsFjpc
```

## Firebase JavaScript Config Object Reference (ChotU)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBlaKIqDS15uSbSeRLDCSzuc5KFv2EgUdg",
  authDomain: "chotu-4d1e0.firebaseapp.com",
  projectId: "chotu-4d1e0",
  storageBucket: "chotu-4d1e0.firebasestorage.app",
  messagingSenderId: "947976549226",
  appId: "1:947976549226:android:bf8ee7d1e2371a3984eb13"
};
```

---

## Features
- **Live Drone Tracking**: Real-time GPS flight simulation, altitude, speed gauges, and interactive radar map.
- **Flight Dispatch & Order Booking**: Instant multi-point corridor routing, aerial distance calculation, and Razorpay integration.
- **Firebase Auth & FCM Notifications**: Phone OTP verification and Push Notifications for air corridor flight alerts.
- **AI Copilot & Tracking Chatbot**: Integrated customer support assistant with OTP verification and instant live telemetry HUD.
- **Fleet Showcase**: Specifications and DGCA certifications for Cyberone Pro, Cyberone Max, Cyberone Lite, and S-500 VTOL.
- **Customer & Admin Dashboards**: Order history, live flight cancellation, feedback system, and expert pilot consultations.

## Tech Stack
- **Framework**: React 18 / React Native + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Firebase**: Auth (Phone OTP) + FCM (Cloud Messaging)
- **Maps & UI**: Leaflet / Custom radar canvas & animated telemetry HUDs

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run preview
```
