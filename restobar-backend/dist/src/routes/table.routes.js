"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const table_controller_1 = require("../controllers/table.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticateToken, table_controller_1.getTables);
router.patch('/:id/status', auth_middleware_1.authenticateToken, table_controller_1.updateTableStatus);
exports.default = router;
