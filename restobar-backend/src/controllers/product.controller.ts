import { Request, Response } from 'express';
import prisma from '../prisma';

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// ✅ Nueva función exportada para el menú
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'El nombre de la categoría es requerido' });
      return;
    }

    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, categoryId } = req.body;

    if (!name || price === undefined || !categoryId) {
      res.status(400).json({ message: 'Faltan campos obligatorios' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        categoryId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
};