import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendDirectMessageDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  template?: string;
}
