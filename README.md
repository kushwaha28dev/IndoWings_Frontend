# IndoWings Aerial Logistics - Frontend Web Application

Modern, real-time autonomous drone delivery and logistics command center built with React, TypeScript, Vite, Tailwind CSS, and Lucide Icons.

## Environment Variables (.env & .env.example)

Create a `.env` file in the root of the `client` directory with the following exact variables:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_SKjbolJvdxju2R

# Firebase Web App Config (Project: indofleet-e3ef8)
VITE_FIREBASE_API_KEY=AIzaSyCP_I6W0j_xoAoYJTuDtFFC9Mepo9DRdlw
VITE_FIREBASE_AUTH_DOMAIN=indofleet-e3ef8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=indofleet-e3ef8
VITE_FIREBASE_STORAGE_BUCKET=indofleet-e3ef8.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=526465525994
VITE_FIREBASE_APP_ID=1:526465525994:web:62f6d6bb51564455050f93
VITE_FIREBASE_MEASUREMENT_ID=G-2YB3W191KH
VITE_FIREBASE_VAPID_KEY=YOUR_PUBLIC_VAPID_KEY_FROM_FIREBASE_CONSOLE
```

## Firebase JavaScript Config Object Reference
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCP_I6W0j_xoAoYJTuDtFFC9Mepo9DRdlw",
  authDomain: "indofleet-e3ef8.firebaseapp.com",
  projectId: "indofleet-e3ef8",
  storageBucket: "indofleet-e3ef8.firebasestorage.app",
  messagingSenderId: "526465525994",
  appId: "1:526465525994:web:62f6d6bb51564455050f93",
  measurementId: "G-2YB3W191KH"
};
```

## Features
- **Live Drone Tracking**: Real-time GPS flight simulation, altitude, speed gauges, and interactive radar map.
- **Flight Dispatch & Order Booking**: Instant multi-point corridor routing, aerial distance calculation, and Razorpay integration.
- **Firebase Auth & FCM Notifications**: Phone OTP verification and Push Notifications for air corridor flight alerts.
- **AI Copilot & Tracking Chatbot**: Integrated customer support assistant with OTP verification and instant live telemetry HUD.
- **Fleet Showcase**: Specifications and DGCA certifications for Cyberone Pro, Cyberone Max, Cyberone Lite, and S-500 VTOL.
- **Customer & Admin Dashboards**: Order history, live flight cancellation, feedback system, and expert pilot consultations.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
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
