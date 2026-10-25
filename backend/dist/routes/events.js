"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const auth_1 = require("../middleware/auth");
const parkingController_1 = require("../controllers/parkingController");
const trafficController_1 = require("../controllers/trafficController");
const updateController_1 = require("../controllers/updateController");
const router = (0, express_1.Router)();
// Public
router.get('/', eventController_1.eventController.getPublicEvents);
router.get('/:id', eventController_1.eventController.getEventById);
router.get('/:eventId/parking', parkingController_1.parkingController.getEventParkingZones);
router.get('/:eventId/traffic', trafficController_1.trafficController.getEventTrafficZones);
router.get('/:eventId/traffic-risk', trafficController_1.trafficController.getTrafficRisk);
router.get('/:eventId/alerts', trafficController_1.trafficController.getEventAlerts);
router.get('/:eventId/gates', trafficController_1.trafficController.getEventGates);
router.get('/:eventId/updates', updateController_1.updateController.getEventUpdates);
router.get('/:eventId/recommendations', parkingController_1.parkingController.getRecommendations);
router.get('/:eventId/route', parkingController_1.parkingController.getRouteRecommendation);
router.get('/:eventId/forecast', updateController_1.updateController.getForecast);
// Manager / Admin protected
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), eventController_1.eventController.createEvent);
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), eventController_1.eventController.updateEvent);
router.get('/:id/stats', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), eventController_1.eventController.getEventStats);
router.post('/:eventId/parking', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), parkingController_1.parkingController.createParkingZone);
router.post('/:eventId/traffic', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), trafficController_1.trafficController.createTrafficZone);
router.post('/:eventId/gates', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), trafficController_1.trafficController.createGate);
router.post('/:eventId/updates', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), updateController_1.updateController.createUpdate);
router.post('/:eventId/simulation/start', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), updateController_1.updateController.startSimulation);
router.post('/:eventId/simulation/stop', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), updateController_1.updateController.stopSimulation);
router.get('/:eventId/simulation/status', updateController_1.updateController.getSimulationStatus);
// Manager events list
router.get('/manager/my-events', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), eventController_1.eventController.getManagerEvents);
router.get('/manager/:eventId/reservations', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), (req, res) => {
    req.params.eventId = req.params.eventId;
    return Promise.resolve().then(() => __importStar(require('../controllers/reservationController'))).then(m => m.reservationController.getEventReservations(req, res));
});
exports.default = router;
//# sourceMappingURL=events.js.map