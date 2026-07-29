import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async issueToken(userId: string, email: string) {
    return this.jwt.signAsync({ sub: userId, email });
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    name: string;
    country: string | null;
    avatarUrl: string | null;
    xp: number;
    streakDays: number;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      streakDays: user.streakDays,
      initials: initialsFromName(user.name),
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        languageProfile: {
          create: { spokenLanguages: [], targetLanguages: [], goals: [], availability: [] },
        },
        notificationPreferences: { create: {} },
        accessibilityPreferences: { create: {} },
      },
    });

    const accessToken = await this.issueToken(user.id, user.email);
    return { accessToken, user: this.toPublicUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.issueToken(user.id, user.email);
    return { accessToken, user: this.toPublicUser(user) };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.toPublicUser(user);
  }
}
