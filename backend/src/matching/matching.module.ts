import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { CallsModule } from '../calls/calls.module';

@Module({
  imports: [CallsModule],
  providers: [MatchingService],
  controllers: [MatchingController],
})
export class MatchingModule {}
