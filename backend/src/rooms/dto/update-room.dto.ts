import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { HasAtLeastOneField } from '../../common/decorators/has-at-least-one-field.decorator';

@HasAtLeastOneField(['name', 'capacity', 'location'], {
  message: 'Informe pelo menos um campo para atualizar a sala',
})
export class UpdateRoomDto {
  @IsOptional()
  @IsString({ message: 'O nome da sala deve ser um texto' })
  @IsNotEmpty({ message: 'O nome da sala não pode ficar vazio' })
  @MinLength(2, {
    message: 'O nome da sala deve ter pelo menos 2 caracteres',
  })
  name?: string;

  @IsOptional()
  @IsInt({ message: 'A capacidade deve ser um número inteiro' })
  @Min(1, { message: 'A capacidade deve ser de pelo menos 1 pessoa' })
  capacity?: number;

  @IsOptional()
  @IsString({ message: 'A localização deve ser um texto' })
  @IsNotEmpty({ message: 'A localização não pode ficar vazia' })
  location?: string;
}