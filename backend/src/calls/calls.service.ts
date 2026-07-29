import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';

@Injectable()
export class CallsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: string, id: string) {
    const call = await this.prisma.callSession.findUnique({
      where: { id },
      include: { participants: { include: { user: true } } },
    });

    if (!call) throw new NotFoundException('Call not found');
    if (!call.participants.some((p) => p.userId === userId)) {
      throw new ForbiddenException('You are not part of this call');
    }

    const other = call.participants.find((p) => p.userId !== userId)?.user;

    return {
      id: call.id,
      mode: call.mode,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      partner: other && {
        id: other.id,
        name: other.name,
        initials: initialsFromName(other.name),
        country: other.country ?? '',
      },
    };
  }

  async end(userId: string, id: string) {
    const call = await this.prisma.callSession.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!call) throw new NotFoundException('Call not found');
    if (!call.participants.some((p) => p.userId === userId)) {
      throw new ForbiddenException('You are not part of this call');
    }

    const endedAt = new Date();
    const durationSeconds = Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000);

    return this.prisma.callSession.update({
      where: { id },
      data: { endedAt, durationSeconds },
    });
  }
}
