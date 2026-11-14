"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const table_routes_1 = __importDefault(require("./routes/table.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const APP_NAME = process.env.APP_NAME || 'Restobar Backend API';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const io = new socket_io_1.Server(server, {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        socket.data.user = decoded;
        next();
    }
    catch (error) {
        next(new Error('Autenticación fallida: Token inválido o expirado'));
    }
});
// Compartir la instancia de Socket.io con los controladores de Express
app.set('io', io);
// Middlewares globales
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Ruta raíz informativa
app.get('/', (_req, res) => {
    res.json({
        status: 'online',
        app: APP_NAME,
        message: 'API de gestión de Restobar funcionando correctamente',
        healthCheck: '/health',
        timestamp: new Date().toISOString(),
    });
});
// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        app: APP_NAME,
        timestamp: new Date().toISOString(),
    });
});
// Registro de rutas API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tables', table_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/reports', report_routes_1.default);
// Gestión de conexiones y salas (rooms)
io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`⚡ Cliente conectado a WebSockets: ${socket.id} | Rol: ${user?.role}`);
    // Unir automáticamente al socket a una sala según su rol
    if (user?.role) {
        socket.join(`role:${user.role}`);
    }
    // Permite unirse manualmente a salas específicas desde el frontend (ej: 'kitchen', 'cashier', 'tables')
    socket.on('join:room', (room) => {
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
