"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parkingController_1 = require("../controllers/parkingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), parkingController_1.parkingController.updateParkingZone);
exports.default = router;
//# sourceMappingURL=parking.js.map