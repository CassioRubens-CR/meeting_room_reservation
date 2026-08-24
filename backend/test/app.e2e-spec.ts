process.env.DATABASE_URL = 'file:./e2e.db';
process.env.JWT_SECRET = 'e2e-test-secret';
process.env.JWT_EXPIRES_IN = '1d';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role } from '@prisma/client';
import type { App as SupertestApp } from 'supertest/types';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    role: Role;
  };
}

interface RoomResponse {
  id: string;
  name: string;
  capacity: number;
}

interface ReservationResponse {
  id: string;
  roomId: string;
  userId: string;
  status: 'CONFIRMED' | 'CANCELLED';
}

function parseBody<T>(body: unknown): T {
  return body as T;
}

describe('Meeting room reservation API (e2e)', () => {
  let app: INestApplication;
  let server: SupertestApp;
  let prisma: PrismaClient;
  let user: AuthResponse;
  let admin: AuthResponse;
  let room: RoomResponse;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.reservation.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('registers a regular user and returns a JWT', async () => {
    const response = await request(server)
      .post('/auth/register')
      .send({
        name: 'E2E User',
        email: 'e2e-user@example.com',
        password: 'password123',
      })
      .expect(201);

    user = parseBody<AuthResponse>(response.body as unknown);
    expect(user.user.role).toBe(Role.USER);
    expect(user.accessToken).toEqual(expect.any(String));
  });

  it('logs in the regular user', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ email: 'e2e-user@example.com', password: 'password123' })
      .expect(201);

    const body = parseBody<AuthResponse>(response.body as unknown);
    expect(body.accessToken).toEqual(expect.any(String));
  });

  it('rejects protected requests without a token', async () => {
    await request(server).get('/rooms').expect(401);
  });

  it('rejects a regular user from creating a room', async () => {
    await request(server)
      .post('/rooms')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ name: 'E2E Room', capacity: 10 })
      .expect(403);
  });

  it('creates an admin user for the remaining admin scenarios', async () => {
    const response = await request(server)
      .post('/auth/register')
      .send({
        name: 'E2E Admin',
        email: 'e2e-admin@example.com',
        password: 'password123',
      })
      .expect(201);

    admin = parseBody<AuthResponse>(response.body as unknown);
    await prisma.user.update({
      where: { id: admin.user.id },
      data: { role: Role.ADMIN },
    });

    const loginResponse = await request(server)
      .post('/auth/login')
      .send({ email: 'e2e-admin@example.com', password: 'password123' })
      .expect(201);

    admin = parseBody<AuthResponse>(loginResponse.body as unknown);
  });

  it('allows an admin to create and list rooms', async () => {
    const response = await request(server)
      .post('/rooms')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ name: 'E2E Room', capacity: 1, location: 'E2E Floor' })
      .expect(201);

    room = parseBody<RoomResponse>(response.body as unknown);
    expect(room.name).toBe('E2E Room');

    const roomsResponse = await request(server)
      .get('/rooms')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(roomsResponse.body as unknown).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: room.id })]),
    );
  });

  it('creates and lists the user reservation', async () => {
    const response = await request(server)
      .post('/reservations')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({
        roomId: room.id,
        date: '2099-01-01',
        startTime: '10:00',
        endTime: '11:00',
      })
      .expect(201);

    const reservation = response.body as unknown as ReservationResponse;
    expect(reservation.userId).toBe(user.user.id);
    expect(reservation.status).toBe('CONFIRMED');

    const mineResponse = await request(server)
      .get('/reservations/me')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(mineResponse.body as unknown).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: reservation.id })]),
    );
  });

  it('rejects an overlapping reservation', async () => {
    await request(server)
      .post('/reservations')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        roomId: room.id,
        date: '2099-01-01',
        startTime: '10:30',
        endTime: '11:30',
      })
      .expect(409);
  });

  it('allows an admin to list all reservations and filter by room', async () => {
    const response = await request(server)
      .get(`/reservations?roomId=${room.id}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    expect(response.body as unknown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ roomId: room.id, userId: user.user.id }),
      ]),
    );
  });

  it('rejects a regular user from listing all reservations', async () => {
    await request(server)
      .get('/reservations')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });
});
