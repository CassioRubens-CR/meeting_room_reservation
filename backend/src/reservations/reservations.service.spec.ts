import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  const repository = {
    findRoom: jest.fn<() => Promise<unknown>>(),
    sumOverlappingAttendees: jest.fn<() => Promise<number>>(),
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
    repository.findRoom.mockResolvedValue({ capacity: 10 });
    repository.sumOverlappingAttendees.mockResolvedValue(0);
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
    expect(repository.sumOverlappingAttendees).not.toHaveBeenCalled();
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
    expect(repository.sumOverlappingAttendees).not.toHaveBeenCalled();
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
    expect(repository.sumOverlappingAttendees).not.toHaveBeenCalled();
  });

  it('rejects overlapping reservations in the same room', async () => {
    repository.sumOverlappingAttendees.mockResolvedValue(10);
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

  it('allows a partial reservation when seats remain available', async () => {
    repository.findRoom.mockResolvedValue({ capacity: 10 });
    repository.sumOverlappingAttendees.mockResolvedValue(6);
    repository.create.mockResolvedValue({ id: 'reservation-1' });

    await expect(
      service.create('user-1', {
        roomId: 'room-1',
        date: '2099-01-01',
        startTime: '10:00',
        endTime: '11:00',
        attendeesCount: 4,
        justification: 'Reunião do time comercial',
      }, 'ADMIN'),
    ).resolves.toEqual({ id: 'reservation-1' });
  });

  it('rejects a reservation that exceeds the remaining room capacity', async () => {
    repository.findRoom.mockResolvedValue({ capacity: 10 });
    repository.sumOverlappingAttendees.mockResolvedValue(6);

    await expect(
      service.create('user-1', {
        roomId: 'room-1',
        date: '2099-01-01',
        startTime: '10:00',
        endTime: '11:00',
        attendeesCount: 5,
        justification: 'Reunião ampliada',
      }, 'ADMIN'),
    ).rejects.toThrow('A sala não possui capacidade suficiente nesse intervalo');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('requires justification when reserving more than one seat', async () => {
    await expect(
      service.create('user-1', {
        roomId: 'room-1',
        date: '2099-01-01',
        startTime: '10:00',
        endTime: '11:00',
        attendeesCount: 2,
      }, 'ADMIN'),
    ).rejects.toThrow('Informe uma justificativa para reservar mais de 1 lugar');
    expect(repository.sumOverlappingAttendees).not.toHaveBeenCalled();
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
    repository.sumOverlappingAttendees.mockResolvedValue(0);
    repository.update.mockResolvedValue({ id: 'reservation-1' });

    await expect(
      service.update('reservation-1', 'user-1', 'USER', {
        endTime: '12:00',
      }),
    ).resolves.toEqual({ id: 'reservation-1' });
    expect(repository.sumOverlappingAttendees).toHaveBeenCalledWith(
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
