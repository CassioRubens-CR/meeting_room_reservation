import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Matches,
  ValidateIf,
} from 'class-validator';
import { HasAtLeastOneField } from '../../common/decorators/has-at-least-one-field.decorator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

@HasAtLeastOneField(['roomId', 'date', 'startTime', 'endTime'], {
  message: 'Informe pelo menos um campo para atualizar a reserva',
})
export class UpdateReservationDto {
  @IsOptional()
  @IsString({ message: 'O identificador da sala deve ser um texto' })
  roomId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Informe uma data válida' })
  date?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, {
    message: 'O horário inicial deve estar no formato HH:mm',
  })
  startTime?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, {
    message: 'O horário final deve estar no formato HH:mm',
  })
  endTime?: string;

  @IsOptional()
  @IsInt({
    message: 'A quantidade de participantes deve ser um número inteiro',
  })
  @Min(1, { message: 'A reserva deve ter pelo menos 1 participante' })
  attendeesCount?: number;

  @ValidateIf(
    (reservation: { attendeesCount?: number }) =>
      reservation.attendeesCount !== undefined &&
      reservation.attendeesCount > 1,
  )
  @IsString({ message: 'A justificativa deve ser um texto' })
  @IsNotEmpty({
    message: 'A justificativa é obrigatória para mais de 1 participante',
  })
  @IsOptional()
  justification?: string;
}
