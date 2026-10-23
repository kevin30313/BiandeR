"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/daily', auth_middleware_1.authenticateToken, report_controller_1.getDailySalesReport);
router.post('/close-shift', auth_middleware_1.authenticateToken, report_controller_1.closeShift);
exports.default = router;
