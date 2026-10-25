import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/events', adminController.getAllEvents);
router.post('/events/:id/approve', adminController.approveEvent);
router.post('/events/:id/reject', adminController.rejectEvent);
router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/fines', adminController.getFines);
router.get('/fines/settings', adminController.getFineSettings);
router.put('/fines/settings', adminController.updateFineSettings);

export default router;
