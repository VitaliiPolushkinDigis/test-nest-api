import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  @IsNumber()
  addresseeId: number;
}
