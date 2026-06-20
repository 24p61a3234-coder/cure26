import express from 'express';
import { callNextPatient, getCurrentQueue } from '../controllers/queueController.js';
import { allowRoles, protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/next', allowRoles('receptionist', 'doctor', 'admin'), callNextPatient);
router.get('/current', getCurrentQueue);

export default router;
