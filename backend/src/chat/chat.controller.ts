import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { RequestUser } from '../auth/current-user.decorator';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { StartConversationDto } from './dto/start-conversation.dto';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  findConversations(@CurrentUser() user: RequestUser) {
    return this.chatService.findConversations(user.userId);
  }

  @Post('conversations')
  startConversation(@CurrentUser() user: RequestUser, @Body() dto: StartConversationDto) {
    return this.chatService.startConversation(user.userId, dto.partnerId);
  }

  @Get('conversations/:id/messages')
  findMessages(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.chatService.findMessages(user.userId, id);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user.userId, id, dto.text);
  }
}
