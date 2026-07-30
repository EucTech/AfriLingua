import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/current-user.decorator';
import { MatchingService } from './matching.service';
import { PracticeDto } from './dto/practice.dto';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('partners')
  findPartners(@CurrentUser() user: RequestUser) {
    return this.matchingService.findPartners(user.userId);
  }

  @Post('practice')
  practice(@CurrentUser() user: RequestUser, @Body() dto: PracticeDto) {
    return this.matchingService.practice(user.userId, dto);
  }

  @Get('practice/:entryId')
  pollPractice(@CurrentUser() user: RequestUser, @Param('entryId') entryId: string) {
    return this.matchingService.pollQueue(user.userId, entryId);
  }

  @Delete('practice/:entryId')
  cancelPractice(@CurrentUser() user: RequestUser, @Param('entryId') entryId: string) {
    return this.matchingService.cancelQueue(user.userId, entryId);
  }
}
