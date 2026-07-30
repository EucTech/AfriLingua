import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateLanguageProfileDto } from './dto/update-language-profile.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { UpdateAccessibilityPreferencesDto } from './dto/update-accessibility-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const AVATAR_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/i;

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

  @Patch('me/profile')
  updateProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const user = (req as unknown as { user: RequestUser }).user;
          callback(null, `${user.userId}-${Date.now()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!AVATAR_EXTENSIONS.test(extname(file.originalname))) {
          callback(new BadRequestException('Avatar must be a JPG, PNG, or WebP image'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadAvatar(@CurrentUser() user: RequestUser, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.updateAvatar(user.userId, `/uploads/avatars/${file.filename}`);
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
