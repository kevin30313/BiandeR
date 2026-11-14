"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getCategories = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Listar todas las categorías
const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: { products: true }
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};
exports.getCategories = getCategories;
// Crear nueva categoría
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
        }
        const newCategory = await prisma.category.create({
            data: { name }
        });
        res.status(201).json(newCategory);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al crear la categoría (puede que ya exista)' });
    }
};
exports.createCategory = createCategory;
