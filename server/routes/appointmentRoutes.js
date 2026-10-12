import express from 'express';
import {
  createAppointment,
  getUserAppointments,
  getBookedSlots,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createAppointment);
router.get('/', protect, getUserAppointments);
router.get('/booked-slots', getBookedSlots);
router.patch('/:id/cancel', protect, cancelAppointment);

export default router;
