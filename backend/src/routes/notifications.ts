import { Router } from 'express';
import { updateController } from '../controllers/updateController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, updateController.getNotifications);
router.put('/:id/read', authenticate, updateController.markRead);
router.put('/read-all', authenticate, updateController.markAllRead);

export default router;
