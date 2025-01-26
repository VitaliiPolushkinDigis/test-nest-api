import { IsEnum, IsOptional } from 'class-validator';
import { FriendshipStatus } from '../../utils/typeorm/entities/Friendship';

export class UpdateFriendDto {
  @IsOptional()
  @IsEnum(FriendshipStatus)
  status?: FriendshipStatus;
}
