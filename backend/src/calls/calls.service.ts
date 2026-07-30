import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';
import { LivekitService } from './livekit.service';

@Injectable()
export class CallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly livekit: LivekitService,
  ) {}

  async findOne(userId: string, id: string) {
    const call = await this.prisma.callSession.findUnique({
      where: { id },
      include: { participants: { include: { user: true } } },
    });

    if (!call) throw new NotFoundException('Call not found');
    const currentUser = call.participants.find((p) => p.userId === userId)?.user;
    if (!currentUser) {
      throw new ForbiddenException('You are not part of this call');
    }

    const other = call.participants.find((p) => p.userId !== userId)?.user;

    const { token, livekitUrl } = await this.livekit.issueToken({
      roomName: `call_${call.id}`,
      userId,
      displayName: currentUser.name,
      canPublishVideo: call.mode === 'video',
    });

    return {
      id: call.id,
      mode: call.mode,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      token,
      livekitUrl,
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

    const updated = await this.prisma.callSession.update({
      where: { id },
      data: { endedAt, durationSeconds },
    });

    await this.livekit.endRoom(`call_${call.id}`);

    return updated;
  }
}
