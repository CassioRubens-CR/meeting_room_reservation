import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ReservationFiltersDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Informe uma data válida no formato YYYY-MM-DD' },
  )
  date?: string;

  @IsOptional()
  @IsString({ message: 'O identificador da sala deve ser um texto' })
  roomId?: string;

  @IsOptional()
  @IsString({ message: 'O identificador do usuário deve ser um texto' })
  userId?: string;
}
