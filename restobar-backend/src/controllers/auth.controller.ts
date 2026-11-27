import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma, Role } from '@prisma/client';
import prisma from '../prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_restobar';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body ?? {};
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const allowedRoles = Object.values(Role) as string[];

    if (!normalizedName || !normalizedEmail || typeof password !== 'string' || password.length < 8 || !allowedRoles.includes(role)) {
      res.status(400).json({ message: 'Nombre, correo, contraseña (mínimo 8 caracteres) y rol válido son requeridos' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      res.status(400).json({ message: 'El usuario ya existe' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const listUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'No se pudieron cargar los usuarios' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  if (!id) {
    res.status(400).json({ message: 'El identificador del usuario es requerido' });
    return;
  }
  if (req.user?.userId === id) {
    res.status(400).json({ message: 'No puedes eliminar tu propio usuario administrador' });
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id }, select: { id: true, role: true } });
      if (!target) throw new UserNotFoundError('Usuario no encontrado');

      if (target.role === Role.ADMIN) {
        const adminCount = await tx.user.count({ where: { role: Role.ADMIN } });
        if (adminCount <= 1) throw new LastAdminError('No se puede eliminar al último usuario ADMIN');
      }

      await tx.user.delete({ where: { id } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.status(200).json({ message: 'Usuario eliminado correctamente', id });
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error instanceof LastAdminError) {
      res.status(400).json({ message: error.message });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      res.status(409).json({ message: 'No se puede eliminar este usuario porque tiene registros relacionados' });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      res.status(409).json({ message: 'La operación tuvo un conflicto concurrente. Inténtalo nuevamente.' });
      return;
    }
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'No se pudo eliminar el usuario' });
  }
};

class UserNotFoundError extends Error {}
class LastAdminError extends Error {}
