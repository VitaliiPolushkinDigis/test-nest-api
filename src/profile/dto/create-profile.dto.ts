export class CreateProfileDto {
  city?: string;
  country?: string;
  birthDay?: string;
  sex?: 'male' | 'female';
  status?: string;
  avatarUrl?: string;
}
