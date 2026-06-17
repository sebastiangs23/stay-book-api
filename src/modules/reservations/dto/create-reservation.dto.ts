import { IsDateString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  roomId!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  userId!: number;

  @IsNotEmpty()
  @IsDateString()
  checkIn!: string;

  @IsNotEmpty()
  @IsDateString()
  checkOut!: string;
}