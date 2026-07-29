import { IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
