import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
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
}
