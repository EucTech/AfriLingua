import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const courseInclude = {
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
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.course.findMany({ include: courseInclude });
  }

  findOne(id: string) {
    return this.prisma.course.findUniqueOrThrow({ where: { id }, include: courseInclude });
  }
}
