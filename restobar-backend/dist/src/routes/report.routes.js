"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Requerir autenticación para los reportes
router.use(auth_middleware_1.authenticateToken);
// Obtener reporte de ventas del día (Cajero y Admin)
router.get('/daily', (0, auth_middleware_1.authorizeRoles)('CASHIER', 'ADMIN'), report_controller_1.getDailySalesReport);
// Realizar el cierre de turno / arqueo (Cajero y Admin)
router.post('/close-shift', (0, auth_middleware_1.authorizeRoles)('CASHIER', 'ADMIN'), report_controller_1.closeShift);
exports.default = router;
