import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/prisma', () => ({
  default: { $queryRaw: vi.fn() },
}));

import jwt from 'jsonwebtoken';
import request from 'supertest';
import prisma from '../src/prisma';

let app: import('express').Express;
const signToken = (role: string) => jwt.sign({ userId: 'test-user', role }, 'test-jwt-secret');

describe('API esencial', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    app = (await import('../src/app')).default;
  });

  beforeEach(() => {
    vi.mocked(prisma.$queryRaw).mockReset();
  });

  it('GET /api/health confirma conectividad con PostgreSQL', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ '?column?': 1 }] as never);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', database: 'connected' });
    expect(response.body.timestamp).toEqual(expect.any(String));
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
  });

  it('GET /api/health responde 503 si PostgreSQL no está disponible', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('database unavailable'));

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ status: 'error', database: 'disconnected' });
  });

  it('rechaza listar usuarios sin token', async () => {
    const response = await request(app).get('/api/auth/users');
    expect(response.status).toBe(401);
  });

  it('rechaza registrar usuarios sin token', async () => {
    const response = await request(app).post('/api/auth/register').send({});
    expect(response.status).toBe(401);
  });

  it('rechaza listar usuarios con rol distinto a ADMIN', async () => {
    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${signToken('WAITER')}`);
    expect(response.status).toBe(403);
  });

  it('rechaza registrar usuarios con rol distinto a ADMIN', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${signToken('WAITER')}`)
      .send({ name: 'Test', email: 'test@example.com', password: 'password123', role: 'WAITER' });
    expect(response.status).toBe(403);
  });

  it('valida una contraseña de al menos 8 caracteres al registrar', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${signToken('ADMIN')}`)
      .send({ name: 'Test', email: 'test@example.com', password: 'short', role: 'WAITER' });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/8 caracteres/);
  });
});
