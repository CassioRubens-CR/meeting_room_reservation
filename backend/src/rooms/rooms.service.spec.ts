import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  const prisma = {
    room: {
      findMany: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => Promise<unknown>>(),
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
});
