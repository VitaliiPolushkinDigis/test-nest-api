import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  city?: string;
  country?: string;
  birthDay?: string;
  sex?: 'male' | 'female';
  status?: string;
  avatarUrl?: string;
}
