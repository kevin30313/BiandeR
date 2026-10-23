import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.routes';
import tableRoutes from './routes/table.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const APP_NAME = process.env.APP_NAME || 'Restobar Backend API';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware de autenticación para WebSockets
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Autenticación fallida: Token no proporcionado'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Autenticación fallida: Token inválido o expirado'));
  }
});

// Compartir la instancia de Socket.io con los controladores de Express
app.set('io', io);

// Middlewares globales
app.use(cors());
app.use(express.json());

// Registro de rutas API
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    app: APP_NAME,
    timestamp: new Date().toISOString(),
  });
});

// Gestión de conexiones y salas (rooms)
io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`⚡ Cliente conectado a WebSockets: ${socket.id} | Rol: ${user?.role}`);

  // Unir automáticamente al socket a una sala según su rol
  if (user?.role) {
    socket.join(`role:${user.role}`);
  }

  // Permite unirse manualmente a salas específicas desde el frontend (ej: 'kitchen', 'cashier', 'tables')
  socket.on('join:room', (room: string) => {
    socket.join(room);
    console.log(`📡 Socket ${socket.id} se unió a la sala: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 ${APP_NAME} ejecutándose en el puerto ${PORT}`);
});