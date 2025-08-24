import { Controller, Get, Query, Res, HttpStatus, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { InstagramAuthService } from './instagram-auth.service';
import { InstagramProfileService } from './instagram-profile.service';

@Controller('instagram/auth')
export class InstagramAuthController {
  constructor(
    private readonly authService: InstagramAuthService,
    private readonly profileService: InstagramProfileService,
  ) {}

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
    @Req() req: Request,
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
      
      // Get user ID from session or request (you'll need to implement this based on your auth system)
      // For now, we'll use a default user ID or get it from the state parameter
      const userId = this.getUserIdFromRequest(req, state);
      
      // Save the profile to database
      const profile = await this.profileService.createOrUpdateProfile({
        userId,
        instagramUserId: tokenData.user_id.toString(),
        accessToken: tokenData.access_token,
        permissions: tokenData.permissions || [],
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
      });

      // Get Instagram profile info and update the database
      try {
        const profileInfo = await this.authService.getCurrentUserWithToken(tokenData.access_token);
        await this.profileService.updateProfileInfo(profile.instagramUserId, {
          instagramUsername: profileInfo.username,
          profilePictureUrl: profileInfo.profile_picture_url,
          followerCount: profileInfo.followers_count,
          followingCount: profileInfo.follows_count,
          mediaCount: profileInfo.media_count,
          accountType: profileInfo.account_type,
        });
      } catch (profileError) {
        console.log('Could not fetch profile info, but profile was saved:', profileError.message);
      }
      
      console.log('Instagram profile saved to database:', profile.id);
      
      // Return success response
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'Instagram login successful!',
        profile: {
          id: profile.id,
          instagramUserId: profile.instagramUserId,
          instagramUsername: profile.instagramUsername,
          isActive: profile.isActive,
          permissions: profile.permissions,
        },
        access_token: tokenData.access_token,
        user_id: tokenData.user_id,
        expires_in: tokenData.expires_in,
        note: 'Profile has been saved to database. You can now use Instagram features.',
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

  // Helper method to get user ID from request
  private getUserIdFromRequest(req: Request, state: string): number {
    // Try to get user ID from session
    if (req.session && (req.session as any).userId) {
      return (req.session as any).userId;
    }
    
    // Try to get user ID from state parameter (if you pass it during OAuth)
    if (state && state.includes('user_')) {
      const userIdMatch = state.match(/user_(\d+)/);
      if (userIdMatch) {
        return parseInt(userIdMatch[1]);
      }
    }
    
    // For now, return a default user ID (you should implement proper user authentication)
    // In production, you should get this from the authenticated session
    return 1; // Default user ID
  }
}
