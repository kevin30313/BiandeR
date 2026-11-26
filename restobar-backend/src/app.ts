import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import tableRoutes from './routes/table.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import reportRoutes from './routes/report.routes';
import cashierRoutes from './routes/cashier.routes';
import preorderRoutes from './routes/preorder.routes';
import prisma from './prisma';

const app = express();
const APP_NAME = process.env.APP_NAME || 'Restobar Backend API';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    app: APP_NAME,
    message: 'API de gestión de Restobar funcionando correctamente',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', app: APP_NAME, timestamp: new Date().toISOString() });
});

app.get('/api/health', async (_req, res) => {
  const timestamp = new Date().toISOString();
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected', timestamp });
  } catch (error) {
    console.error('Health check de PostgreSQL falló:', error);
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/preorders', preorderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/cashier', cashierRoutes);

export default app;
