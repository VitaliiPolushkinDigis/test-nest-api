import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  subtitle: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  /*  @IsNotEmpty()
  @IsArray()
  comments: string[]; */

  @IsNotEmpty()
  @IsNumber()
  likes: number;

  @IsNotEmpty()
  @IsString()
  imgUrl: string;
}
