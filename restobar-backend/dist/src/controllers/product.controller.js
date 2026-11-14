"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Listar todos los productos (para admin y menú del cliente)
const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};
exports.getProducts = getProducts;
// Crear un plato/producto nuevo
const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, categoryId, isAvailable } = req.body;
        if (!name || price === undefined || !categoryId) {
            return res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios' });
        }
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                image,
                categoryId,
                isAvailable: isAvailable !== undefined ? isAvailable : true
            },
            include: { category: true }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};
exports.createProduct = createProduct;
// Actualizar un producto (precio, stock, foto, nombre)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image, categoryId, isAvailable } = req.body;
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: Number(price) }),
                ...(image !== undefined && { image }),
                ...(categoryId && { categoryId }),
                ...(isAvailable !== undefined && { isAvailable })
            },
            include: { category: true }
        });
        res.json(updatedProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};
exports.updateProduct = updateProduct;
// Eliminar un producto
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id }
        });
        res.json({ message: 'Producto eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto (puede estar asociado a órdenes previas)' });
    }
};
exports.deleteProduct = deleteProduct;
