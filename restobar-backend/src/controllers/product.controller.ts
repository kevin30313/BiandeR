import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos los productos (para admin y menú del cliente)
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// Crear un plato/producto nuevo
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, categoryId, isAvailable } = req.body;

    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios' });
    }

   const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: Number(price),
        image: image || null,
        categoryId,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
      },
      include: { category: true }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// Actualizar un producto (precio, stock, foto, nombre)
export const updateProduct = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

// Eliminar un producto
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto (puede estar asociado a órdenes previas)' });
  }
};