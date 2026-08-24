import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn<() => Promise<unknown>>(),
      create: jest.fn<() => Promise<unknown>>(),
      update: jest.fn<() => Promise<unknown>>(),
    },
  };
  const service = new UsersService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('finds a user by email', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.findByEmail(user.email)).resolves.toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
  });

  it('creates a user with the provided data', async () => {
    const data = {
      name: 'User',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
    };
    prisma.user.create.mockResolvedValue({ id: 'user-1', ...data });

    await expect(service.create(data)).resolves.toMatchObject(data);
    expect(prisma.user.create).toHaveBeenCalledWith({ data });
  });

  it('turns a unique constraint error into a conflict', async () => {
    prisma.user.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create({
        name: 'User',
        email: 'user@example.com',
        passwordHash: 'hash',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('finds a user by id', async () => {
    const user = { id: 'user-1', email: 'user@example.com' };
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.findById(user.id)).resolves.toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
    });
  });

  it('updates the password hash', async () => {
    prisma.user.update.mockResolvedValue({ id: 'user-1' });

    await expect(service.updatePassword('user-1', 'new-hash')).resolves.toEqual(
      { id: 'user-1' },
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: 'new-hash' },
    });
  });

  it('rethrows unexpected errors when creating a user', async () => {
    const unexpectedError = new Error('connection lost');
    prisma.user.create.mockRejectedValue(unexpectedError);

    await expect(
      service.create({
        name: 'User',
        email: 'user@example.com',
        passwordHash: 'hash',
      }),
    ).rejects.toThrow('connection lost');
  });
});
