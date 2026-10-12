import express from 'express';
import {
  getDoctors,
  getSpecializations,
  getDoctorById,
  createDoctor,
} from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctorById);
router.post('/', protect, createDoctor);

export default router;
