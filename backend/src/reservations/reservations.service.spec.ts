import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  const repository = {
    findOverlapping: jest.fn<() => Promise<unknown>>(),
    findOverlappingExcept: jest.fn<() => Promise<unknown>>(),
    findById: jest.fn<() => Promise<unknown>>(),
    create: jest.fn<() => Promise<unknown>>(),
    update: jest.fn<() => Promise<unknown>>(),
    findByUser: jest.fn<() => Promise<unknown>>(),
  };
  const service = new ReservationsService(
    repository as unknown as ReservationsRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects reservations shorter than one hour', async () => {
    const dto: CreateReservationDto = {
      roomId: 'room-1',
      date: '2099-01-01',
      startTime: '10:00',
      endTime: '10:30',
    };

    await expect(service.create('user-1', dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(repository.findOverlapping).not.toHaveBeenCalled();
  });

  it('rejects reservations when the end is before the start', async () => {
    const dto: CreateReservationDto = {
      roomId: 'room-1',
      date: '2099-01-01',
      startTime: '11:00',
      endTime: '10:00',
    };

    await expect(service.create('user-1', dto)).rejects.toThrow(
      'Horário de término deve ser após o início',
    );
    expect(repository.findOverlapping).not.toHaveBeenCalled();
  });

  it('rejects reservations in the past', async () => {
    const dto: CreateReservationDto = {
      roomId: 'room-1',
      date: '2020-01-01',
      startTime: '10:00',
      endTime: '11:00',
    };

    await expect(service.create('user-1', dto)).rejects.toThrow(
      'Não é possível reservar um horário no passado',
    );
    expect(repository.findOverlapping).not.toHaveBeenCalled();
  });

  it('rejects overlapping reservations in the same room', async () => {
    repository.findOverlapping.mockResolvedValue({ id: 'reservation-1' });
    const dto: CreateReservationDto = {
      roomId: 'room-1',
      date: '2099-01-01',
      startTime: '10:00',
      endTime: '11:00',
    };

    await expect(service.create('user-1', dto)).rejects.toThrow(
      ConflictException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('creates a valid reservation', async () => {
    repository.findOverlapping.mockResolvedValue(null);
    repository.create.mockResolvedValue({ id: 'reservation-1' });
    const dto: CreateReservationDto = {
      roomId: 'room-1',
      date: '2099-01-01',
      startTime: '10:00',
      endTime: '11:00',
    };

    await expect(service.create('user-1', dto)).resolves.toEqual({
      id: 'reservation-1',
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', roomId: 'room-1' }),
    );
  });

  it('lists reservations for the authenticated user', async () => {
    const reservations = [{ id: 'reservation-1' }];
    repository.findByUser.mockResolvedValue(reservations);

    await expect(service.findMine('user-1')).resolves.toEqual(reservations);
    expect(repository.findByUser).toHaveBeenCalledWith('user-1');
  });

  it('allows the owner to update a reservation', async () => {
    repository.findById.mockResolvedValue({
      id: 'reservation-1',
      userId: 'user-1',
      roomId: 'room-1',
      date: new Date('2099-01-01T00:00:00.000Z'),
      startTime: new Date('2099-01-01T10:00:00.000Z'),
      endTime: new Date('2099-01-01T11:00:00.000Z'),
    });
    repository.findOverlappingExcept.mockResolvedValue(null);
    repository.update.mockResolvedValue({ id: 'reservation-1' });

    await expect(
      service.update('reservation-1', 'user-1', 'USER', {
        endTime: '12:00',
      }),
    ).resolves.toEqual({ id: 'reservation-1' });
    expect(repository.findOverlappingExcept).toHaveBeenCalledWith(
      'room-1',
      expect.any(Date),
      expect.any(Date),
      'reservation-1',
    );
  });

  it('rejects updates from another user', async () => {
    repository.findById.mockResolvedValue({
      id: 'reservation-1',
      userId: 'owner-1',
    });

    await expect(
      service.update('reservation-1', 'user-1', 'USER', {}),
    ).rejects.toThrow('Você não pode alterar esta reserva');
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('cancels a reservation for its owner', async () => {
    repository.findById.mockResolvedValue({
      id: 'reservation-1',
      userId: 'user-1',
    });
    repository.update.mockResolvedValue({
      id: 'reservation-1',
      status: 'CANCELLED',
    });

    await expect(
      service.cancel('reservation-1', 'user-1', 'USER'),
    ).resolves.toEqual({ id: 'reservation-1', status: 'CANCELLED' });
    expect(repository.update).toHaveBeenCalledWith('reservation-1', {
      status: 'CANCELLED',
    });
  });
});
