import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  Matches,
  ValidateIf,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateReservationDto {
  @IsString({ message: 'O identificador da sala deve ser um texto' })
  @IsNotEmpty({ message: 'A sala é obrigatória' })
  roomId!: string;

  @IsDateString({}, { message: 'Informe uma data válida' })
  @IsNotEmpty({ message: 'A data é obrigatória' })
  date!: string;

  @Matches(TIME_PATTERN, {
    message: 'O horário inicial deve estar no formato HH:mm',
  })
  startTime!: string;

  @Matches(TIME_PATTERN, {
    message: 'O horário final deve estar no formato HH:mm',
  })
  endTime!: string;

  @IsInt({ message: 'A quantidade de participantes deve ser um número inteiro' })
  @Min(1, { message: 'A reserva deve ter pelo menos 1 participante' })
  attendeesCount: number = 1;

  @ValidateIf((reservation) => reservation.attendeesCount > 1)
  @IsString({ message: 'A justificativa deve ser um texto' })
  @IsNotEmpty({ message: 'A justificativa é obrigatória para mais de 1 participante' })
  justification?: string;
}
