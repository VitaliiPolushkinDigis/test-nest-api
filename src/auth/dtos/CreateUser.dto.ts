import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'email',
    example: 'test@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'password',
    example: 'password',
  })
  @IsNotEmpty()
  @MaxLength(32)
  password: string;

  @ApiProperty({
    description: 'firstName',
    example: 'firstName',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(32)
  firstName: string;

  @ApiPropertyOptional({
    description: 'sex?',
    example: 'male | female',
    required: false,
  })
  sex?: 'male' | 'female';

  @ApiProperty({
    description: 'lastName',
    example: 'lastName',
  })
  @IsNotEmpty()
  @MaxLength(32)
  lastName: string;
}
