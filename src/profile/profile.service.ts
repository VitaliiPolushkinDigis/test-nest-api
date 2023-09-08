import { IProfileService } from './profile';
import { Profile } from './../utils/typeorm/entities/Profile';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService implements IProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}
  async createProfile(createProfileDto: CreateProfileDto): Promise<Profile> {
    const newProfile = this.profileRepository.create();
    return this.profileRepository.save(newProfile);
  }

  findAll() {
    return this.profileRepository.find({
      relations: ['user'],
    });
  }

  findOne(id: number) {
    return this.profileRepository.findOne(id);
  }

  async update(id: number, updateProfileDto: UpdateProfileDto) {
    const profile = this.profileRepository.findOne({ id });
    if (!profile) {
      throw new HttpException('No profile with given id', HttpStatus.NOT_FOUND);
    }

    return this.profileRepository.save({ id, ...updateProfileDto });
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
