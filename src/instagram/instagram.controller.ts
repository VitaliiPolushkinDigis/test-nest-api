import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramAutomationService } from './instagram-automation.service';

@Controller('instagram')
export class InstagramController {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly automationService: InstagramAutomationService,
  ) {}

  @Post('send-dm')
  async sendDirectMessage(
    @Body() body: { recipientId: string; message: string }
  ) {
    //TODO: use recipientId from the user, not hardcoded
    return await this.instagramService.sendDirectMessage(
      body.recipientId || '708149675552701', // Use valid user ID (8teenyo) instead of conversation ID
      body.message || 'Hello! This is a test message from your Instagram automation.'
    );
  }

  @Post('auto-reply')
  async handleAutoReply(
    @Body() body: { message: string; userId: string }
  ) {
    return await this.automationService.handleAutoReply(
      body.message,
      body.userId
    );
  }

  @Post('welcome-follower')
  async welcomeNewFollower(
    @Body() body: { userId: string; username: string }
  ) {
    return await this.automationService.welcomeNewFollower(
      body.userId,
      body.username
    );
  }

  @Post('follow-up')
  async sendFollowUp(
    @Body() body: { userId: string; daysSinceContact: number }
  ) {
    return await this.automationService.sendFollowUp(
      body.userId,
      body.daysSinceContact
    );
  }

  @Post('holiday-greeting')
  async sendHolidayGreeting(
    @Body() body: { userId: string; holiday: string }
  ) {
    return await this.automationService.sendHolidayGreeting(
      body.userId,
      body.holiday
    );
  }

  @Post('promotional-message')
  async sendPromotionalMessage(
    @Body() body: { userId: string; promotion: string }
  ) {
    return await this.automationService.sendPromotionalMessage(
      body.userId,
      body.promotion
    );
  }

  @Post('customer-service')
  async handleCustomerService(
    @Body() body: { message: string; userId: string }
  ) {
    return await this.automationService.handleCustomerService(
      body.message,
      body.userId
    );
  }

  @Post('engage-user')
  async engageWithUser(
    @Body() body: { userId: string; userActivity: string }
  ) {
    return await this.automationService.engageWithUser(
      body.userId,
      body.userActivity
    );
  }

  @Get('messages')
  async getDirectMessages(@Query('limit') limit?: number) {
    // Note: This endpoint now returns conversations instead of direct messages
    // due to Instagram API limitations. Use /conversations for the same data.
    return await this.instagramService.getDirectMessages(limit);
  }

  @Get('profile')
  async getProfileInfo() {
    return await this.instagramService.getProfileInfo();
  }

  @Get('comments')
  async getRecentComments(@Query('limit') limit?: number) {
    return await this.instagramService.getComments(limit);
  }

  @Post('comments/:commentId/reply')
  async replyToComment(
    @Param('commentId') commentId: string,
    @Body() body: { message: string }
  ) {
    return await this.instagramService.replyToComment(commentId, body.message);
  }

  @Get('insights')
  async getInsights(@Query('metric') metric: string = 'impressions') {
    return await this.instagramService.getUserInsights(metric);
  }

  @Get('conversations')
  async getConversations(@Query('limit') limit?: number) {
    return await this.instagramService.getConversations(limit);
  }

  @Get('available-user-ids')
  async getAvailableUserIds() {
    return await this.instagramService.getAvailableUserIds();
  }

  @Get('available-metrics')
  async getAvailableMetrics() {
    return await this.instagramService.getAvailableMetrics();
  }

  @Get('search-users')
  async searchUsers(@Query('query') query: string) {
    return await this.instagramService.searchUsers(query);
  }

  @Get('users/:userId')
  async getUserById(@Param('userId') userId: string) {
    return await this.instagramService.getUserById(userId);
  }
}
