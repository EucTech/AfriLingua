import { IsEnum } from 'class-validator';

export enum UserRoleDto {
  user = 'user',
  admin = 'admin',
}

export class UpdateUserRoleDto {
  @IsEnum(UserRoleDto)
  role: UserRoleDto;
}
