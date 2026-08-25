import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationsRepository } from './reservations.repository';

describe('ReservationsRepository', () => {
  const prisma = {
    room: {
      findUnique: jest.fn<() => Promise<unknown>>(),
    },
    reservation: {
      aggregate: jest.fn<() => Promise<unknown>>(),
      findUnique: jest.fn<() => Promise<unknown>>(),
      findFirst: jest.fn<() => Promise<unknown>>(),
      update: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => Promise<unknown>>(),
      findMany: jest.fn<() => Promise<unknown>>(),
    },
  };
  const repository = new ReservationsRepository(
    prisma as unknown as PrismaService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('finds a room by id', () => {
    void repository.findRoom('room-1');

    expect(prisma.room.findUnique).toHaveBeenCalledWith({
      where: { id: 'room-1' },
    });
  });

  it('sums overlapping attendees excluding a reservation id', async () => {
    prisma.reservation.aggregate.mockResolvedValue({
      _sum: { attendeesCount: 5 },
    });

    const start = new Date('2099-01-01T10:00:00.000Z');
    const end = new Date('2099-01-01T11:00:00.000Z');

    await expect(
      repository.sumOverlappingAttendees('room-1', start, end, 'reservation-1'),
    ).resolves.toBe(5);

    expect(prisma.reservation.aggregate).toHaveBeenCalledWith({
      where: {
        roomId: 'room-1',
        status: 'CONFIRMED',
        id: { not: 'reservation-1' },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      _sum: { attendeesCount: true },
    });
  });

  it('sums overlapping attendees without excluding any reservation', async () => {
    prisma.reservation.aggregate.mockResolvedValue({ _sum: {} });

    const start = new Date('2099-01-01T10:00:00.000Z');
    const end = new Date('2099-01-01T11:00:00.000Z');

    await expect(
      repository.sumOverlappingAttendees('room-1', start, end),
    ).resolves.toBe(0);

    expect(prisma.reservation.aggregate).toHaveBeenCalledWith({
      where: {
        roomId: 'room-1',
        status: 'CONFIRMED',
        startTime: { lt: end },
        endTime: { gt: start },
      },
      _sum: { attendeesCount: true },
    });
  });

  it('finds a reservation by id', () => {
    void repository.findById('reservation-1');

    expect(prisma.reservation.findUnique).toHaveBeenCalledWith({
      where: { id: 'reservation-1' },
    });
  });

  it('finds a confirmed overlapping reservation for a user', () => {
    const start = new Date('2099-01-01T10:00:00.000Z');
    const end = new Date('2099-01-01T11:00:00.000Z');

    void repository.findConfirmedOverlappingByUser(
      'user-1',
      start,
      end,
    );

    expect(prisma.reservation.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        status: 'CONFIRMED',
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
  });

  it('excludes the reservation being updated from overlap lookup', () => {
    const start = new Date('2099-01-01T10:00:00.000Z');
    const end = new Date('2099-01-01T11:00:00.000Z');

    void repository.findConfirmedOverlappingByUser(
      'user-1',
      start,
      end,
      'reservation-1',
    );

    expect(prisma.reservation.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        status: 'CONFIRMED',
        id: { not: 'reservation-1' },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
  });

  it('finds a confirmed reservation with the same time window', () => {
    const start = new Date('2099-01-01T10:00:00.000Z');
    const end = new Date('2099-01-01T11:00:00.000Z');

    void repository.findConfirmedByUserAndTime('user-1', 'room-1', start, end);

    expect(prisma.reservation.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        roomId: 'room-1',
        status: 'CONFIRMED',
        startTime: { equals: start },
        endTime: { equals: end },
      },
    });
  });

  it('updates a reservation', () => {
    void repository.update('reservation-1', { status: 'CANCELLED' });

    expect(prisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 'reservation-1' },
      data: { status: 'CANCELLED' },
    });
  });

  it('finds overlapping reservations except a given one', async () => {
    prisma.reservation.aggregate.mockResolvedValue({
      _sum: { attendeesCount: 2 },
    });
    const start = new Date('2099-01-01T10:00:00.000Z');
    const end = new Date('2099-01-01T11:00:00.000Z');

    await expect(
      repository.findOverlappingExcept('room-1', start, end, 'reservation-1'),
    ).resolves.toBe(2);
  });

  it('creates a reservation', () => {
    const data = {
      userId: 'user-1',
      roomId: 'room-1',
      date: new Date('2099-01-01'),
      startTime: new Date('2099-01-01T10:00:00.000Z'),
      endTime: new Date('2099-01-01T11:00:00.000Z'),
      attendeesCount: 1,
    };

    void repository.create(data);

    expect(prisma.reservation.create).toHaveBeenCalledWith({ data });
  });

  it('finds reservations for a user ordered by date and time', () => {
    void repository.findByUser('user-1');

    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { room: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  });

  it('finds all reservations without filters', () => {
    void repository.findAll({});

    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: {},
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  });

  it('finds all reservations applying date, room and user filters', () => {
    const date = { gte: new Date('2099-01-01'), lt: new Date('2099-01-02') };

    void repository.findAll({ date, roomId: 'room-1', userId: 'user-1' });

    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: { date, roomId: 'room-1', userId: 'user-1' },
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  });
});
