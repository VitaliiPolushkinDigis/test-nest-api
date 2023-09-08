import { User } from './User';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column()
  content: string;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  author: User;

  @TreeParent()
  parent: Comment | null;

  @TreeChildren()
  children: Comment[];
}
