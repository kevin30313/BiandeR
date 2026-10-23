"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTableStatus = exports.getTables = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getTables = async (req, res) => {
    try {
        const tables = await prisma_1.default.table.findMany({
            orderBy: { number: 'asc' },
        });
        res.json(tables);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las mesas' });
    }
};
exports.getTables = getTables;
const updateTableStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const updatedTable = await prisma_1.default.table.update({
            where: { id },
            data: { status },
        });
        // Emitir evento Socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('tableStatusUpdated', updatedTable);
        }
        res.json(updatedTable);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la mesa' });
    }
};
exports.updateTableStatus = updateTableStatus;
