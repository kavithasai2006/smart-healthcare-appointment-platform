# Smart Healthcare Appointment Platform (SmartCare)

A modern, full-stack healthcare appointment platform built for Andhra Pradesh medical networks using **React + Vite**, **Node.js + Express**, and **MongoDB with Mongoose**.

---

## 🏥 Architecture Overview

```text
React 18 + Vite (SPA)
         │ (HTTP / JSON REST API with JWT)
         ▼
Node.js + Express Backend (Port 5000)
         │ (Mongoose ODM / Partial Compound Unique Indexes)
         ▼
MongoDB Database (`smart_healthcare` on localhost:27017 or MongoDB Atlas)
         ▲
         │
MongoDB Compass (Local Database Management)
```

### Core Collections in `smart_healthcare`:
- `locations`: Supported Andhra Pradesh locations (Visakhapatnam, Vijayawada, Guntur, Tenali, Tirupati, Nellore, Kakinada, Rajahmundry, Ongole, Kurnool, Kadapa, Anantapur, Eluru).
- `hospitals`: Multi-speciality and regional healthcare centers with location references, phone, ratings, and specialties.
- `doctors`: Specialists linked to hospitals with experience, consultation fee, available days, and slot arrays.
- `users`: Registered patients and administrators with bcrypt-hashed passwords and JWT authentication.
- `appointments`: Consultations referencing User, Doctor, Hospital, and Location with concurrency protection.

---

## ✨ Features Implemented

### 1. Feature A — Smart Hospital Finder
- **Location-Based Discovery:** Real-time selector for 13 supported Andhra Pradesh cities.
- **Hospital Exploration:** Card grid displaying address, verified/sample facility badge, emergency phone, ratings, and medical specialities.
- **Hospital Details Modal:** Interactive modal showing hospital profile, key departments, and all doctors practicing at that facility.
- **Direct Specialist Booking:** Filter specialists by department within the hospital modal and launch the booking modal immediately without losing location context.

### 2. Feature B — Live Doctor Availability & Concurrency Protected Slots
- **Doctor Comparison:** Compare credentials, experience, consultation fees, and available days across multiple doctors in each department.
- **Time Slot Engine:** Live slot selection dynamically excluding booked slots for that doctor and date.
- **Backend Concurrency Protection:** Partial compound unique index on `{ doctor: 1, appointmentDate: 1, appointmentTime: 1 }` with `partialFilterExpression: { status: { $in: ['Confirmed', 'Pending'] } }`.
- **Race Condition Handling:** Parallel booking attempts for the same doctor/date/time result in exactly one successful confirmation (HTTP 201) and an atomic HTTP 409 Conflict rejection for the other.
- **Slot Release on Cancellation:** Cancelled consultations are excluded from the unique index, immediately freeing up the time slot for other patients.

### 3. Feature C — Patient Dashboard
- **Patient Profile Summary:** Verified patient name, email, phone number, and account role tag.
- **Self-Service Profile Updates:** Secure `PUT /api/auth/profile` allowing patients to update their contact details safely.
- **Categorized Consultation Tabs:**
  - **Upcoming Consultations:** Future active appointments with doctor, hospital, date, time, and one-click cancellation.
  - **Past Consultations:** Completed or historical medical consultations.
  - **Cancelled Bookings:** Historical cancelled appointments.
- **Security & Authorization:** Backend middleware enforces that patients can only retrieve and cancel their own appointments (`req.user._id`), rejecting cross-patient tampering attempts with HTTP 403 Forbidden.

### 4. Feature D — Admin Dashboard & Role-Based Access Control (RBAC)
- **Backend RBAC:** `protect` and `admin` middleware safeguard all `/api/admin/*` endpoints. Non-admin tokens are strictly rejected with HTTP 403.
- **System Metrics & Overview:** Live counters for total hospitals, doctors, locations, active consultations, cancellations, and completed visits.
- **Hospital Management:** Add new hospitals, update addresses/phone numbers/specialties, and toggle facility active status without affecting appointment history.
- **Doctor Management:** Register new specialists, assign them to hospitals, manage consultation fees and schedules, and toggle active status.
- **Location Governance:** Andhra Pradesh regional validation prevents non-AP cities from being added.
- **Appointment Management:** Search, filter, and update consultation status (Confirmed, Completed, Cancelled).

---

## 🔐 Initial Admin Configuration

An initial system administrator can be safely created using the repeatable seed command:

```bash
cd server
npm run create-admin
```

Default administrator credentials:
- **Email:** `admin@smartcare.com`
- **Password:** `Admin@SmartCare2026`
- **Role:** `admin`

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Community Server running on `127.0.0.1:27017`
- MongoDB Compass for database visualization

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
```
The Express backend starts at `http://localhost:5000` connected to `mongodb://127.0.0.1:27017/smart_healthcare`.

### 2. Frontend Setup
```bash
# In the root project directory
npm install
npm run dev
```
The React + Vite application will be available at `http://localhost:5173`.

---

## 🧪 Testing & Verification

Run the automated end-to-end verification suite:

```bash
node server/verify_all_features.cjs
```

The test suite validates:
1. Backend health & MongoDB connection to `smart_healthcare`.
2. Andhra Pradesh location restriction & hospital filtering.
3. Doctor schedule availability and specialization filtering.
4. Concurrency race conditions (simultaneous duplicate booking returns HTTP 409 Conflict).
5. Appointment cancellation & slot release.
6. Patient profile self-editing & cross-user authorization enforcement.
7. Admin RBAC protection (HTTP 403 on non-admin tokens, HTTP 200 on admin tokens).
8. Admin hospital creation, doctor assignment, and location policy enforcement.

To run the frontend production build:
```bash
npm run build
```

---

## 🌐 Production Deployment Guide

### 1. Database
- Replace local `mongodb://127.0.0.1:27017/smart_healthcare` with a managed **MongoDB Atlas** cluster URI.
- Whitelist the production server IP addresses in MongoDB Atlas Network Access.

### 2. Backend Environment Variables (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_healthcare?retryWrites=true&w=majority
JWT_SECRET=<secure_random_production_secret>
FRONTEND_URL=https://your-production-domain.com
```

### 3. Frontend Environment Variables (`.env.production`)
```env
VITE_API_BASE_URL=https://api.your-production-domain.com/api
```

### 4. Build Commands
- Frontend build command: `npm run build`
- Backend start command: `node server.js`
