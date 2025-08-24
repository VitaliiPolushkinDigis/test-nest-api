import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramAutomationService } from './instagram-automation.service';
import { InstagramProfileService } from './instagram-profile.service';
import { JwtAuthGuard } from '../auth/utils/Guards';

@Controller('instagram')
@UseGuards(JwtAuthGuard)
export class InstagramController {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly instagramAutomationService: InstagramAutomationService,
    private readonly instagramProfileService: InstagramProfileService,
  ) {}

  @Post('send-dm')
  async sendDirectMessage(
    @Body() body: { recipientId: string; message: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.sendDirectMessage(
      body.recipientId || '708149675552701', // Use valid user ID (8teenyo) instead of conversation ID
      body.message || 'Hello! This is a test message from your Instagram automation.',
      profile.instagramUserId, // Use instagramUserId instead of facebookPageId
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }

  @Get('messages')
  async getDirectMessages(
    @Query('limit') limit: number = 10,
    @Query('profileId') profileId: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.getDirectMessages(
      limit,
      profile.instagramUserId, // Use instagramUserId instead of facebookPageId
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }

  @Get('profile')
  async getProfileInfo(
    @Query('profileId') profileId: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.getProfileInfo(profile.accessToken);
  }

  @Get('comments')
  async getRecentComments(
    @Query('limit') limit: number = 10,
    @Query('profileId') profileId: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.getRecentComments(limit, profile.accessToken);
  }

  @Post('reply-comment')
  async replyToComment(
    @Body() body: { commentId: string; message: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.replyToComment(
      body.commentId,
      body.message,
      profile.accessToken,
    );
  }

  @Get('insights')
  async getUserInsights(
    @Query('metric') metric: string,
    @Query('period') period: string = 'day',
    @Query('profileId') profileId: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.getUserInsights(metric, period, profile.accessToken);
  }

  @Get('search-users')
  async searchUsers(
    @Query('query') query: string,
    @Query('profileId') profileId: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.searchUsers(query, profile.accessToken);
  }

  @Get('user/:id')
  async getUserById(
    @Query('id') id: string,
    @Query('profileId') profileId: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.getUserById(id, profile.accessToken);
  }

  @Get('available-user-ids')
  async getAvailableUserIds(
    @Query('profileId') profileId: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.getAvailableUserIds(profile.accessToken);
  }

  @Get('conversations')
  async getConversations(
    @Query('limit') limit: number = 10,
    @Query('profileId') profileId: number,
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramService.getConversations(limit, profile.instagramUserId, profile.accessToken);
  }

  // Profile management endpoints
  @Get('profiles')
  async getUserProfiles(@Request() req) {
    const userId = req.user.id;
    return await this.instagramProfileService.getProfileByUserId(userId);
  }

  @Post('profiles')
  async createProfile(
    @Body() profileData: {
      instagramBusinessAccountId: string;
      username: string;
      facebookPageId: string;
      facebookAccessToken: string;
      instagramAccessToken?: string;
    },
    @Request() req,
  ) {
    const userId = req.user.id;
    // Use the new method signature
    return await this.instagramProfileService.createOrUpdateProfile({
      userId,
      instagramUserId: profileData.instagramBusinessAccountId,
      accessToken: profileData.facebookAccessToken,
      permissions: [],
    });
  }

  @Post('profiles/:id/refresh-token')
  async refreshToken(
    @Query('id') profileId: number,
    @Body() body: { newToken: string },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    // Update the profile with new token
    await this.instagramProfileService.createOrUpdateProfile({
      userId,
      instagramUserId: profile.instagramUserId,
      accessToken: body.newToken,
      permissions: profile.permissions,
    });
    
    return { success: true, message: 'Token refreshed successfully' };
  }

  // Automation endpoints
  @Post('automation/auto-reply')
  async handleAutoReply(
    @Body() body: { commentId: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramAutomationService.handleAutoReply(
      body.commentId,
      profile.accessToken,
      profile.instagramUserId,
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }

  @Post('automation/welcome-follower')
  async welcomeNewFollower(
    @Body() body: { userId: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramAutomationService.welcomeNewFollower(
      body.userId,
      'user', // username placeholder
      profile.instagramUserId,
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }

  @Post('automation/follow-up')
  async sendFollowUp(
    @Body() body: { userId: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramAutomationService.sendFollowUp(
      body.userId,
      1, // daysSinceContact placeholder
      profile.instagramUserId,
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }

  @Post('automation/holiday-greeting')
  async sendHolidayGreeting(
    @Body() body: { userId: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramAutomationService.sendHolidayGreeting(
      body.userId,
      'christmas', // holiday placeholder
      profile.instagramUserId,
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }

  @Post('automation/promotional-message')
  async sendPromotionalMessage(
    @Body() body: { userId: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramAutomationService.sendPromotionalMessage(
      body.userId,
      'special offer', // promotion placeholder
      profile.instagramUserId,
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }

  @Post('automation/customer-service')
  async handleCustomerService(
    @Body() body: { message: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramAutomationService.handleCustomerService(
      body.message,
      'user', // userId placeholder
      profile.instagramUserId,
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }

  @Post('automation/engage-user')
  async engageWithUser(
    @Body() body: { userId: string; profileId: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    const profile = await this.instagramProfileService.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Instagram profile not found for user');
    }
    
    return await this.instagramAutomationService.engageWithUser(
      body.userId,
      'recent_activity', // userActivity placeholder
      profile.instagramUserId,
      profile.accessToken, // Use accessToken instead of facebookAccessToken
    );
  }
}
