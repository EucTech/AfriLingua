import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';
import { UpdateLanguageProfileDto } from './dto/update-language-profile.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { UpdateAccessibilityPreferencesDto } from './dto/update-accessibility-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { languageProfile: true, notificationPreferences: true, accessibilityPreferences: true },
    });
    const { passwordHash: _passwordHash, ...rest } = user;
    return { ...rest, initials: initialsFromName(user.name) };
  }

  updateLanguageProfile(userId: string, dto: UpdateLanguageProfileDto) {
    return this.prisma.languageProfile.update({ where: { userId }, data: dto });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: dto });
    const { passwordHash: _passwordHash, ...rest } = user;
    return { ...rest, initials: initialsFromName(user.name) };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
    const { passwordHash: _passwordHash, ...rest } = user;
    return { ...rest, initials: initialsFromName(user.name) };
  }

  updateNotificationPreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    return this.prisma.notificationPreferences.update({ where: { userId }, data: dto });
  }

  updateAccessibilityPreferences(userId: string, dto: UpdateAccessibilityPreferencesDto) {
    return this.prisma.accessibilityPreferences.update({ where: { userId }, data: dto });
  }
}
