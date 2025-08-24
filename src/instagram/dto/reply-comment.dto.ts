import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyCommentDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
