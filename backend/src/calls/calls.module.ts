import { Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { LivekitService } from './livekit.service';

@Module({
  providers: [CallsService, LivekitService],
  controllers: [CallsController],
  exports: [LivekitService],
})
export class CallsModule {}
