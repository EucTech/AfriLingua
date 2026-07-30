import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum CourseLevelDto {
  beginner = 'beginner',
  intermediate = 'intermediate',
  advanced = 'advanced',
}

export class CreateTrackDto {
  @IsEnum(CourseLevelDto)
  level: CourseLevelDto;

  @IsString()
  @IsNotEmpty()
  cefr: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;
}

export class UpdateTrackDto {
  @IsOptional()
  @IsString()
  cefr?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;
}

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;
}

export class VocabWordInput {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsNotEmpty()
  translation: string;
}

export class QuizQuestionInput {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options: string[];

  @IsInt()
  @Min(0)
  correctIndex: number;
}

export class LessonInputDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  videoTitle: string;

  @IsInt()
  @Min(0)
  videoMinutes: number;

  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VocabWordInput)
  words: VocabWordInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionInput)
  quiz: QuizQuestionInput[];
}
