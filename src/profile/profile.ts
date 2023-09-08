import { Profile } from './../utils/typeorm/entities/Profile';
import { CreateProfileDto } from './dto/create-profile.dto';
export interface IProfileService {
  createProfile: (createProfileDto: CreateProfileDto) => Promise<Profile>;
}
