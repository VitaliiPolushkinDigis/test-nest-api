import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InstagramAuthService {
  private readonly logger = new Logger(InstagramAuthService.name);
  private readonly clientId = process.env.INSTAGRAM_CLIENT_ID;
  private readonly clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  private readonly redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  private readonly instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  constructor(private readonly httpService: HttpService) {
    this.logger.log('Instagram Auth Service initialized');
    this.logger.log('Client ID:', this.clientId ? 'Present' : 'Missing');
    this.logger.log('Client Secret:', this.clientSecret ? 'Present' : 'Missing');
    this.logger.log('Redirect URI:', this.redirectUri || 'Not set');
  }

  async getInstagramAuthUrl(): Promise<string> {
    if (!this.clientId || !this.redirectUri) {
      throw new Error('Instagram Client ID and Redirect URI must be configured');
    }

    // Use the exact scopes that Instagram expects
    const scopes = [
      'instagram_business_basic',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments',
      'instagram_business_content_publish',
      'instagram_business_manage_insights',
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(','),
      response_type: 'code',
      state: this.generateRandomState(),
    });

    const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
    this.logger.log('Generated Instagram auth URL:', authUrl);
    
    return authUrl;
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Instagram Client ID, Secret, and Redirect URI must be configured');
    }
console.log('-------------------yeah');

    try {
      const data = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code: code,
      };

      this.logger.log('Exchanging code for token...');
      
      const response = await firstValueFrom(
        this.httpService.post('https://api.instagram.com/oauth/access_token', data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      this.logger.log('Token exchange successful');
      this.logger.log('Response:', response.data);

      return {
        access_token: response.data.access_token,
        user_id: response.data.user_id,
        expires_in: response.data.expires_in || 0,
      };
    } catch (error) {
      this.logger.error('Token exchange failed:', error.response?.data || error.message);
      throw new Error(`Failed to exchange code for token: ${error.response?.data?.error_message || error.message}`);
    }
  }

  async getCurrentUser(): Promise<any> {
    if (!this.instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    try {
      const url = 'https://graph.instagram.com/me';
      const params = {
        access_token: this.instagramAccessToken,
        fields: 'id,username,account_type,media_count',
      };

      this.logger.log('Fetching current user info...');
      
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      this.logger.log('User info fetched successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get user info:', error.response?.data || error.message);
      throw new Error(`Failed to get user info: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async refreshAccessToken(): Promise<any> {
    if (!this.instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    try {
      const url = 'https://graph.instagram.com/refresh_access_token';
      const params = {
        grant_type: 'fb_exchange_token',
        fb_exchange_token: this.instagramAccessToken,
      };

      this.logger.log('Refreshing access token...');
      
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      this.logger.log('Token refresh successful');
      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error.response?.data || error.message);
      throw new Error(`Failed to refresh token: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Helper method to validate Instagram access token
  async validateAccessToken(token: string): Promise<boolean> {
    try {
      const url = 'https://graph.instagram.com/me';
      const params = {
        access_token: token,
        fields: 'id',
      };

      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );

      return !!response.data.id;
    } catch (error) {
      this.logger.error('Token validation failed:', error.response?.data || error.message);
      return false;
    }
  }
}
