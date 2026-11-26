import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app';

const APP_NAME = process.env.APP_NAME || 'Restobar Backend API';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  if (!token) return next(new Error('Autenticación fallida: Token no proporcionado'));

  try {
    socket.data.user = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    next();
  } catch {
    next(new Error('Autenticación fallida: Token inválido o expirado'));
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  const user = socket.data.user;
  console.log(`⚡ Cliente conectado a WebSockets: ${socket.id} | Rol: ${user?.role}`);
  if (user?.role) socket.join(`role:${user.role}`);

  socket.on('join:room', (room: string) => {
    socket.join(room);
    console.log(`📡 Socket ${socket.id} se unió a la sala: ${room}`);
  });

  socket.on('disconnect', () => console.log(`❌ Cliente desconectado: ${socket.id}`));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 ${APP_NAME} ejecutándose en el puerto ${PORT}`));
