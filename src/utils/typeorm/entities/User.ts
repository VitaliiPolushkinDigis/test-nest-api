import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './Message';
import { Profile } from './Profile';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    description: 'id',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'firstName',
    example: 'firstName',
  })
  @Column()
  firstName: string;

  @ApiProperty({
    description: 'lastName',
    example: 'lastName',
  })
  @Column()
  lastName: string;

  @ApiProperty({
    description: 'email',
    example: 'email',
  })
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Message, (message) => message.author)
  @JoinColumn()
  messages: Message[];

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true /*  ['insert', 'remove', 'update'], */,
  })
  @JoinColumn()
  profile: Profile;

  @Column()
  profileId: number;
}
