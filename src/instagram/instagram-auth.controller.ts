import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { InstagramAuthService } from './instagram-auth.service';

@Controller('instagram/auth')
export class InstagramAuthController {
  constructor(private readonly authService: InstagramAuthService) {}

  // Instagram OAuth login initiation
  @Get('login')
  async initiateLogin(@Res() res: Response) {
    try {
      const authUrl = await this.authService.getInstagramAuthUrl();
      return res.redirect(authUrl);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to initiate Instagram login',
        message: error.message,
      });
    }
  }

  // Instagram OAuth callback (redirect URL)
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_reason') errorReason: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    try {
      // Log all query parameters for debugging
      console.log('Instagram callback received:');
      console.log('Code:', code);
      console.log('State:', state);
      console.log('Error:', error);
      console.log('Error Reason:', errorReason);
      console.log('Error Description:', errorDescription);
      
      // Check for OAuth errors
      if (error) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Instagram OAuth error',
          error_type: error,
          reason: errorReason,
          description: errorDescription,
        });
      }

      if (!code) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Authorization code is required',
          received_params: { code, state, error, errorReason, errorDescription },
        });
      }

      // Exchange code for access token
      const tokenData = await this.authService.exchangeCodeForToken(code);
      
      // Store the token (you might want to save this to database)
      console.log('Instagram access token received:', tokenData.access_token);
      
      // Redirect to success page or return token
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Instagram login successful!',
        access_token: tokenData.access_token,
        user_id: tokenData.user_id,
        expires_in: tokenData.expires_in,
        note: 'Save this access token in your environment variables as INSTAGRAM_ACCESS_TOKEN',
      });

    } catch (error) {
      console.error('Instagram auth callback error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to complete Instagram login',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  // Get current Instagram user info
  @Get('me')
  async getCurrentUser(@Res() res: Response) {
    try {
      const userInfo = await this.authService.getCurrentUser();
      return res.status(HttpStatus.OK).json(userInfo);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to get user info',
        message: error.message,
      });
    }
  }
}
