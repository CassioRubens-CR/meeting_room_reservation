import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findRoom(roomId: string) {
    return this.prisma.room.findUnique({ where: { id: roomId } });
  }

  async sumOverlappingAttendees(
    roomId: string,
    start: Date,
    end: Date,
    excludeId?: string,
  ) {
    const result = await this.prisma.reservation.aggregate({
      where: {
        roomId,
        status: 'CONFIRMED',
        ...(excludeId ? { id: { not: excludeId } } : {}),
        startTime: { lt: end },
        endTime: { gt: start },
      },
      _sum: { attendeesCount: true },
    });

    return result._sum.attendeesCount ?? 0;
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
      attendeesCount?: number;
      justification?: string;
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
    return this.sumOverlappingAttendees(roomId, start, end, excludeId);
  }

  create(data: {
    userId: string;
    roomId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    attendeesCount: number;
    justification?: string;
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

  findAll(filters: {
    date?: { gte: Date; lt: Date };
    roomId?: string;
    userId?: string;
  }) {
    return this.prisma.reservation.findMany({
      where: {
        ...(filters.date ? { date: filters.date } : {}),
        ...(filters.roomId ? { roomId: filters.roomId } : {}),
        ...(filters.userId ? { userId: filters.userId } : {}),
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
}
