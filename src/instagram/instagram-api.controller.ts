import { Controller, Get, Post, Put, Delete, Param, Body, Res, HttpStatus, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { InstagramProfileService } from './instagram-profile.service';
import { InstagramService } from './instagram.service';

@Controller('api/instagram')
export class InstagramApiController {
  constructor(
    private readonly profileService: InstagramProfileService,
    private readonly instagramService: InstagramService,
  ) {}

  // Get all Instagram profiles
  @Get('profiles')
  async getAllProfiles(@Res() res: Response) {
    try {
      const profiles = await this.profileService.getAllProfiles();
      return res.status(HttpStatus.OK).json({
        success: true,
        profiles: profiles.map(profile => ({
          id: profile.id,
          instagramUserId: profile.instagramUserId,
          instagramUsername: profile.instagramUsername,
          isActive: profile.isActive,
          permissions: profile.permissions,
          followerCount: profile.followerCount,
          followingCount: profile.followingCount,
          mediaCount: profile.mediaCount,
          accountType: profile.accountType,
          createdAt: profile.createdAt,
        })),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to fetch Instagram profiles',
        message: error.message,
      });
    }
  }

  // Get Instagram profile by user ID
  @Get('profiles/user/:userId')
  async getProfileByUserId(@Param('userId') userId: number, @Res() res: Response) {
    try {
      const profile = await this.profileService.getProfileByUserId(userId);
      if (!profile) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Instagram profile not found',
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        profile: {
          id: profile.id,
          instagramUserId: profile.instagramUserId,
          instagramUsername: profile.instagramUsername,
          isActive: profile.isActive,
          permissions: profile.permissions,
          followerCount: profile.followerCount,
          followingCount: profile.followingCount,
          mediaCount: profile.mediaCount,
          accountType: profile.accountType,
          createdAt: profile.createdAt,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to fetch Instagram profile',
        message: error.message,
      });
    }
  }

  // Get Instagram profile info (posts, followers, etc.)
  @Get('profiles/:profileId/info')
  async getProfileInfo(@Param('profileId') profileId: number, @Res() res: Response) {
    try {
      const profile = await this.profileService.getProfileByUserId(profileId);
      if (!profile) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Instagram profile not found',
        });
      }

      // Get profile info from Instagram API
      const profileInfo = await this.instagramService.getProfileInfo(
        profile.accessToken
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        profileInfo,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to fetch Instagram profile info',
        message: error.message,
      });
    }
  }

  // Get recent posts
  @Get('profiles/:profileId/posts')
  async getRecentPosts(@Param('profileId') profileId: number, @Res() res: Response) {
    try {
      const profile = await this.profileService.getProfileByUserId(profileId);
      if (!profile) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Instagram profile not found',
        });
      }

      // Get recent posts from Instagram API - using getProfileInfo for now
      const posts = await this.instagramService.getProfileInfo(
        profile.accessToken
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        posts: [posts], // Wrap in array for consistency
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to fetch recent posts',
        message: error.message,
      });
    }
  }

  // Send direct message
  @Post('profiles/:profileId/send-dm')
  async sendDirectMessage(
    @Param('profileId') profileId: number,
    @Body() dmData: { recipientId: string; message: string },
    @Res() res: Response,
  ) {
    try {
      const profile = await this.profileService.getProfileByUserId(profileId);
      if (!profile) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Instagram profile not found',
        });
      }

      // Check if profile has DM permissions
      if (!profile.permissions.includes('instagram_business_manage_messages')) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: 'Profile does not have permission to send DMs',
        });
      }

      // Send DM using Instagram API - using sendDirectMessage with correct parameters
      const result = await this.instagramService.sendDirectMessage(
        dmData.recipientId,
        dmData.message,
        profile.instagramUserId, // Use instagramUserId as facebookPageId
        profile.accessToken
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Direct message sent successfully',
        result,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to send direct message',
        message: error.message,
      });
    }
  }

  // Get conversations
  @Get('profiles/:profileId/conversations')
  async getConversations(@Param('profileId') profileId: number, @Res() res: Response) {
    try {
      const profile = await this.profileService.getProfileByUserId(profileId);
      if (!profile) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Instagram profile not found',
        });
      }

      // Get conversations from Instagram API - using getDirectMessages
      const conversations = await this.instagramService.getDirectMessages(
        10, // limit
        profile.instagramUserId, // facebookPageId
        profile.accessToken // facebookAccessToken
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to fetch conversations',
        message: error.message,
      });
    }
  }

  // Deactivate profile
  @Put('profiles/:profileId/deactivate')
  async deactivateProfile(@Param('profileId') profileId: number, @Res() res: Response) {
    try {
      const profile = await this.profileService.getProfileByUserId(profileId);
      if (!profile) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Instagram profile not found',
        });
      }

      const success = await this.profileService.deactivateProfile(profile.instagramUserId);
      if (success) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'Instagram profile deactivated successfully',
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Failed to deactivate profile',
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to deactivate profile',
        message: error.message,
      });
    }
  }

  // Delete profile
  @Delete('profiles/:profileId')
  async deleteProfile(@Param('profileId') profileId: number, @Res() res: Response) {
    try {
      const profile = await this.profileService.getProfileByUserId(profileId);
      if (!profile) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Instagram profile not found',
        });
      }

      const success = await this.profileService.deleteProfile(profile.instagramUserId);
      if (success) {
        return res.status(HttpStatus.OK).json({
          success: true,
          message: 'Instagram profile deleted successfully',
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: 'Failed to delete profile',
        });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete profile',
        message: error.message,
      });
    }
  }
}
