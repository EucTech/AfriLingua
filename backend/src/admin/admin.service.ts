import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';
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

const SIGNUP_WINDOW_DAYS = 14;

const courseDetailInclude = {
  tracks: {
    orderBy: { level: 'asc' as const },
    include: {
      chapters: {
        orderBy: { order: 'asc' as const },
        include: {
          lessons: {
            orderBy: { order: 'asc' as const },
            include: {
              words: { orderBy: { order: 'asc' as const } },
              quiz: { orderBy: { order: 'asc' as const } },
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const since = new Date();
    since.setDate(since.getDate() - (SIGNUP_WINDOW_DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const [totalUsers, totalCourses, totalLessons, recentUsers, languageProfiles] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.lesson.count(),
      this.prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.languageProfile.findMany({
        select: { spokenLanguages: true, targetLanguages: true },
      }),
    ]);

    const signupsByDay = new Map<string, number>();
    for (let i = 0; i < SIGNUP_WINDOW_DAYS; i++) {
      const day = new Date(since);
      day.setDate(day.getDate() + i);
      signupsByDay.set(day.toISOString().slice(0, 10), 0);
    }
    for (const user of recentUsers) {
      const key = user.createdAt.toISOString().slice(0, 10);
      signupsByDay.set(key, (signupsByDay.get(key) ?? 0) + 1);
    }

    const learningLanguages = new Map<string, number>();
    for (const profile of languageProfiles) {
      for (const language of profile.targetLanguages) {
        learningLanguages.set(language, (learningLanguages.get(language) ?? 0) + 1);
      }
    }

    return {
      totalUsers,
      totalCourses,
      totalLessons,
      signups: [...signupsByDay.entries()].map(([date, count]) => ({ date, count })),
      topLearningLanguages: [...learningLanguages.entries()]
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    };
  }

  async listUsers(search: string | undefined, page: number, pageSize: number) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          country: true,
          role: true,
          xp: true,
          streakDays: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => ({ ...user, initials: initialsFromName(user.name) })),
      total,
      page,
      pageSize,
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      include: { languageProfile: true },
    });
    const { passwordHash: _passwordHash, ...rest } = user;
    return { ...rest, initials: initialsFromName(user.name) };
  }

  updateUserRole(id: string, dto: UpdateUserRoleDto) {
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  listCourses() {
    return this.prisma.course.findMany({
      include: { _count: { select: { tracks: true } } },
      orderBy: { language: 'asc' },
    });
  }

  createCourse(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        ...dto,
        tracks: {
          create: [{ level: 'beginner', cefr: 'A1', description: dto.description, locked: false }],
        },
      },
      include: courseDetailInclude,
    });
  }

  updateCourse(id: string, dto: UpdateCourseDto) {
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  deleteCourse(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  getCourseDetail(id: string) {
    return this.prisma.course.findUniqueOrThrow({ where: { id }, include: courseDetailInclude });
  }

  addTrack(courseId: string, dto: CreateTrackDto) {
    return this.prisma.levelTrack.create({
      data: {
        courseId,
        level: dto.level,
        cefr: dto.cefr,
        description: dto.description,
        locked: dto.locked ?? true,
      },
    });
  }

  updateTrack(trackId: string, dto: UpdateTrackDto) {
    return this.prisma.levelTrack.update({ where: { id: trackId }, data: dto });
  }

  deleteTrack(trackId: string) {
    return this.prisma.levelTrack.delete({ where: { id: trackId } });
  }

  async addChapter(trackId: string, dto: CreateChapterDto) {
    const order = await this.prisma.chapter.count({ where: { trackId } });
    return this.prisma.chapter.create({ data: { trackId, title: dto.title, order } });
  }

  updateChapter(chapterId: string, dto: UpdateChapterDto) {
    return this.prisma.chapter.update({ where: { id: chapterId }, data: dto });
  }

  deleteChapter(chapterId: string) {
    return this.prisma.chapter.delete({ where: { id: chapterId } });
  }

  async addLesson(chapterId: string, dto: LessonInputDto) {
    const order = await this.prisma.lesson.count({ where: { chapterId } });
    return this.prisma.lesson.create({
      data: {
        chapterId,
        title: dto.title,
        videoTitle: dto.videoTitle,
        videoMinutes: dto.videoMinutes,
        videoUrl: dto.videoUrl,
        order,
        words: {
          create: dto.words.map((word, index) => ({ word: word.word, translation: word.translation, order: index })),
        },
        quiz: {
          create: dto.quiz.map((question, index) => ({
            prompt: question.prompt,
            options: question.options,
            correctIndex: question.correctIndex,
            order: index,
          })),
        },
      },
      include: { words: true, quiz: true },
    });
  }

  async updateLesson(lessonId: string, dto: LessonInputDto) {
    await this.prisma.vocabWord.deleteMany({ where: { lessonId } });
    await this.prisma.quizQuestion.deleteMany({ where: { lessonId } });
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: dto.title,
        videoTitle: dto.videoTitle,
        videoMinutes: dto.videoMinutes,
        videoUrl: dto.videoUrl,
        words: {
          create: dto.words.map((word, index) => ({ word: word.word, translation: word.translation, order: index })),
        },
        quiz: {
          create: dto.quiz.map((question, index) => ({
            prompt: question.prompt,
            options: question.options,
            correctIndex: question.correctIndex,
            order: index,
          })),
        },
      },
      include: { words: true, quiz: true },
    });
  }

  deleteLesson(lessonId: string) {
    return this.prisma.lesson.delete({ where: { id: lessonId } });
  }
}
