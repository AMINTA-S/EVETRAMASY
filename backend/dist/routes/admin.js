"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.requireRole)('ADMIN'));
router.get('/users', adminController_1.adminController.getUsers);
router.put('/users/:id/status', adminController_1.adminController.updateUserStatus);
router.get('/events', adminController_1.adminController.getAllEvents);
router.post('/events/:id/approve', adminController_1.adminController.approveEvent);
router.post('/events/:id/reject', adminController_1.adminController.rejectEvent);
router.get('/analytics', adminController_1.adminController.getAnalytics);
router.get('/audit-logs', adminController_1.adminController.getAuditLogs);
router.get('/fines', adminController_1.adminController.getFines);
router.get('/fines/settings', adminController_1.adminController.getFineSettings);
router.put('/fines/settings', adminController_1.adminController.updateFineSettings);
exports.default = router;
//# sourceMappingURL=admin.js.map