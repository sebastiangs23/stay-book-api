import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubmoduleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isPrivate!: boolean;
}
