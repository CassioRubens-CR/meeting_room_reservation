import { describe, expect, it, jest } from '@jest/globals';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

describe('RoomsController', () => {
  const roomsService = {
    findAll: jest.fn<() => Promise<unknown>>(),
    create: jest.fn<() => Promise<unknown>>(),
    update: jest.fn<() => Promise<unknown>>(),
    remove: jest.fn<() => Promise<unknown>>(),
  };
  const controller = new RoomsController(
    roomsService as unknown as RoomsService,
  );

  it('delegates listing rooms to the service', async () => {
    roomsService.findAll.mockResolvedValue([{ id: 'room-1' }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: 'room-1' }]);
    expect(roomsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('delegates room creation to the service', async () => {
    const dto: CreateRoomDto = { name: 'Room A', capacity: 8 };
    roomsService.create.mockResolvedValue({ id: 'room-1', ...dto });

    await controller.create(dto);

    expect(roomsService.create).toHaveBeenCalledWith(dto);
  });

  it('delegates room updates to the service', async () => {
    const dto: UpdateRoomDto = { name: 'Room B' };
    roomsService.update.mockResolvedValue({ id: 'room-1', ...dto });

    await controller.update('room-1', dto);

    expect(roomsService.update).toHaveBeenCalledWith('room-1', dto);
  });

  it('delegates room removal to the service', async () => {
    roomsService.remove.mockResolvedValue({ id: 'room-1' });

    await controller.remove('room-1');

    expect(roomsService.remove).toHaveBeenCalledWith('room-1');
  });
});
