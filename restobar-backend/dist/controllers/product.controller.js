"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = exports.createCategory = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getProducts = async (req, res) => {
    try {
        const products = await prisma_1.default.product.findMany({
            include: { category: true },
            orderBy: { name: 'asc' },
        });
        res.json(products);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};
exports.getProducts = getProducts;
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma_1.default.category.create({
            data: { name },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la categoría' });
    }
};
exports.createCategory = createCategory;
const createProduct = async (req, res) => {
    try {
        const { name, price, categoryId } = req.body;
        const product = await prisma_1.default.product.create({
            data: {
                name,
                price,
                categoryId,
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el producto' });
    }
};
exports.createProduct = createProduct;
