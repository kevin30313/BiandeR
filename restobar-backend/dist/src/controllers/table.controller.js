"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTableStatus = exports.createTable = exports.getTables = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getTables = async (_req, res) => {
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
const createTable = async (req, res) => {
    try {
        const { number } = req.body;
        if (!number) {
            res.status(400).json({ message: 'El número de mesa es requerido' });
            return;
        }
        const newTable = await prisma_1.default.table.create({
            data: { number: Number(number) },
        });
        res.status(201).json(newTable);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la mesa' });
    }
};
exports.createTable = createTable;
const updateTableStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // FREE, BUSY, WAITING_BILL
        const updatedTable = await prisma_1.default.table.update({
            where: { id },
            data: { status },
        });
        const io = req.app.get('io');
        if (io) {
            io.emit('table:updated', updatedTable);
        }
        res.json(updatedTable);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar estado de la mesa' });
    }
};
exports.updateTableStatus = updateTableStatus;
