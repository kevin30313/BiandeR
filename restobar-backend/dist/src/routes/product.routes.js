"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ✅ Ruta pública: Obtener lista de productos (Cualquier cliente/móvil puede ver la carta)
router.get('/', product_controller_1.getProducts);
// 🔒 Rutas protegidas (Admin): Crear, actualizar y eliminar productos
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), product_controller_1.createProduct);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), product_controller_1.updateProduct);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), product_controller_1.deleteProduct);
exports.default = router;
