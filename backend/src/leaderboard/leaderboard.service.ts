import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findTop(currentUserId?: string, take = 20) {
    const users = await this.prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take,
      select: { id: true, name: true, xp: true, streakDays: true },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      initials: initialsFromName(u.name),
      xp: u.xp,
      streakDays: u.streakDays,
      isCurrentUser: u.id === currentUserId,
    }));
  }
}
