import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsString()
  location?: string;
}
