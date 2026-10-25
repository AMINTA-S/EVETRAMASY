import { Router } from 'express';
import { fineController } from '../controllers/fineController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('CUSTOMER'), fineController.getMyFines);
router.put('/:id/pay', authenticate, requireRole('CUSTOMER'), fineController.payFine);

export default router;
