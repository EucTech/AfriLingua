import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';
import { PracticeDto } from './dto/practice.dto';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async findPartners(currentUserId: string) {
    const users = await this.prisma.user.findMany({
      where: { id: { not: currentUserId }, languageProfile: { isNot: null } },
      include: { languageProfile: true },
    });

    return users
      .filter((u) => u.languageProfile)
      .map((u) => ({
        id: u.id,
        name: u.name,
        initials: initialsFromName(u.name),
        country: u.country ?? '',
        speaks: u.languageProfile!.spokenLanguages,
        learning: u.languageProfile!.targetLanguages,
        proficiency: u.languageProfile!.proficiency,
        availability: u.languageProfile!.availability,
      }));
  }

  async practice(currentUserId: string, dto: PracticeDto) {
    const candidates = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        languageProfile: { spokenLanguages: { has: dto.language } },
      },
      include: { languageProfile: true },
    });

    const pool = candidates.length > 0
      ? candidates
      : await this.prisma.user.findMany({ where: { id: { not: currentUserId } } });

    if (pool.length === 0) {
      throw new NotFoundException('No partners are available right now');
    }

    const partner = pool[Math.floor(Math.random() * pool.length)];

    const callSession = await this.prisma.callSession.create({
      data: {
        mode: dto.mode,
        participants: {
          create: [{ userId: currentUserId }, { userId: partner.id }],
        },
      },
    });

    return {
      callSessionId: callSession.id,
      partner: {
        id: partner.id,
        name: partner.name,
        initials: initialsFromName(partner.name),
        country: partner.country ?? '',
      },
    };
  }
}
