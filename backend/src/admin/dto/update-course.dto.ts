import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nativeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  flagEmoji?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
