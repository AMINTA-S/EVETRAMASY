import { Router } from 'express';
import { reservationController } from '../controllers/reservationController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, requireRole('CUSTOMER'), reservationController.createReservation);
router.get('/', authenticate, reservationController.getMyReservations);
router.get('/:id', authenticate, reservationController.getReservationById);
router.delete('/:id', authenticate, reservationController.cancelReservation);
router.get('/:id/qr', authenticate, requireRole('CUSTOMER'), reservationController.getQRCode);
router.post('/verify', authenticate, requireRole('MANAGER','ADMIN'), reservationController.verifyQR);

export default router;
