import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOverlapping(roomId: string, start: Date, end: Date) {
    return this.prisma.reservation.findFirst({
      where: {
        roomId,
        status: 'CONFIRMED',
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
  }

  findById(id: string) {
    return this.prisma.reservation.findUnique({ where: { id } });
  }

  update(
    id: string,
    data: {
      roomId?: string;
      date?: Date;
      startTime?: Date;
      endTime?: Date;
      status?: 'CONFIRMED' | 'CANCELLED';
    },
  ) {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  findOverlappingExcept(
    roomId: string,
    start: Date,
    end: Date,
    excludeId: string,
  ) {
    return this.prisma.reservation.findFirst({
      where: {
        roomId,
        status: 'CONFIRMED',
        id: { not: excludeId },
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
  }

  create(data: {
    userId: string;
    roomId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
  }) {
    return this.prisma.reservation.create({ data });
  }

  findByUser(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { room: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
}
