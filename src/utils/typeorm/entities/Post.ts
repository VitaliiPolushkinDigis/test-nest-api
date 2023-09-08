import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './Comment';
import { Profile } from './Profile';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  imgUrl?: string;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column()
  description: string;

  @Column()
  likes: number;

  @Column()
  views: number;

  /*  @Column('text', { array: true })
  comments: string[]; */

  @ManyToOne(() => Profile, (profile) => profile.posts)
  profile: Profile;

  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: ['insert', 'remove', 'update'],
  })
  @JoinColumn()
  comments: Comment[];
}
