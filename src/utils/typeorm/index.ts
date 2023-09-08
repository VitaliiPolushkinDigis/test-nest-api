import { User } from './entities/User';
import { Session } from './entities/Session';
import { Conversation } from './entities/Conversation';
import { Message } from './entities/Message';
import { Profile } from './entities/Profile';
import { Comment } from './entities/Comment';
import { Post } from './entities/Post';

const entities = [User, Session, Conversation, Message, Profile, Post, Comment];

export default entities;

export { User, Session, Conversation, Message, Profile, Post, Comment };
