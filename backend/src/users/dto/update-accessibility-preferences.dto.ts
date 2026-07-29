import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAccessibilityPreferencesDto {
  @IsOptional()
  @IsString()
  interfaceLanguage?: string;

  @IsOptional()
  @IsBoolean()
  liteMode?: boolean;
}
