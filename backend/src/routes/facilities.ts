import { Router } from 'express';
import { facilityController } from '../controllers/facilityController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public
router.get('/', facilityController.getAll);

// Sensor webhook - API key auth handled inside controller
router.post('/:id/sensor', facilityController.sensorUpdate);

// Parking Owner only
router.get('/my', authenticate, requireRole('PARKING_OWNER'), facilityController.getMy);
router.post('/', authenticate, requireRole('PARKING_OWNER'), facilityController.create);
router.put('/:id', authenticate, requireRole('PARKING_OWNER'), facilityController.update);
router.post('/:id/event-request', authenticate, requireRole('PARKING_OWNER'), facilityController.createEventRequest);
router.get('/event-requests/my', authenticate, requireRole('PARKING_OWNER'), facilityController.getMyEventRequests);

// Manager/Admin
router.get('/event-requests/:eventId', authenticate, requireRole('MANAGER', 'ADMIN'), facilityController.getEventRequests);
router.put('/event-requests/:reqId/respond', authenticate, requireRole('MANAGER', 'ADMIN'), facilityController.respondToRequest);

export default router;
