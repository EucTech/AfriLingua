import { IsEnum, IsString } from 'class-validator';

export enum CallModeDto {
  video = 'video',
  audio = 'audio',
  chat = 'chat',
}

export class PracticeDto {
  @IsEnum(CallModeDto)
  mode: CallModeDto;

  @IsString()
  language: string;
}
