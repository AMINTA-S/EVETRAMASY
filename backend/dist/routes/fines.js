"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fineController_1 = require("../controllers/fineController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, (0, auth_1.requireRole)('CUSTOMER'), fineController_1.fineController.getMyFines);
router.put('/:id/pay', auth_1.authenticate, (0, auth_1.requireRole)('CUSTOMER'), fineController_1.fineController.payFine);
exports.default = router;
//# sourceMappingURL=fines.js.map