import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomId!: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId!: number;

  @IsNotEmpty()
  @IsDateString()
  checkIn!: string;

  @IsNotEmpty()
  @IsDateString()
  checkOut!: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(15)
  numberOfGuest!: number;
}
