import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoomDto {
  @IsString({ message: 'O nome da sala deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da sala é obrigatório' })
  @MinLength(2, {
    message: 'O nome da sala deve ter pelo menos 2 caracteres',
  })
  name!: string;

  @IsInt({ message: 'A capacidade deve ser um número inteiro' })
  @Min(1, { message: 'A capacidade deve ser de pelo menos 1 pessoa' })
  capacity!: number;

  @IsOptional()
  @IsString({ message: 'A localização deve ser um texto' })
  location?: string;
}
