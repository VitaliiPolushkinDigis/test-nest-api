import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstagramProfile } from '../utils/typeorm/entities/InstagramProfile';
import { User } from '../utils/typeorm/entities/User';

@Injectable()
export class InstagramProfileService {
  private readonly logger = new Logger(InstagramProfileService.name);

  constructor(
    @InjectRepository(InstagramProfile)
    private instagramProfileRepository: Repository<InstagramProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createOrUpdateProfile(profileData: {
    userId: number;
    instagramUserId: string;
    accessToken: string;
    refreshToken?: string;
    permissions: string[];
    tokenExpiresAt?: Date;
  }): Promise<InstagramProfile> {
    try {
      // Check if profile already exists
      let profile = await this.instagramProfileRepository.findOne({
        where: { instagramUserId: profileData.instagramUserId },
      });

      if (profile) {
        // Update existing profile
        profile.accessToken = profileData.accessToken;
        profile.refreshToken = profileData.refreshToken;
        profile.permissions = profileData.permissions;
        profile.tokenExpiresAt = profileData.tokenExpiresAt;
        profile.isActive = true;
        profile.updatedAt = new Date();
        
        this.logger.log(`Updating existing Instagram profile for user ${profileData.userId}`);
      } else {
        // Create new profile
        profile = this.instagramProfileRepository.create({
          userId: profileData.userId,
          instagramUserId: profileData.instagramUserId,
          accessToken: profileData.accessToken,
          refreshToken: profileData.refreshToken,
          permissions: profileData.permissions,
          tokenExpiresAt: profileData.tokenExpiresAt,
          isActive: true,
        });
        
        this.logger.log(`Creating new Instagram profile for user ${profileData.userId}`);
      }

      // Save profile
      const savedProfile = await this.instagramProfileRepository.save(profile);
      this.logger.log(`Instagram profile saved successfully for user ${profileData.userId}`);
      
      return savedProfile;
    } catch (error) {
      this.logger.error(`Failed to create/update Instagram profile: ${error.message}`);
      throw error;
    }
  }

  async getProfileByUserId(userId: number): Promise<InstagramProfile | null> {
    try {
      return await this.instagramProfileRepository.findOne({
        where: { userId, isActive: true },
      });
    } catch (error) {
      this.logger.error(`Failed to get Instagram profile for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async getProfileByInstagramUserId(instagramUserId: string): Promise<InstagramProfile | null> {
    try {
      return await this.instagramProfileRepository.findOne({
        where: { instagramUserId, isActive: true },
      });
    } catch (error) {
      this.logger.error(`Failed to get Instagram profile for Instagram user ${instagramUserId}: ${error.message}`);
      throw error;
    }
  }

  async getAllProfiles(): Promise<InstagramProfile[]> {
    try {
      return await this.instagramProfileRepository.find({
        where: { isActive: true },
        relations: ['user'],
      });
    } catch (error) {
      this.logger.error(`Failed to get all Instagram profiles: ${error.message}`);
      throw error;
    }
  }

  async updateProfileInfo(
    instagramUserId: string,
    profileInfo: {
      instagramUsername?: string;
      profilePictureUrl?: string;
      followerCount?: number;
      followingCount?: number;
      mediaCount?: number;
      accountType?: string;
    }
  ): Promise<InstagramProfile | null> {
    try {
      const profile = await this.getProfileByInstagramUserId(instagramUserId);
      if (!profile) {
        return null;
      }

      // Update profile info
      Object.assign(profile, profileInfo);
      profile.updatedAt = new Date();

      const updatedProfile = await this.instagramProfileRepository.save(profile);
      this.logger.log(`Instagram profile info updated for ${instagramUserId}`);
      
      return updatedProfile;
    } catch (error) {
      this.logger.error(`Failed to update Instagram profile info: ${error.message}`);
      throw error;
    }
  }

  async deactivateProfile(instagramUserId: string): Promise<boolean> {
    try {
      const result = await this.instagramProfileRepository.update(
        { instagramUserId },
        { isActive: false, updatedAt: new Date() }
      );
      
      if (result.affected > 0) {
        this.logger.log(`Instagram profile deactivated for ${instagramUserId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to deactivate Instagram profile: ${error.message}`);
      throw error;
    }
  }

  async deleteProfile(instagramUserId: string): Promise<boolean> {
    try {
      const result = await this.instagramProfileRepository.delete({ instagramUserId });
      
      if (result.affected > 0) {
        this.logger.log(`Instagram profile deleted for ${instagramUserId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Failed to delete Instagram profile: ${error.message}`);
      throw error;
    }
  }
}
