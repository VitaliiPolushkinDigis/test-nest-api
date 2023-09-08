import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './Post';
import { User } from './User';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  birthDay: string;

  @Column({ nullable: true })
  sex: 'male' | 'female';

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @OneToMany(() => Post, (post) => post.profile, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  posts: Post[];
}
