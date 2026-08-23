import { describe, expect, it, jest } from '@jest/globals';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationFiltersDto } from './dto/reservation-filters.dto';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

describe('ReservationsController', () => {
  const reservationsService = {
    findMine: jest.fn<() => Promise<unknown>>(),
    findAll: jest.fn<() => Promise<unknown>>(),
    create: jest.fn<() => Promise<unknown>>(),
    update: jest.fn<() => Promise<unknown>>(),
    cancel: jest.fn<() => Promise<unknown>>(),
  };
  const controller = new ReservationsController(
    reservationsService as unknown as ReservationsService,
  );

  const user: CurrentUserPayload = {
    sub: 'user-1',
    email: 'user@example.com',
    role: 'USER',
  };

  it('delegates listing my reservations to the service', async () => {
    reservationsService.findMine.mockResolvedValue([{ id: 'reservation-1' }]);

    await controller.findMine(user);

    expect(reservationsService.findMine).toHaveBeenCalledWith('user-1');
  });

  it('delegates listing all reservations with filters to the service', async () => {
    const filters: ReservationFiltersDto = { roomId: 'room-1' };
    reservationsService.findAll.mockResolvedValue([]);

    await controller.findAll(filters);

    expect(reservationsService.findAll).toHaveBeenCalledWith(filters);
  });

  it('delegates reservation creation to the service', async () => {
    const dto: CreateReservationDto = {
      roomId: 'room-1',
      date: '2099-01-01',
      startTime: '10:00',
      endTime: '11:00',
      attendeesCount: 1,
    };
    reservationsService.create.mockResolvedValue({ id: 'reservation-1' });

    await controller.create(user, dto);

    expect(reservationsService.create).toHaveBeenCalledWith(
      'user-1',
      dto,
      'USER',
    );
  });

  it('delegates reservation updates to the service', async () => {
    const dto: UpdateReservationDto = { attendeesCount: 2 };
    reservationsService.update.mockResolvedValue({ id: 'reservation-1' });

    await controller.update('reservation-1', user, dto);

    expect(reservationsService.update).toHaveBeenCalledWith(
      'reservation-1',
      'user-1',
      'USER',
      dto,
    );
  });

  it('delegates reservation cancellation to the service', async () => {
    reservationsService.cancel.mockResolvedValue({ id: 'reservation-1' });

    await controller.cancel('reservation-1', user);

    expect(reservationsService.cancel).toHaveBeenCalledWith(
      'reservation-1',
      'user-1',
      'USER',
    );
  });
});
