import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  messageId: number;
}
