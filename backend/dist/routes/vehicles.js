"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehicleController_1 = require("../controllers/vehicleController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('CUSTOMER'), vehicleController_1.vehicleController.getMyVehicles);
router.post('/', auth_1.authenticate, (0, auth_1.requireRole)('CUSTOMER'), vehicleController_1.vehicleController.addVehicle);
router.put('/:id', auth_1.authenticate, (0, auth_1.requireRole)('CUSTOMER'), vehicleController_1.vehicleController.updateVehicle);
router.delete('/:id', auth_1.authenticate, (0, auth_1.requireRole)('CUSTOMER'), vehicleController_1.vehicleController.deleteVehicle);
exports.default = router;
//# sourceMappingURL=vehicles.js.map