import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum CourseLevelDto {
  beginner = 'beginner',
  intermediate = 'intermediate',
  advanced = 'advanced',
}

export class UpdateLanguageProfileDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  spokenLanguages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetLanguages?: string[];

  @IsOptional()
  @IsEnum(CourseLevelDto)
  proficiency?: CourseLevelDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availability?: string[];
}
