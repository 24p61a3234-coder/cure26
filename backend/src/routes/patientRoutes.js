import express from 'express';
import {
  createPatient,
  deletePatient,
  getPatientEstimate,
  getPatients,
  updatePatientStatus
} from '../controllers/patientController.js';
import { allowRoles, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getPatients);
router.post('/', allowRoles('receptionist', 'admin'), createPatient);
router.delete('/:id', allowRoles('receptionist', 'admin'), deletePatient);
router.patch('/:id/status', allowRoles('receptionist', 'doctor', 'admin'), updatePatientStatus);
router.get('/estimate/:tokenNumber', getPatientEstimate);

export default router;
