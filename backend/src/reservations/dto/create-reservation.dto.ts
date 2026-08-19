import { IsDateString, IsString, Matches } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateReservationDto {
  @IsString()
  roomId!: string;

  @IsDateString()
  date!: string;

  @Matches(TIME_PATTERN, {
    message: 'startTime deve estar no formato HH:mm',
  })
  startTime!: string;

  @Matches(TIME_PATTERN, {
    message: 'endTime deve estar no formato HH:mm',
  })
  endTime!: string;
}
