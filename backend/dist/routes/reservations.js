"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController_1 = require("../controllers/reservationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('CUSTOMER'), reservationController_1.reservationController.createReservation);
router.get('/', auth_1.authenticate, reservationController_1.reservationController.getMyReservations);
router.get('/:id', auth_1.authenticate, reservationController_1.reservationController.getReservationById);
router.delete('/:id', auth_1.authenticate, reservationController_1.reservationController.cancelReservation);
router.get('/:id/qr', auth_1.authenticate, (0, auth_1.requireRole)('CUSTOMER'), reservationController_1.reservationController.getQRCode);
router.post('/verify', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), reservationController_1.reservationController.verifyQR);
exports.default = router;
//# sourceMappingURL=reservations.js.map