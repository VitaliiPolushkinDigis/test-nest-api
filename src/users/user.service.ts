import { Profile } from './../utils/typeorm/entities/Profile';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../utils/typeorm';
import { ILike, Repository } from 'typeorm';
import { hashPassword } from './../utils/helpers';
import {
  CreateUserDetails,
  Filter,
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

  async findUsers(findUsersParams: UserParams): Promise<User[]> {
    const filters = {};

    if (Object.keys(findUsersParams).length) {
      if (findUsersParams.filters?.length)
        findUsersParams.filters.map((f) => {
          filters[f.label] = f.value;
        });
    }

    return this.userRepository.find({
      where: Object.keys(filters) ? filters : {},
    });
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
