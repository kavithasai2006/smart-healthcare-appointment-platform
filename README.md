# Smart Healthcare Appointment Platform

A modern, responsive, and component-based healthcare appointment booking web application built using **React**, **Vite**, and **React Router DOM**. Converted from a legacy HTML/CSS/JavaScript codebase into a clean, modular React architecture while preserving the original **SmartCare** healthcare design, color scheme, and intuitive user workflow.

---

## 🏥 Project Overview

**Smart Healthcare Appointment Platform (SmartCare)** enables patients to discover qualified healthcare specialists (Cardiologists, Dermatologists, Neurologists, Pediatricians), check doctor credentials, search dynamically by name or specialization, and book appointments through a structured, validated patient intake modal. The system also includes user registration/login and an appointment management dashboard with full cancellation capability.

---

## ✨ Features

- **Responsive & Clean UI:** Preserved hospital/healthcare branding with custom color palette (`#087f8c` primary, `#e8f8fa` light healthcare background, `#073b4c` footer).
- **Component-Driven Architecture:** Modular header, footer, doctor cards, and modal components for clear separation of concerns.
- **Dynamic Search & Filtering:** Instant, real-time search across doctor names and medical specializations using React state.
- **Client-Side Authentication:**
  - Register new patient accounts with full input validation (email format, 6+ character passwords, confirmation match, duplicate email check).
  - Login system verifying stored credentials.
  - Persistent login session across browser refreshes.
  - Context API (`AuthContext`) providing global auth state and hooks.
- **Interactive Booking Modal:**
  - Protected booking flow: prompts unauthenticated users to log in before booking.
  - Patient health metrics collection: Age, Gender, Phone, Height (cm), Weight (kg), Blood Pressure, Appointment Date, and Time slot.
  - Strict input validation (10-digit phone number, bounded numerical values for age, height, and weight).
  - Outside click (backdrop) & close button dismissal.
- **Appointment Management ("My Appointments"):**
  - Displays all booked appointments in clear, structured cards.
  - Cancel appointment feature with browser confirmation dialog and automatic state sync.
- **Client-Side Routing:** Fast, smooth page transitions without page reload using `react-router-dom` (Home, Doctors, Appointments, Login, Register).

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **React 18** | Frontend library for building UI components & managing state |
| **Vite** | Fast, next-generation frontend build tool and dev server |
| **React Router DOM v6** | Single-page application (SPA) client-side routing |
| **Vanilla CSS** | Modern, maintainable custom stylesheet without heavy third-party CSS libraries |
| **Browser LocalStorage** | Client-side persistence for user credentials and appointment records |
| **Context API** | Global state management for user authentication |

---

## 📁 Project Structure

```text
smart-healthcare-react/
│
├── public/
│   └── favicon.svg               # Medical cross platform favicon
│
├── src/
│   ├── components/
│   │   ├── Header.jsx            # Sticky navigation bar with dynamic auth status
│   │   ├── Footer.jsx            # Standardized SmartCare footer
│   │   ├── DoctorCard.jsx        # Reusable doctor profile card component
│   │   └── BookingModal.jsx      # Modal popup with patient intake form & validation
│   │
│   ├── pages/
│   │   ├── Home.jsx              # Landing page with hero banner & feature cards
│   │   ├── Doctors.jsx           # Doctor catalog with live search & booking triggers
│   │   ├── Appointments.jsx      # Appointment management with cancellation
│   │   ├── Login.jsx             # User login page
│   │   └── Register.jsx          # New user registration page
│   │
│   ├── data/
│   │   └── doctors.js            # Initial dataset of medical specialists
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Context API provider for authentication & sessions
│   │
│   ├── App.jsx                   # Route configurations and layout wrapper
│   ├── main.jsx                  # Application entry point with BrowserRouter & AuthProvider
│   └── style.css                 # Single consolidated stylesheet for all components
│
├── .gitignore                    # Excludes node_modules, build artifacts, and env files
├── index.html                    # Root HTML file hosting the React root element
├── package.json                  # Project dependencies and npm scripts
├── vite.config.js                # Vite configuration with React plugin
└── README.md                     # Comprehensive project documentation
```

---

## ⚠️ Important Note on Authentication & Storage

> **Academic Project Note:**
> This application is developed for educational demonstration, viva examination, and academic presentation purposes. Authentication and appointment records are persisted entirely client-side using browser **LocalStorage** (`smartcareUsers`, `smartcareUser`, and `appointments`). In a production-grade enterprise system, passwords would be salted and hashed, and transactions would be handled by a secure backend API connected to a persistent relational or NoSQL database.

---

## 🚀 Getting Started & Installation

### Prerequisites

Ensure you have **Node.js** (v18 or higher recommended) and **npm** installed on your computer.

Check version by running:
```bash
node -v
npm -v
```

### Installation Steps

1. Open your terminal in the project root directory:
   ```bash
   cd "smart-healthcare-react"
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL shown in your terminal (usually `http://localhost:5173`).

### Production Build

To build the production-ready bundle:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 🧪 Testing the Application (Viva & Demo Guide)

### 1. Test Registration & Login
1. Click **Login** in the top navigation bar.
2. Click **Register here** to navigate to `/register`.
3. Fill out the registration form:
   - Full Name: `Jane Doe`
   - Email: `jane@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click **Register**. You will see a success confirmation and be redirected to `/login`.
5. Enter the registered credentials (`jane@example.com` / `password123`) and click **Login**.
6. Observe the top header update automatically to display: **"Hi, Jane Doe"** and a **"Logout"** button.

### 2. Test Doctor Search
1. Navigate to **Doctors** in the navigation bar or click **Book an Appointment** from the Home page.
2. In the search box, type `Cardio` -> Only **Dr. Rajesh Kumar** is displayed.
3. Clear and type `Priya` -> Only **Dr. Priya Sharma** is displayed.
4. Type a non-existent name like `xyz` -> **"No doctors found."** message appears.

### 3. Test Appointment Booking
1. While logged in, click **Book Appointment** on any doctor card (e.g., Dr. Rajesh Kumar).
2. The modal pops up showing **Dr. Rajesh Kumar - Cardiologist**.
3. Fill in the required health metrics:
   - Age: `28`
   - Gender: `Female`
   - Phone: `9876543210` (must be 10 digits)
   - Height: `165`
   - Weight: `60`
   - Blood Pressure: `120/80`
   - Appointment Date: Select an upcoming date
   - Appointment Time: Select `10:00 AM`
4. Click **Confirm Appointment**.
5. An alert confirms the booking and you are redirected to the **My Appointments** page.

### 4. Test Appointment Cancellation
1. On the **Appointments** page, find your booked appointment card.
2. Click **Cancel Appointment**.
3. Confirm the browser dialog prompt (`"Are you sure you want to cancel this appointment?"`).
4. The appointment card is immediately removed from the view and from LocalStorage, and a confirmation message is displayed.

---

## 📦 Pushing to GitHub

To publish this project to your GitHub repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all project files
git add .

# 3. Commit changes
git commit -m "Convert SmartCare healthcare platform to React + Vite with Auth & LocalStorage"

# 4. Set branch to main
git branch -M main

# 5. Link your remote GitHub repository (replace with your repo URL)
git remote add origin https://github.com/your-username/smart-healthcare-react.git

# 6. Push to GitHub
git push -u origin main
```

---

## 📄 License & Credits

Developed as part of the **Smart Healthcare Appointment Platform** project. All rights reserved © 2026 SmartCare.
