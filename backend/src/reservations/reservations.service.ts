import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';

@Injectable()
export class ReservationsService {
  constructor(private readonly repository: ReservationsRepository) {}

  async create(userId: string, dto: CreateReservationDto) {
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
      throw new BadRequestException(
        'Duração mínima da reserva é de 1 hora',
      );
    }

    if (start < new Date()) {
      throw new BadRequestException(
        'Não é possível reservar um horário no passado',
      );
    }

    const conflict = await this.repository.findOverlapping(
      dto.roomId,
      start,
      end,
    );

    if (conflict) {
      throw new ConflictException('Sala já reservada nesse intervalo');
    }

    return this.repository.create({
      userId,
      roomId: dto.roomId,
      date: this.toDate(dto.date, '00:00'),
      startTime: start,
      endTime: end,
    });
  }

  findMine(userId: string) {
    return this.repository.findByUser(userId);
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
    const conflict = await this.repository.findOverlappingExcept(
      dto.roomId ?? reservation.roomId,
      start,
      end,
      id,
    );

    if (conflict) {
      throw new ConflictException('Sala já reservada nesse intervalo');
    }

    return this.repository.update(id, {
      roomId: dto.roomId,
      date: this.toDate(date, '00:00'),
      startTime: start,
      endTime: end,
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
      throw new BadRequestException(
        'Duração mínima da reserva é de 1 hora',
      );
    }

    if (start < new Date()) {
      throw new BadRequestException(
        'Não é possível reservar um horário no passado',
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
}
