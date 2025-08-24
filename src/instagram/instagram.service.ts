import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private readonly baseUrl = 'https://graph.instagram.com/v23.0'; // Changed to Instagram API
  private readonly accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  constructor(private readonly httpService: HttpService) {
    this.logger.log('Instagram Service initialized');
    this.logger.log('Access Token:', this.accessToken ? 'Present' : 'Missing');
  }

  async getProfileInfo() {
    try {
      const url = `${this.baseUrl}/me`; // Use /me instead of account ID
      const params = {
        access_token: this.accessToken,
        fields: 'id,username,media_count',
      };

      this.logger.log(`Fetching profile info from: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      this.logger.log('Profile info response:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching profile info:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendDirectMessage(recipientId: string, message: string) {
    try {
      const url = `${this.baseUrl}/me/messages`; // Use /me/messages
      const data = {
        recipient: { id: recipientId },
        message: { text: message },
        access_token: this.accessToken,
      };

      this.logger.log(`Sending DM to ${recipientId}: ${message}`);
      this.logger.log(`URL: ${url}`);
      
      const response = await firstValueFrom(
        this.httpService.post(url, data)
      );

      this.logger.log('DM sent successfully:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Error sending DM:', error.response?.data || error.message);
      throw error;
    }
  }
//TODO: use dynamic FACEBOOK_PAGE_ID not hardcoded, i need to get it from the user. I need to get access from users account to manage posts, comments, messages, and get messages from their account.
  async getDirectMessages(limit: number = 25) {
    try {
      // Instagram messages are also handled through Facebook Graph API
      // We need to use the Facebook page ID with platform=instagram parameter
      
      const facebookPageId = process.env.FACEBOOK_PAGE_ID;
      
      if (!facebookPageId) {
        // Try to get page ID from Facebook Graph API
        this.logger.log('No Facebook page ID found, attempting to fetch it...');
        try {
          const pagesUrl = 'https://graph.facebook.com/v23.0/me/accounts';
          const pagesParams = {
            access_token: process.env.FACEBOOK_ACCESS_TOKEN,
          };
          
          const pagesResponse = await firstValueFrom(
            this.httpService.get(pagesUrl, { params: pagesParams })
          );
          
          if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
            const pageId = pagesResponse.data.data[0].id;
            this.logger.log(`Found Facebook page ID: ${pageId}`);
            
            // Get conversations first, then messages
            const conversationsUrl = `https://graph.facebook.com/v23.0/${pageId}/conversations`;
            const conversationsParams = {
              access_token: process.env.FACEBOOK_ACCESS_TOKEN,
              platform: 'instagram',
              limit,
              fields: 'id,participants,updated_time,unread_count',
            };
            
            this.logger.log(`Fetching Instagram conversations for messages: ${conversationsUrl}`);
            const conversationsResponse = await firstValueFrom(
              this.httpService.get(conversationsUrl, { params: conversationsParams })
            );
            
            return {
              success: true,
              message: 'Instagram conversations retrieved successfully via Facebook Graph API',
              data: conversationsResponse.data,
              source: 'facebook_graph_api',
              note: 'To get actual messages, you need to use /conversations/{conversation-id}/messages endpoint',
              suggestion: 'Use the conversation IDs from this response to fetch individual messages'
            };
          } else {
            throw new Error('No Facebook pages found');
          }
        } catch (facebookError) {
          this.logger.error('Failed to fetch via Facebook Graph API:', facebookError.response?.data || facebookError.message);
          throw new Error('Instagram messages require Facebook Graph API access. Please set FACEBOOK_PAGE_ID or ensure FACEBOOK_ACCESS_TOKEN is valid.');
        }
      } else {
        // Use the provided Facebook page ID
        const conversationsUrl = `https://graph.facebook.com/v23.0/${facebookPageId}/conversations`;
        const conversationsParams = {
          access_token: process.env.FACEBOOK_ACCESS_TOKEN,
          platform: 'instagram',
          limit,
          fields: 'id,participants,updated_time,unread_count',
        };
        
        this.logger.log(`Fetching Instagram conversations for messages: ${conversationsUrl}`);
        const conversationsResponse = await firstValueFrom(
          this.httpService.get(conversationsUrl, { params: conversationsParams })
        );
        
        return {
          success: true,
          message: 'Instagram conversations retrieved successfully via Facebook Graph API',
          data: conversationsResponse.data,
          source: 'facebook_graph_api',
          note: 'To get actual messages, you need to use /conversations/{conversation-id}/messages endpoint',
          suggestion: 'Use the conversation IDs from this response to fetch individual messages'
        };
      }
    } catch (error) {
      this.logger.error('Error fetching Instagram messages:', error.response?.data || error.message);
      
      return {
        success: false,
        error: 'Failed to fetch Instagram messages',
        message: error.message,
        suggestion: 'Ensure FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID are set correctly',
        note: 'Instagram messages require Facebook Graph API access, not Instagram Graph API'
      };
    }
  }

  async getComments(limit: number = 25) {
    try {
      const url = `${this.baseUrl}/me/media`;
      const params = {
        access_token: this.accessToken,
        limit,
        fields: 'id,comments{id,text,from,created_time}',
      };

      this.logger.log(`Fetching comments from: ${url}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      this.logger.log('Comments response:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching comments:', error.response?.data || error.message);
      throw error;
    }
  }

  async replyToComment(commentId: string, message: string) {
    try {
      const url = `${this.baseUrl}/${commentId}/replies`;
      const data = {
        message,
        access_token: this.accessToken,
      };

      this.logger.log(`Replying to comment ${commentId}: ${message}`);
      const response = await firstValueFrom(
        this.httpService.post(url, data)
      );

      this.logger.log('Comment reply sent successfully:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Error replying to comment:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserInsights(metric: string, period: string = 'day') {
    try {
      const url = `${this.baseUrl}/me/insights`;
      const params = {
        access_token: this.accessToken,
        metric,
        period,
      };

      this.logger.log(`Fetching insights for metric: ${metric}, period: ${period}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      this.logger.log('Insights response:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchUsers(query: string) {
    try {
      // Instagram API doesn't support user search with basic permissions
      // This is a limitation of the Instagram Basic Display API
      return {
        error: 'User search is not supported with current permissions',
        message: 'Instagram API does not allow searching for users with basic permissions. You need to know the user ID to interact with them.',
        suggestion: 'Use getUserById if you have a specific user ID, or implement a different approach for user discovery.'
      };
    } catch (error) {
      this.logger.error('Error searching users:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const url = `${this.baseUrl}/${userId}`;
      const params = {
        access_token: this.accessToken,
        fields: 'id,username,media_count',
      };

      this.logger.log(`Fetching user info for ID: ${userId}`);
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      this.logger.log('User info response:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error('Error fetching user info:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAvailableUserIds() {
    try {
      // Get own profile ID
      const profile = await this.getProfileInfo();
      
      // Get followers (if available)
      const followersUrl = `${this.baseUrl}/me/followers`;
      const followersParams = {
        access_token: this.accessToken,
        fields: 'id,username',
      };

      let followers = [];
      try {
        const followersResponse = await firstValueFrom(
          this.httpService.get(followersUrl, { params: followersParams })
        );
        followers = followersResponse.data.data || [];
      } catch (error) {
        this.logger.log('Followers not accessible with current permissions');
      }

      // Get recent commenters from media
      const mediaUrl = `${this.baseUrl}/me/media`;
      const mediaParams = {
        access_token: this.accessToken,
        fields: 'comments{from{id,username}}',
        limit: 10,
      };

      let commenters = [];
      try {
        const mediaResponse = await firstValueFrom(
          this.httpService.get(mediaUrl, { params: mediaParams })
        );
        const media = mediaResponse.data.data || [];
        commenters = media
          .flatMap(item => item.comments?.data || [])
          .map(comment => comment.from)
          .filter(Boolean);
      } catch (error) {
        this.logger.log('Media comments not accessible with current permissions');
      }

      return {
        ownProfile: profile,
        followers: followers.slice(0, 5), // Limit to 5 for testing
        recentCommenters: commenters.slice(0, 5), // Limit to 5 for testing
        message: 'These are the available user IDs for testing. Use these IDs to test messaging functionality.',
        note: 'Some endpoints may not be accessible depending on your permission level and account type.'
      };
    } catch (error) {
      this.logger.error('Error getting available user IDs:', error.response?.data || error.message);
      throw error;
    }
  }

  async getConversations(limit: number = 25) {
    try {
      // Instagram conversations are handled through Facebook Graph API, not Instagram Graph API
      // We need to use the Facebook page ID with platform=instagram parameter
      
      // First, get the Facebook page ID from environment or try to fetch it
      const facebookPageId = process.env.FACEBOOK_PAGE_ID;
      
      if (!facebookPageId) {
        // Try to get page ID from Facebook Graph API
        this.logger.log('No Facebook page ID found, attempting to fetch it...');
        try {
          const pagesUrl = 'https://graph.facebook.com/v23.0/me/accounts';
          const pagesParams = {
            access_token: process.env.FACEBOOK_ACCESS_TOKEN, // Use Facebook token for this call
          };
          
          const pagesResponse = await firstValueFrom(
            this.httpService.get(pagesUrl, { params: pagesParams })
          );
          
          if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
            const pageId = pagesResponse.data.data[0].id;
            this.logger.log(`Found Facebook page ID: ${pageId}`);
            
            // Now get conversations using the Facebook page ID
            const conversationsUrl = `https://graph.facebook.com/v23.0/${pageId}/conversations`;
            const conversationsParams = {
              access_token: process.env.FACEBOOK_ACCESS_TOKEN,
              platform: 'instagram',
              limit,
              fields: 'id,participants,updated_time,unread_count',
            };
            
            this.logger.log(`Fetching Instagram conversations via Facebook API: ${conversationsUrl}`);
            const conversationsResponse = await firstValueFrom(
              this.httpService.get(conversationsUrl, { params: conversationsParams })
            );
            
            return {
              success: true,
              message: 'Instagram conversations retrieved successfully via Facebook Graph API',
              data: conversationsResponse.data,
              source: 'facebook_graph_api',
              note: 'This uses Facebook Graph API with platform=instagram parameter'
            };
          } else {
            throw new Error('No Facebook pages found');
          }
        } catch (facebookError) {
          this.logger.error('Failed to fetch via Facebook Graph API:', facebookError.response?.data || facebookError.message);
          throw new Error('Instagram conversations require Facebook Graph API access. Please set FACEBOOK_PAGE_ID or ensure FACEBOOK_ACCESS_TOKEN is valid.');
        }
      } else {
        // Use the provided Facebook page ID
        const conversationsUrl = `https://graph.facebook.com/v23.0/${facebookPageId}/conversations`;
        const conversationsParams = {
          access_token: process.env.FACEBOOK_ACCESS_TOKEN,
          platform: 'instagram',
          limit,
          fields: 'id,participants,updated_time,unread_count',
        };
        
        this.logger.log(`Fetching Instagram conversations via Facebook API: ${conversationsUrl}`);
        const conversationsResponse = await firstValueFrom(
          this.httpService.get(conversationsUrl, { params: conversationsParams })
        );
        
        return {
          success: true,
          message: 'Instagram conversations retrieved successfully via Facebook Graph API',
          data: conversationsResponse.data,
          source: 'facebook_graph_api',
          note: 'This uses Facebook Graph API with platform=instagram parameter'
        };
      }
    } catch (error) {
      this.logger.error('Error fetching Instagram conversations:', error.response?.data || error.message);
      
      // Return helpful error information
      return {
        success: false,
        error: 'Failed to fetch Instagram conversations',
        message: error.message,
        suggestion: 'Ensure FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID are set correctly',
        note: 'Instagram conversations require Facebook Graph API access, not Instagram Graph API'
      };
    }
  }

  async getAvailableMetrics() {
    try {
      const testCases = [
        { metric: 'follower_count', period: 'day' },
        { metric: 'reach', period: 'day' },
        { metric: 'website_clicks', period: 'day', metric_type: 'total_value' },
        { metric: 'profile_views', period: 'day', metric_type: 'total_value' },
        { metric: 'online_followers', period: 'day', metric_type: 'total_value' },
        { metric: 'accounts_engaged', period: 'day', metric_type: 'total_value' },
        { metric: 'total_interactions', period: 'day', metric_type: 'total_value' },
        { metric: 'likes', period: 'day', metric_type: 'total_value' },
        { metric: 'comments', period: 'day', metric_type: 'total_value' },
        { metric: 'shares', period: 'day', metric_type: 'total_value' },
        { metric: 'saves', period: 'day', metric_type: 'total_value' },
        { metric: 'replies', period: 'day', metric_type: 'total_value' },
        { metric: 'engaged_audience_demographics', period: 'day', metric_type: 'total_value' },
        { metric: 'reached_audience_demographics', period: 'day', metric_type: 'total_value' },
        { metric: 'follower_demographics', period: 'day', metric_type: 'total_value' },
        { metric: 'follows_and_unfollows', period: 'day', metric_type: 'total_value' },
        { metric: 'profile_links_taps', period: 'day', metric_type: 'total_value' },
        { metric: 'views', period: 'day', metric_type: 'total_value' },
        { metric: 'threads_likes', period: 'day', metric_type: 'total_value' },
        { metric: 'threads_replies', period: 'day', metric_type: 'total_value' },
        { metric: 'reposts', period: 'day', metric_type: 'total_value' },
        { metric: 'quotes', period: 'day', metric_type: 'total_value' },
        { metric: 'threads_followers', period: 'day', metric_type: 'total_value' },
        { metric: 'threads_follower_demographics', period: 'day', metric_type: 'total_value' },
        { metric: 'content_views', period: 'day', metric_type: 'total_value' },
        { metric: 'threads_views', period: 'day', metric_type: 'total_value' },
        { metric: 'threads_clicks', period: 'day', metric_type: 'total_value' }
      ];

      const results = [];
      const workingMetrics = [];
      const failedMetrics = [];
      const emptyMetrics = [];

      for (const testCase of testCases) {
        try {
          const params = {
            access_token: this.accessToken,
            metric: testCase.metric,
            period: testCase.period,
            ...(testCase.metric_type && { metric_type: testCase.metric_type }),
          };

          const url = `${this.baseUrl}/me/insights`;
          const response = await firstValueFrom(
            this.httpService.get(url, { params })
          );

          const data = response.data;
          const hasData = data.data && data.data.length > 0;
          const dataCount = hasData ? data.data.length : 0;

          const result = {
            metric: testCase.metric,
            period: testCase.period,
            metric_type: testCase.metric_type,
            success: true,
            hasData,
            dataCount,
            fullResponse: data,
          };

          results.push(result);

          if (hasData) {
            workingMetrics.push({
              metric: testCase.metric,
              period: testCase.period,
              dataCount,
              sampleData: data.data[0],
            });
          } else {
            emptyMetrics.push({
              metric: testCase.metric,
              period: testCase.period,
            });
          }
        } catch (error) {
          const errorCode = error.response?.data?.error?.code;
          const errorMessage = error.response?.data?.error?.message || error.message;

          failedMetrics.push({
            metric: testCase.metric,
            period: testCase.period,
            error: errorMessage,
            errorCode,
          });

          results.push({
            metric: testCase.metric,
            period: testCase.period,
            success: false,
            error: errorMessage,
            errorCode,
          });
        }
      }

      const summary = {
        total: testCases.length,
        working: workingMetrics.length,
        failed: failedMetrics.length,
        empty: emptyMetrics.length,
      };

      return {
        success: true,
        summary,
        workingMetrics,
        failedMetrics,
        emptyMetrics,
        detailedResults: results,
        message: `Found ${workingMetrics.length} working metrics out of ${testCases.length} tested`,
        recommendation: workingMetrics.length > 0 
          ? `Use these working combinations: ${workingMetrics.map(m => `${m.metric}+${m.period}`).join(', ')}`
          : 'No working metrics found. Check your permissions and account type.',
      };
    } catch (error) {
      this.logger.error('Error getting available metrics:', error.response?.data || error.message);
      throw error;
    }
  }
}
