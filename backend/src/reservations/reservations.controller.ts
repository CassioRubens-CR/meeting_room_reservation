import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('me')
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.reservationsService.findMine(user.sub);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.reservationsService.findAll();
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(user.sub, dto, user.role);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, user.sub, user.role, dto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.reservationsService.cancel(id, user.sub, user.role);
  }
}
