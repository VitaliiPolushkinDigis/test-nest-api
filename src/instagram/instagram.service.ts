import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private readonly baseUrl = 'https://graph.facebook.com/v23.0';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendDirectMessage(
    recipientId: string,
    message: string,
    facebookPageId: string,
    facebookAccessToken: string,
  ) {
    this.logger.log(`Sending Instagram DM via Facebook API to ${recipientId}: ${message}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/${facebookPageId}/messages`,
          {
            recipient: { id: recipientId },
            message: { text: message },
          },
          {
            headers: {
              Authorization: `Bearer ${facebookAccessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log('Instagram DM sent successfully');
      return {
        success: true,
        message: 'Direct message sent successfully',
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error sending Instagram DM:', error.response?.data || error);
      throw error;
    }
  }

  async getDirectMessages(
    limit: number = 10,
    facebookPageId: string,
    facebookAccessToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/${facebookPageId}/conversations?platform=instagram&fields=id,participants,updated_time&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${facebookAccessToken}`,
            },
          },
        ),
      );

      return {
        success: true,
        message: 'Instagram conversations retrieved successfully via Facebook Graph API',
        data: response.data,
        source: 'facebook_graph_api',
        note: 'This uses Facebook Graph API with platform=instagram parameter',
      };
    } catch (error) {
      this.logger.error('Error fetching Instagram conversations:', error.response?.data || error);
      throw error;
    }
  }

  async getProfileInfo(instagramAccessToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/v23.0/me?fields=id,username,media_count&access_token=${instagramAccessToken}`,
        ),
      );

      return {
        success: true,
        message: 'Instagram profile retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error fetching Instagram profile:', error.response?.data || error);
      throw error;
    }
  }

  async getRecentComments(
    limit: number = 10,
    instagramAccessToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/v23.0/me/media?fields=id,comments{text,from,created_time}&limit=${limit}&access_token=${instagramAccessToken}`,
        ),
      );

      return {
        success: true,
        message: 'Recent comments retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error fetching recent comments:', error.response?.data || error);
      throw error;
    }
  }

  async replyToComment(
    commentId: string,
    message: string,
    instagramAccessToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `https://graph.instagram.com/v23.0/${commentId}/replies`,
          { message },
          {
            headers: {
              Authorization: `Bearer ${instagramAccessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return {
        success: true,
        message: 'Reply posted successfully',
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error posting reply:', error.response?.data || error);
      throw error;
    }
  }

  async getUserInsights(
    metric: string,
    period: string = 'day',
    instagramAccessToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/v23.0/me/insights?metric=${metric}&period=${period}&access_token=${instagramAccessToken}`,
        ),
      );

      return {
        success: true,
        message: `Instagram insights for ${metric} retrieved successfully`,
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error fetching Instagram insights:', error.response?.data || error);
      throw error;
    }
  }

  async searchUsers(
    query: string,
    instagramAccessToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/v23.0/me/accounts?fields=id,username&access_token=${instagramAccessToken}`,
        ),
      );

      return {
        success: true,
        message: 'Instagram accounts retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error searching Instagram users:', error.response?.data || error);
      throw error;
    }
  }

  async getUserById(
    userId: string,
    instagramAccessToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/v23.0/${userId}?fields=id,username,media_count&access_token=${instagramAccessToken}`,
        ),
      );

      return {
        success: true,
        message: 'Instagram user retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error fetching Instagram user:', error.response?.data || error);
      throw error;
    }
  }

  async getAvailableUserIds(instagramAccessToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://graph.instagram.com/v23.0/me/accounts?fields=id,username&access_token=${instagramAccessToken}`,
        ),
      );

      return {
        success: true,
        message: 'Available user IDs retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error fetching available user IDs:', error.response?.data || error);
      throw error;
    }
  }

  async getConversations(
    limit: number = 10,
    facebookPageId: string,
    facebookAccessToken: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/${facebookPageId}/conversations?platform=instagram&fields=id,participants,updated_time&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${facebookAccessToken}`,
            },
          },
        ),
      );

      return {
        success: true,
        message: 'Instagram conversations retrieved successfully via Facebook Graph API',
        data: response.data,
        source: 'facebook_graph_api',
        note: 'This uses Facebook Graph API with platform=instagram parameter',
      };
    } catch (error) {
      this.logger.error('Error fetching Instagram conversations:', error.response?.data || error);
      throw error;
    }
  }
}
