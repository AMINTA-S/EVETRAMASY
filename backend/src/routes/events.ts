import { Router } from 'express';
import { eventController } from '../controllers/eventController';
import { authenticate, requireRole } from '../middleware/auth';
import { parkingController } from '../controllers/parkingController';
import { trafficController } from '../controllers/trafficController';
import { updateController } from '../controllers/updateController';

const router = Router();

// Public
router.get('/', eventController.getPublicEvents);
router.get('/:id', eventController.getEventById);
router.get('/:eventId/parking', parkingController.getEventParkingZones);
router.get('/:eventId/traffic', trafficController.getEventTrafficZones);
router.get('/:eventId/traffic-risk', trafficController.getTrafficRisk);
router.get('/:eventId/alerts', trafficController.getEventAlerts);
router.get('/:eventId/gates', trafficController.getEventGates);
router.get('/:eventId/updates', updateController.getEventUpdates);
router.get('/:eventId/recommendations', parkingController.getRecommendations);
router.get('/:eventId/route', parkingController.getRouteRecommendation);
router.get('/:eventId/forecast', updateController.getForecast);

// Manager / Admin protected
router.post('/', authenticate, requireRole('MANAGER','ADMIN'), eventController.createEvent);
router.put('/:id', authenticate, requireRole('MANAGER','ADMIN'), eventController.updateEvent);
router.get('/:id/stats', authenticate, requireRole('MANAGER','ADMIN'), eventController.getEventStats);

router.post('/:eventId/parking', authenticate, requireRole('MANAGER','ADMIN'), parkingController.createParkingZone);
router.post('/:eventId/traffic', authenticate, requireRole('MANAGER','ADMIN'), trafficController.createTrafficZone);
router.post('/:eventId/gates', authenticate, requireRole('MANAGER','ADMIN'), trafficController.createGate);
router.post('/:eventId/updates', authenticate, requireRole('MANAGER','ADMIN'), updateController.createUpdate);

router.post('/:eventId/simulation/start', authenticate, requireRole('MANAGER','ADMIN'), updateController.startSimulation);
router.post('/:eventId/simulation/stop', authenticate, requireRole('MANAGER','ADMIN'), updateController.stopSimulation);
router.get('/:eventId/simulation/status', updateController.getSimulationStatus);

// Manager events list
router.get('/manager/my-events', authenticate, requireRole('MANAGER','ADMIN'), eventController.getManagerEvents);
router.get('/manager/:eventId/reservations', authenticate, requireRole('MANAGER','ADMIN'), (req, res) => {
  req.params.eventId = req.params.eventId;
  return import('../controllers/reservationController').then(m => m.reservationController.getEventReservations(req as any, res));
});

export default router;
