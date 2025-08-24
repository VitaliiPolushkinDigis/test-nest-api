import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('instagram_profiles')
export class InstagramProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'instagram_user_id', unique: true })
  instagramUserId: string;

  @Column({ name: 'instagram_username', nullable: true })
  instagramUsername: string;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string;

  @Column({ name: 'token_expires_at', nullable: true })
  tokenExpiresAt: Date;

  @Column('simple-array', { nullable: true })
  permissions: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'profile_picture_url', nullable: true })
  profilePictureUrl: string;

  @Column({ name: 'follower_count', nullable: true })
  followerCount: number;

  @Column({ name: 'following_count', nullable: true })
  followingCount: number;

  @Column({ name: 'media_count', nullable: true })
  mediaCount: number;

  @Column({ name: 'account_type', nullable: true })
  accountType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
