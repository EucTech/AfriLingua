import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient, TrackSource } from 'livekit-server-sdk';

export interface LivekitJoinToken {
  token: string;
  livekitUrl: string;
}

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly wsUrl: string;
  private readonly roomClient: RoomServiceClient;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('LIVEKIT_API_KEY');
    this.apiSecret = config.getOrThrow<string>('LIVEKIT_API_SECRET');
    this.wsUrl = config.getOrThrow<string>('LIVEKIT_URL');
    const httpUrl = this.wsUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
    this.roomClient = new RoomServiceClient(httpUrl, this.apiKey, this.apiSecret);
  }

  async ensureRoom(roomName: string): Promise<void> {
    try {
      await this.roomClient.createRoom({ name: roomName, emptyTimeout: 60, maxParticipants: 2 });
    } catch (err) {
      this.logger.warn(`LiveKit createRoom failed for ${roomName}: ${(err as Error).message}`);
    }
  }

  async endRoom(roomName: string): Promise<void> {
    try {
      await this.roomClient.deleteRoom(roomName);
    } catch (err) {
      this.logger.debug(`LiveKit deleteRoom failed for ${roomName}: ${(err as Error).message}`);
    }
  }

  async issueToken(params: {
    roomName: string;
    userId: string;
    displayName: string;
    canPublishVideo: boolean;
  }): Promise<LivekitJoinToken> {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: params.userId,
      name: params.displayName,
      ttl: 3600,
    });
    at.addGrant({
      roomJoin: true,
      room: params.roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishSources: params.canPublishVideo ? undefined : [TrackSource.MICROPHONE],
    });

    return { token: await at.toJwt(), livekitUrl: this.wsUrl };
  }
}
