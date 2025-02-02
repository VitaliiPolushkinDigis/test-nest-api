import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { User } from '../utils/typeorm';
import {
  CreateUserDetails,
  FindUserParams,
  FindUserQuery,
  UpdateUserDetails,
  UserParams,
} from './../utils/types';
export interface IUserService {
  createUser(
    userDetails: CreateUserDetails,
    profileDetails?: CreateProfileDto,
  ): Promise<User>;
  findUser(findUserParams: FindUserParams): Promise<User>;
  findUsers(
    currentUserId: number,
    findUsersParams: UserParams,
    query?: FindUserQuery,
  ): Promise<User[]>;
  findUsersWithConversationsBadge(userId: number): Promise<User[]>;
  saveUser(user: User): Promise<User>;
  searchUsers(search?: string): Promise<User[]>;
  updateUser(userDetails: UpdateUserDetails): Promise<User>;
}
