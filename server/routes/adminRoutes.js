import express from 'express';
import {
  getAdminStats,
  getAdminHospitals,
  createHospital,
  updateHospital,
  toggleHospitalActive,
  getAdminDoctors,
  createDoctor,
  updateDoctor,
  toggleDoctorActive,
  getAdminLocations,
  createLocation,
  getAdminAppointments,
  updateAppointmentStatus,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce both JWT authentication and admin role for all admin routes
router.use(protect, admin);

// Dashboard Statistics
router.get('/stats', getAdminStats);

// Hospital Management
router.get('/hospitals', getAdminHospitals);
router.post('/hospitals', createHospital);
router.put('/hospitals/:id', updateHospital);
router.patch('/hospitals/:id/toggle-active', toggleHospitalActive);

// Doctor Management
router.get('/doctors', getAdminDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.patch('/doctors/:id/toggle-active', toggleDoctorActive);

// Location Management
router.get('/locations', getAdminLocations);
router.post('/locations', createLocation);

// Appointment Management
router.get('/appointments', getAdminAppointments);
router.patch('/appointments/:id/status', updateAppointmentStatus);

export default router;
