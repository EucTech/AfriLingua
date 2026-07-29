import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateLanguageProfileDto } from './dto/update-language-profile.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { UpdateAccessibilityPreferencesDto } from './dto/update-accessibility-preferences.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.me(user.userId);
  }

  @Patch('me/language-profile')
  updateLanguageProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateLanguageProfileDto) {
    return this.usersService.updateLanguageProfile(user.userId, dto);
  }

  @Patch('me/notification-preferences')
  updateNotificationPreferences(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.usersService.updateNotificationPreferences(user.userId, dto);
  }

  @Patch('me/accessibility-preferences')
  updateAccessibilityPreferences(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateAccessibilityPreferencesDto,
  ) {
    return this.usersService.updateAccessibilityPreferences(user.userId, dto);
  }
}
