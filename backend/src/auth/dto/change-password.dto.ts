import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'A senha atual deve ser um texto' })
  @IsNotEmpty({ message: 'A senha atual é obrigatória' })
  currentPassword!: string;

  @IsString({ message: 'A nova senha deve ser um texto' })
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @MinLength(8, { message: 'A nova senha deve ter pelo menos 8 caracteres' })
  newPassword!: string;
}