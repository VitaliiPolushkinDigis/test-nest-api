import { Profile } from './../utils/typeorm/entities/Profile';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation, User } from '../utils/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';
import { hashPassword } from './../utils/helpers';
import {
  CreateUserDetails,
  FindUserParams,
  UpdateUserDetails,
  UserParams,
} from './../utils/types';
import { IUserService } from './user';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}
  async createUser(userDetails: CreateUserDetails) {
    const existingUser = await this.userRepository.findOne({
      email: userDetails.email,
    });
    if (existingUser) {
      throw new HttpException('User alreate exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = await hashPassword(userDetails.password);

    const newProfile = this.profileRepository.create({
      avatarUrl: userDetails.sex
        ? userDetails?.sex === 'male'
          ? 'https://i.pinimg.com/564x/15/e7/7e/15e77e7a76cbf41f029acf220059ce26.jpg'
          : 'https://i.pinimg.com/564x/2b/5f/61/2b5f611332511552e3b05ec73887f105.jpg'
        : undefined,
    });

    const newUser = this.userRepository.create({
      ...userDetails,
      password: hashedPassword,
      profile: newProfile,
      profileId: newProfile.id,
    });

    newProfile.id = newUser.id;

    newUser.profile = newProfile;

    console.log(newUser);

    /* newUser.profile= */

    return this.userRepository.save(newUser);
  }

  async findUser(findUserParams: FindUserParams): Promise<User> {
    return this.userRepository.findOne(findUserParams);
  }

  async findUsers(
    loggedInUserId: number,
    findUsersParams: UserParams,
  ): Promise<User[]> {
    const filters = {};

    if (Object.keys(findUsersParams).length) {
      if (findUsersParams.filters?.length)
        findUsersParams.filters.map((f) => {
          filters[f.label] = f.value;
        });
    }

    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile');

    if (findUsersParams.withoutConversationWithMe) {
      query
        .leftJoin(
          'conversations',
          'conversations',
          '(conversations.creatorId = user.id AND conversations.recipientId = :loggedInUserId) OR (conversations.recipientId = user.id AND conversations.creatorId = :loggedInUserId)',
          { loggedInUserId },
        )
        .where('conversations.id IS NULL')
        .andWhere('user.id != :loggedInUserId', { loggedInUserId });
    }

    if (Object.keys(filters).length) {
      query.andWhere(filters);
    }

    return query.getMany();
  }

  async findUsersWithConversationsBadge(userId: number): Promise<any[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile') // Ensure profile relation is selected
      .leftJoin(
        'conversations',
        'conversations',
        '(conversations.creatorId = user.id AND conversations.recipientId = :userId) OR (conversations.recipientId = user.id AND conversations.creatorId = :userId)',
        { userId },
      )
      .where('user.id != :userId', { userId }) // Exclude current user
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'profile.id', // Select profile fields here explicitly
        'profile.avatarUrl', // Example field from profile
        'conversations.id', // To determine if a conversation exists
      ])
      .addSelect(
        `CASE 
        WHEN conversations.id IS NOT NULL THEN true 
        ELSE false 
      END`,
        'hasConversation', // Add computed hasConversation field
      )
      .setParameter('userId', userId)
      .getRawMany(); // Use getRawMany to get raw result with computed field

    console.log('--------service users', users);

    // Map the raw result to include `hasConversation` as a property and profile as well
    return users.map((user) => ({
      id: user.user_id,
      firstName: user.user_firstName,
      lastName: user.user_lastName,
      email: user.user_email,
      profile: {
        id: user.profile_id,
        avatarUrl: user.profile_avatarUrl,
      }, // Include profile directly from raw result
      hasConversation: user.hasConversation === 'true', // Convert from string to boolean
    }));
  }

  async saveUser(user: User) {
    return this.userRepository.save(user);
  }

  async searchUsers(search: string): Promise<User[]> {
    return this.userRepository.find(
      search
        ? {
            firstName: ILike(`%${search}%`),
          }
        : {},
    );
  }
  async updateUser({ id, ...details }: UpdateUserDetails): Promise<User> {
    return this.userRepository
      .update({ id }, details)
      .then((res) => res.raw[0]);
  }
}
