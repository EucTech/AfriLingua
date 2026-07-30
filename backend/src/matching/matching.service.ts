import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';
import { LivekitService } from '../calls/livekit.service';
import { PracticeDto } from './dto/practice.dto';

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly livekit: LivekitService,
  ) {}

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
    const currentUser = await this.prisma.user.findUniqueOrThrow({ where: { id: currentUserId } });

    const callSession = await this.prisma.callSession.create({
      data: {
        mode: dto.mode,
        participants: {
          create: [{ userId: currentUserId }, { userId: partner.id }],
        },
      },
    });

    const roomName = `call_${callSession.id}`;
    const canPublishVideo = dto.mode === 'video';
    await this.livekit.ensureRoom(roomName);
    const { token, livekitUrl } = await this.livekit.issueToken({
      roomName,
      userId: currentUserId,
      displayName: currentUser.name,
      canPublishVideo,
    });

    return {
      callSessionId: callSession.id,
      token,
      livekitUrl,
      partner: {
        id: partner.id,
        name: partner.name,
        initials: initialsFromName(partner.name),
        country: partner.country ?? '',
      },
    };
  }
}
