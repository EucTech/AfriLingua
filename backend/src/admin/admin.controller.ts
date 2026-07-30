import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';
import { CloudinaryService } from './cloudinary.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import {
  CreateChapterDto,
  CreateTrackDto,
  LessonInputDto,
  UpdateChapterDto,
  UpdateTrackDto,
} from './dto/course-content.dto';

const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('uploads/video')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: memoryStorage(),
      limits: { fileSize: 200 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!VIDEO_MIME_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Video must be MP4, WebM, or MOV'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const url = await this.cloudinaryService.uploadVideo(file);
    return { url };
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  listUsers(@Query('search') search?: string, @Query('page') page = '1', @Query('pageSize') pageSize = '20') {
    return this.adminService.listUsers(search, Number(page) || 1, Number(pageSize) || 20);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(id, dto);
  }

  @Get('courses')
  listCourses() {
    return this.adminService.listCourses();
  }

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto) {
    return this.adminService.createCourse(dto);
  }

  @Patch('courses/:id')
  updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.adminService.updateCourse(id, dto);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) {
    return this.adminService.deleteCourse(id);
  }

  @Get('courses/:id/detail')
  getCourseDetail(@Param('id') id: string) {
    return this.adminService.getCourseDetail(id);
  }

  @Post('courses/:id/tracks')
  addTrack(@Param('id') courseId: string, @Body() dto: CreateTrackDto) {
    return this.adminService.addTrack(courseId, dto);
  }

  @Patch('tracks/:trackId')
  updateTrack(@Param('trackId') trackId: string, @Body() dto: UpdateTrackDto) {
    return this.adminService.updateTrack(trackId, dto);
  }

  @Delete('tracks/:trackId')
  deleteTrack(@Param('trackId') trackId: string) {
    return this.adminService.deleteTrack(trackId);
  }

  @Post('tracks/:trackId/chapters')
  addChapter(@Param('trackId') trackId: string, @Body() dto: CreateChapterDto) {
    return this.adminService.addChapter(trackId, dto);
  }

  @Patch('chapters/:chapterId')
  updateChapter(@Param('chapterId') chapterId: string, @Body() dto: UpdateChapterDto) {
    return this.adminService.updateChapter(chapterId, dto);
  }

  @Delete('chapters/:chapterId')
  deleteChapter(@Param('chapterId') chapterId: string) {
    return this.adminService.deleteChapter(chapterId);
  }

  @Post('chapters/:chapterId/lessons')
  addLesson(@Param('chapterId') chapterId: string, @Body() dto: LessonInputDto) {
    return this.adminService.addLesson(chapterId, dto);
  }

  @Patch('lessons/:lessonId')
  updateLesson(@Param('lessonId') lessonId: string, @Body() dto: LessonInputDto) {
    return this.adminService.updateLesson(lessonId, dto);
  }

  @Delete('lessons/:lessonId')
  deleteLesson(@Param('lessonId') lessonId: string) {
    return this.adminService.deleteLesson(lessonId);
  }
}
