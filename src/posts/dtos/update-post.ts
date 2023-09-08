import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  /*  @IsNotEmpty()
  @IsString() */
  title?: string;

  @IsOptional()
  /* @IsNotEmpty()
  @IsString() */
  subtitle?: string;

  @IsOptional()
  /*   @IsNotEmpty()
  @IsString() */
  description?: string;

  /* @IsNotEmpty()
  @IsArray()
  comments: string[];

  @IsNotEmpty()
  @IsNumber()
  likes: number; */

  @IsOptional()
  /*  @IsNotEmpty()
  @IsString() */
  imgUrl?: string;
}
