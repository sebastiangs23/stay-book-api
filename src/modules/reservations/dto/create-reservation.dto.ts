import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @Min(1)
  roomId!: number;

  // Temporary until auth is implemented.
  // Later this will come from the JWT user.
  @IsInt()
  @Min(1)
  userId!: number;

  @IsDateString()
  checkIn!: string;

  @IsDateString()
  checkOut!: string;
}