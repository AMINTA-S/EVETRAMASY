"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trafficController_1 = require("../controllers/trafficController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), trafficController_1.trafficController.updateTrafficZone);
router.put('/gates/:id', auth_1.authenticate, (0, auth_1.requireRole)('MANAGER', 'ADMIN'), trafficController_1.trafficController.updateGate);
exports.default = router;
//# sourceMappingURL=traffic.js.map