import { Router } from 'express';
import { parkingController } from '../controllers/parkingController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.put('/:id', authenticate, requireRole('MANAGER','ADMIN'), parkingController.updateParkingZone);

export default router;
