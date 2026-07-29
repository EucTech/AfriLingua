import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/current-user.decorator';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  findForUser(@CurrentUser() user: RequestUser) {
    return this.progressService.findForUser(user.userId);
  }

  @Post('lessons/:lessonId/complete')
  completeLesson(@CurrentUser() user: RequestUser, @Param('lessonId') lessonId: string) {
    return this.progressService.completeLesson(user.userId, lessonId);
  }
}
