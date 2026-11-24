import { Request, Response } from 'express';
import prisma from '../prisma';

export const getTables = async (_req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
    });
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las mesas' });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { number } = req.body;
    const tableNumber = Number(number);

    if (!Number.isInteger(tableNumber) || tableNumber < 1) {
      return res.status(400).json({ message: 'El número de mesa debe ser un entero mayor que cero' });
    }

    const newTable = await prisma.table.create({
      data: { number: tableNumber },
    });

    return res.status(201).json(newTable);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo crear la mesa. Verifica que el número no exista.' });
  }
};

export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // FREE, BUSY, WAITING_BILL

    const updatedTable = await prisma.table.update({
      where: { id },
      data: { status },
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('table:updated', updatedTable);
    }

    res.json(updatedTable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar estado de la mesa' });
  }
};
