"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const updateController_1 = require("../controllers/updateController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, updateController_1.updateController.getNotifications);
router.put('/:id/read', auth_1.authenticate, updateController_1.updateController.markRead);
router.put('/read-all', auth_1.authenticate, updateController_1.updateController.markAllRead);
exports.default = router;
//# sourceMappingURL=notifications.js.map