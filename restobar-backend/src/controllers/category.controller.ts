import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todas las categorías
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true }
    });
    res.json(categories);
  } catch (error: any) {
    console.error('Error getCategories:', error);
    res.status(500).json({
      error: 'Error al obtener las categorías',
      details: error?.message || String(error),
      code: error?.code
    });
  
  }
};

// Crear nueva categoría
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
    }

    const newCategory = await prisma.category.create({
      data: { name }
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la categoría (puede que ya exista)' });
  }
};