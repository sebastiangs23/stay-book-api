import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive!: string;

  @IsIn(['GUEST', 'STAFF'])
  role!: 'GUEST' | 'STAFF';
}
