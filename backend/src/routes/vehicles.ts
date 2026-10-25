import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('CUSTOMER'), vehicleController.getMyVehicles);
router.post('/', authenticate, requireRole('CUSTOMER'), vehicleController.addVehicle);
router.put('/:id', authenticate, requireRole('CUSTOMER'), vehicleController.updateVehicle);
router.delete('/:id', authenticate, requireRole('CUSTOMER'), vehicleController.deleteVehicle);

export default router;
