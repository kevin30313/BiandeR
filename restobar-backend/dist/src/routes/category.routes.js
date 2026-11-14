"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// ✅ Ruta pública para que el menú pueda obtener la lista de categorías
router.get('/', product_controller_1.getCategories);
// 🔒 Ruta protegida para crear categorías
router.post('/', auth_middleware_1.authenticateToken, product_controller_1.createCategory);
exports.default = router;
