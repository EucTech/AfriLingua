import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [AdminService, CloudinaryService],
  controllers: [AdminController],
})
export class AdminModule {}
