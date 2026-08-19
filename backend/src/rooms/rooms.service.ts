import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';

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

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
