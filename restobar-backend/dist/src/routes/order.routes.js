"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ✅ PÚBLICO: Los clientes de las mesas pueden crear pedidos sin token
router.post('/', order_controller_1.createOrder);
// 🔒 RUTAS PROTEGIDAS: Requieren autenticación con JWT
router.get('/', auth_middleware_1.authenticateToken, order_controller_1.getOrders);
router.patch('/:id/status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('KITCHEN', 'WAITER', 'ADMIN'), order_controller_1.updateOrderStatus);
router.post('/:id/pay', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('CASHIER', 'ADMIN'), order_controller_1.payOrder);
exports.default = router;
