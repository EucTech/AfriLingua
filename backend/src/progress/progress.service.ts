import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string) {
    const rows = await this.prisma.lessonProgress.findMany({
      where: { userId },
      select: { lessonId: true, completedAt: true },
    });
    return { completedLessonIds: rows.map((r) => r.lessonId) };
  }

  async completeLesson(userId: string, lessonId: string) {
    const progress = await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {},
      create: { userId, lessonId },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: 20 } },
    });

    return progress;
  }
}
