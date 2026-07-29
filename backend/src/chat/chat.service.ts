import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { initialsFromName } from '../common/initials';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async findConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { include: { languageProfile: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return conversations.map((c) => {
      const other = c.participants.find((p) => p.userId !== userId)?.user;
      const lastMessage = c.messages[0];
      return {
        id: c.id,
        partnerId: other?.id,
        partnerName: other?.name ?? 'Unknown',
        partnerInitials: other ? initialsFromName(other.name) : '?',
        partnerLanguage: other?.languageProfile?.spokenLanguages[0] ?? '',
        lastMessage: lastMessage
          ? { text: lastMessage.text, createdAt: lastMessage.createdAt, from: lastMessage.senderId === userId ? 'me' : 'them' }
          : null,
      };
    });
  }

  private async assertParticipant(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (!conversation.participants.some((p) => p.userId === userId)) {
      throw new ForbiddenException('You are not part of this conversation');
    }
    return conversation;
  }

  async findMessages(userId: string, conversationId: string) {
    await this.assertParticipant(userId, conversationId);
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((m) => ({
      id: m.id,
      from: m.senderId === userId ? 'me' : 'them',
      text: m.text,
      createdAt: m.createdAt,
    }));
  }

  async sendMessage(userId: string, conversationId: string, text: string) {
    await this.assertParticipant(userId, conversationId);
    const message = await this.prisma.chatMessage.create({
      data: { conversationId, senderId: userId, text },
    });
    return { id: message.id, from: 'me' as const, text: message.text, createdAt: message.createdAt };
  }

  async startConversation(userId: string, partnerId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: partnerId } } },
        ],
      },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: { participants: { create: [{ userId }, { userId: partnerId }] } },
    });
  }
}
