import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.room.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: CreateRoomDto) {
    try {
      return await this.prisma.room.create({ data: dto });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Sala já cadastrada');
      }

      throw error;
    }
  }

  async update(id: string, dto: UpdateRoomDto) {
    const room = await this.prisma.room.findUnique({ where: { id } });

    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    try {
      return await this.prisma.room.update({ where: { id }, data: dto });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Sala já cadastrada');
      }

      throw error;
    }
  }

  async remove(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { reservations: { select: { id: true }, take: 1 } },
    });

    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    if (room.reservations.length > 0) {
      throw new ConflictException(
        'Não é possível excluir uma sala com reservas vinculadas',
      );
    }

    return this.prisma.room.delete({ where: { id } });
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
