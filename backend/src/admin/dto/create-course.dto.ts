import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  language: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nativeName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  flagEmoji: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}
