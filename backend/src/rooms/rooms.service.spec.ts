import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  const prisma = {
    room: {
      findMany: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => Promise<unknown>>(),
      findUnique: jest.fn<() => Promise<unknown>>(),
      delete: jest.fn<() => Promise<unknown>>(),
      update: jest.fn<() => Promise<unknown>>(),
    },
  };
  const service = new RoomsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists rooms ordered by name', async () => {
    const rooms = [{ id: 'room-1', name: 'Alpha' }];
    prisma.room.findMany.mockResolvedValue(rooms);

    await expect(service.findAll()).resolves.toEqual(rooms);
    expect(prisma.room.findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
    });
  });

  it('creates a room', async () => {
    const dto: CreateRoomDto = {
      name: 'Room A',
      capacity: 8,
      location: 'First floor',
    };
    prisma.room.create.mockResolvedValue({ id: 'room-1', ...dto });

    await expect(service.create(dto)).resolves.toMatchObject(dto);
    expect(prisma.room.create).toHaveBeenCalledWith({ data: dto });
  });

  it('turns a duplicate room name into a conflict', async () => {
    prisma.room.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create({ name: 'Room A', capacity: 8 }),
    ).rejects.toThrow(ConflictException);
  });

  it('updates a room', async () => {
    const dto: UpdateRoomDto = { name: 'Room B', capacity: 12 };
    prisma.room.findUnique.mockResolvedValue({ id: 'room-1' });
    prisma.room.update.mockResolvedValue({ id: 'room-1', ...dto });

    await expect(service.update('room-1', dto)).resolves.toMatchObject(dto);
    expect(prisma.room.update).toHaveBeenCalledWith({
      where: { id: 'room-1' },
      data: dto,
    });
  });

  it('rejects updating an unknown room', async () => {
    prisma.room.findUnique.mockResolvedValue(null);

    await expect(
      service.update('unknown-room', { name: 'Room B' }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.room.update).not.toHaveBeenCalled();
  });

  it('turns a duplicate updated room name into a conflict', async () => {
    prisma.room.findUnique.mockResolvedValue({ id: 'room-1' });
    prisma.room.update.mockRejectedValue({ code: 'P2002' });

    await expect(service.update('room-1', { name: 'Room B' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('deletes a room without reservations', async () => {
    prisma.room.findUnique.mockResolvedValue({
      id: 'room-1',
      reservations: [],
    });
    prisma.room.delete.mockResolvedValue({ id: 'room-1' });

    await expect(service.remove('room-1')).resolves.toEqual({ id: 'room-1' });
    expect(prisma.room.delete).toHaveBeenCalledWith({
      where: { id: 'room-1' },
    });
  });

  it('rejects deleting a room with reservations', async () => {
    prisma.room.findUnique.mockResolvedValue({
      id: 'room-1',
      reservations: [{ id: 'reservation-1' }],
    });

    await expect(service.remove('room-1')).rejects.toThrow(ConflictException);
    expect(prisma.room.delete).not.toHaveBeenCalled();
  });

  it('rejects deleting an unknown room', async () => {
    prisma.room.findUnique.mockResolvedValue(null);

    await expect(service.remove('unknown-room')).rejects.toThrow(
      NotFoundException,
    );
  });
});
