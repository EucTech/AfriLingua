import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';
import { LivekitService } from '../calls/livekit.service';
import { PracticeDto } from './dto/practice.dto';
import type { CallMode } from '../../generated/prisma/client';

const QUEUE_FRESHNESS_MS = 2 * 60 * 1000;

export interface MatchedResult {
  status: 'matched';
  callSessionId: string;
  partner: { id: string; name: string; initials: string; country: string };
}

export interface WaitingResult {
  status: 'waiting';
  entryId: string;
}

export interface CancelledResult {
  status: 'cancelled';
}

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

  async practice(currentUserId: string, dto: PracticeDto): Promise<MatchedResult | WaitingResult> {
    await this.prisma.matchQueueEntry.deleteMany({
      where: { userId: currentUserId, status: 'waiting' },
    });

    const matched = await this.tryMatch(currentUserId, dto.mode, dto.language);
    if (matched) return matched;

    const entry = await this.prisma.matchQueueEntry.create({
      data: { userId: currentUserId, mode: dto.mode, language: dto.language },
    });
    return { status: 'waiting', entryId: entry.id };
  }

  async pollQueue(currentUserId: string, entryId: string): Promise<MatchedResult | WaitingResult | CancelledResult> {
    const entry = await this.prisma.matchQueueEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.userId !== currentUserId) {
      throw new NotFoundException('Queue entry not found');
    }

    if (entry.status === 'cancelled') return { status: 'cancelled' };

    if (entry.status === 'matched' && entry.callSessionId) {
      return this.buildMatchedResult(currentUserId, entry.callSessionId);
    }

    const matched = await this.tryMatch(currentUserId, entry.mode, entry.language, entry.id);
    if (matched) return matched;

    return { status: 'waiting', entryId: entry.id };
  }

  async cancelQueue(currentUserId: string, entryId: string): Promise<{ ok: true }> {
    const entry = await this.prisma.matchQueueEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.userId !== currentUserId) {
      throw new NotFoundException('Queue entry not found');
    }
    if (entry.status === 'waiting') {
      await this.prisma.matchQueueEntry.update({ where: { id: entryId }, data: { status: 'cancelled' } });
    }
    return { ok: true };
  }

  private async tryMatch(
    currentUserId: string,
    mode: CallMode,
    language: string,
    ownEntryId?: string,
  ): Promise<MatchedResult | null> {
    const candidates = await this.prisma.matchQueueEntry.findMany({
      where: {
        status: 'waiting',
        mode,
        language,
        userId: { not: currentUserId },
        createdAt: { gte: new Date(Date.now() - QUEUE_FRESHNESS_MS) },
      },
      orderBy: { createdAt: 'asc' },
      take: 5,
      select: { id: true, userId: true },
    });

    for (const candidate of candidates) {
      const targetIds = ownEntryId ? [candidate.id, ownEntryId] : [candidate.id];

      const callSession = await this.prisma.callSession.create({
        data: {
          mode,
          participants: { create: [{ userId: currentUserId }, { userId: candidate.userId }] },
        },
      });

      // Claim the candidate (and our own entry, if any) in a single UPDATE.
      // Postgres runs this as one atomic statement, so it can never claim
      // just one of the two rows as a visible intermediate state — two
      // concurrent match attempts racing over the same rows always resolve
      // to exactly one winner, with no possibility of a livelock (the old
      // claim-then-separately-claim-own approach could deadlock when both
      // sides raced symmetrically) and no bucket-wide lock that could
      // exhaust the DB connection pool under load (an advisory-lock
      // transaction did exactly that).
      const claimed = await this.prisma.matchQueueEntry.updateMany({
        where: { id: { in: targetIds }, status: 'waiting' },
        data: { status: 'matched', callSessionId: callSession.id },
      });

      if (claimed.count === targetIds.length) {
        await this.livekit.ensureRoom(`call_${callSession.id}`);
        return this.buildMatchedResult(currentUserId, callSession.id);
      }

      // Someone else got to one of these rows first. Undo whatever we did
      // manage to flip and discard the now-unused call session, then try
      // the next candidate.
      await this.prisma.matchQueueEntry.updateMany({
        where: { id: { in: targetIds }, callSessionId: callSession.id },
        data: { status: 'waiting', callSessionId: null },
      });
      await this.prisma.callSession.delete({ where: { id: callSession.id } }).catch(() => {});
    }

    return null;
  }

  private async buildMatchedResult(currentUserId: string, callSessionId: string): Promise<MatchedResult> {
    const callSession = await this.prisma.callSession.findUniqueOrThrow({
      where: { id: callSessionId },
      include: { participants: { include: { user: true } } },
    });
    const partnerUser = callSession.participants.find((p) => p.userId !== currentUserId)?.user;
    if (!partnerUser) throw new NotFoundException('Partner not found');

    return {
      status: 'matched',
      callSessionId: callSession.id,
      partner: {
        id: partnerUser.id,
        name: partnerUser.name,
        initials: initialsFromName(partnerUser.name),
        country: partnerUser.country ?? '',
      },
    };
  }
}
