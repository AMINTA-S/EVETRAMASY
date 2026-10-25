import { Router } from 'express';
import { trafficController } from '../controllers/trafficController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.put('/:id', authenticate, requireRole('MANAGER','ADMIN'), trafficController.updateTrafficZone);
router.put('/gates/:id', authenticate, requireRole('MANAGER','ADMIN'), trafficController.updateGate);

export default router;
