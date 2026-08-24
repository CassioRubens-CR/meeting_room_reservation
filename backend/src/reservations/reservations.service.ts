import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationFiltersDto } from './dto/reservation-filters.dto';
import { ReservationsRepository } from './reservations.repository';

@Injectable()
export class ReservationsService {
  constructor(private readonly repository: ReservationsRepository) {}

  async create(
    userId: string,
    dto: CreateReservationDto,
    role: 'USER' | 'ADMIN' = 'USER',
  ) {
    const start = this.toDate(dto.date, dto.startTime);
    const end = this.toDate(dto.date, dto.endTime);

    if (start >= end) {
      throw new BadRequestException(
        'Horário de término deve ser após o início',
      );
    }

    const durationInMilliseconds = end.getTime() - start.getTime();
    const minimumDuration = 60 * 60 * 1000;

    if (durationInMilliseconds < minimumDuration) {
      throw new BadRequestException('Duração mínima da reserva é de 1 hora');
    }

    if (start < new Date()) {
      throw new BadRequestException(
        'Não é possível reservar um horário no passado',
      );
    }

    const room = await this.repository.findRoom(dto.roomId);

    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    const attendeesCount = dto.attendeesCount ?? 1;

    if (role !== 'ADMIN' && attendeesCount > 1) {
      throw new ForbiddenException(
        'Apenas administradores podem reservar mais de 1 lugar',
      );
    }

    this.validateJustification(attendeesCount, dto.justification);

    const overlappingReservation =
      await this.repository.findConfirmedOverlappingByUser(
        userId,
        dto.roomId,
        start,
        end,
      );

    if (overlappingReservation && role !== 'ADMIN') {
      throw new ConflictException(
        'Você já possui uma reserva para esta sala neste horário',
      );
    }

    const existingReservation =
      role === 'ADMIN'
        ? await this.repository.findConfirmedByUserAndTime(
            userId,
            dto.roomId,
            start,
            end,
          )
        : undefined;

    if (existingReservation && role === 'ADMIN') {
      const totalAttendees =
        existingReservation.attendeesCount + attendeesCount;
      const justification = dto.justification?.trim();

      if (totalAttendees > 1 && !justification) {
        throw new BadRequestException(
          'Você já possui uma reserva no mesmo dia e horário. Justifique para reservar mais de 1 lugar.',
        );
      }

      const occupiedSeats = await this.repository.sumOverlappingAttendees(
        dto.roomId,
        start,
        end,
        existingReservation.id,
      );

      this.validateCapacity(
        attendeesCount,
        room.capacity - occupiedSeats,
        room,
      );

      return this.repository.update(existingReservation.id, {
        attendeesCount: totalAttendees,
        justification,
      });
    }

    const occupiedSeats = await this.repository.sumOverlappingAttendees(
      dto.roomId,
      start,
      end,
    );

    if (occupiedSeats + attendeesCount > room.capacity) {
      this.validateCapacity(
        attendeesCount,
        room.capacity - occupiedSeats,
        room,
      );
    }

    return this.repository.create({
      userId,
      roomId: dto.roomId,
      date: this.toDate(dto.date, '00:00'),
      startTime: start,
      endTime: end,
      attendeesCount,
      justification: dto.justification?.trim() || undefined,
    });
  }

  findMine(userId: string) {
    return this.repository.findByUser(userId);
  }

  findAll(filters: ReservationFiltersDto = {}) {
    const dateRange = filters.date
      ? {
          gte: this.toDate(filters.date, '00:00'),
          lt: this.toDate(this.addOneDay(filters.date), '00:00'),
        }
      : undefined;

    return this.repository.findAll({
      date: dateRange,
      roomId: filters.roomId,
      userId: filters.userId,
    });
  }

  async update(
    id: string,
    userId: string,
    role: 'USER' | 'ADMIN',
    dto: UpdateReservationDto,
  ) {
    const reservation = await this.getManageableReservation(id, userId, role);
    const date = dto.date ?? this.formatDate(reservation.date);
    const startTime = dto.startTime ?? this.formatTime(reservation.startTime);
    const endTime = dto.endTime ?? this.formatTime(reservation.endTime);
    const start = this.toDate(date, startTime);
    const end = this.toDate(date, endTime);

    this.validateTimeWindow(start, end);
    const targetRoomId = dto.roomId ?? reservation.roomId;
    const room = await this.repository.findRoom(targetRoomId);

    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    const attendeesCount =
      dto.attendeesCount ?? reservation.attendeesCount ?? 1;
    this.validateJustification(
      attendeesCount,
      dto.justification ?? reservation.justification ?? undefined,
    );

    const occupiedSeats = await this.repository.sumOverlappingAttendees(
      targetRoomId,
      start,
      end,
      id,
    );

    this.validateCapacity(attendeesCount, room.capacity - occupiedSeats, room);

    return this.repository.update(id, {
      roomId: dto.roomId,
      date: this.toDate(date, '00:00'),
      startTime: start,
      endTime: end,
      attendeesCount,
      justification:
        dto.justification ?? reservation.justification ?? undefined,
    });
  }

  async cancel(id: string, userId: string, role: 'USER' | 'ADMIN') {
    await this.getManageableReservation(id, userId, role);
    return this.repository.update(id, { status: 'CANCELLED' });
  }

  private async getManageableReservation(
    id: string,
    userId: string,
    role: 'USER' | 'ADMIN',
  ) {
    const reservation = await this.repository.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (role !== 'ADMIN' && reservation.userId !== userId) {
      throw new ForbiddenException('Você não pode alterar esta reserva');
    }

    return reservation;
  }

  private validateTimeWindow(start: Date, end: Date): void {
    if (start >= end) {
      throw new BadRequestException(
        'Horário de término deve ser após o início',
      );
    }

    if (end.getTime() - start.getTime() < 60 * 60 * 1000) {
      throw new BadRequestException('Duração mínima da reserva é de 1 hora');
    }

    if (start < new Date()) {
      throw new BadRequestException(
        'Não é possível reservar um horário no passado',
      );
    }
  }

  private validateJustification(
    attendeesCount: number,
    justification?: string,
  ): void {
    if (attendeesCount > 1 && !justification?.trim()) {
      throw new BadRequestException(
        'Informe uma justificativa para reservar mais de 1 lugar',
      );
    }
  }

  private validateCapacity(
    attendeesCount: number,
    availableSeats: number,
    room: { capacity: number },
  ): void {
    if (attendeesCount > availableSeats) {
      throw new ConflictException(
        `A reserva não pode exceder a capacidade de ${room.capacity} participantes (${availableSeats} vagas restantes)`,
      );
    }
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private formatTime(value: Date): string {
    return value.toISOString().slice(11, 16);
  }

  private toDate(date: string, time: string): Date {
    return new Date(`${date}T${time}:00`);
  }

  private addOneDay(date: string): string {
    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() + 1);
    return value.toISOString().slice(0, 10);
  }
}
