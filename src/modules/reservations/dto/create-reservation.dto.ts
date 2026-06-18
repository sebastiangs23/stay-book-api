import { IsDateString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  declare roomId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  declare userId: number;

  @IsNotEmpty()
  @IsDateString()
  declare checkIn: string;

  @IsNotEmpty()
  @IsDateString()
  declare checkOut: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  declare numberOfGuest: number;
}
