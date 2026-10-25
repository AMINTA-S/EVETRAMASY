"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facilityController_1 = require("../controllers/facilityController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public
router.get('/', facilityController_1.facilityController.getAll);
// Sensor webhook - API key auth handled inside controller
router.post('/:id/sensor', facilityController_1.facilityController.sensorUpdate);
// Parking Owner only
router.get('/my', auth_1.authenticate, (0, auth_1.requireRole)('PARKING_OWNER'), facilityController_1.facilityController.getMy);
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('PARKING_OWNER'), facilityController_1.facilityController.create);
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('PARKING_OWNER'), facilityController_1.facilityController.update);
router.post('/:id/event-request', auth_1.authenticate, (0, auth_1.requireRole)('PARKING_OWNER'), facilityController_1.facilityController.createEventRequest);
router.get('/event-requests/my', auth_1.authenticate, (0, auth_1.requireRole)('PARKING_OWNER'), facilityController_1.facilityController.getMyEventRequests);
// Manager/Admin
router.get('/event-requests/:eventId', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), facilityController_1.facilityController.getEventRequests);
router.put('/event-requests/:reqId/respond', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), facilityController_1.facilityController.respondToRequest);
exports.default = router;
//# sourceMappingURL=facilities.js.map