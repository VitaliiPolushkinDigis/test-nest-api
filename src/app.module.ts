import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { GatewayModule } from './gateway/gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import entities from './utils/typeorm';
import { ProfileModule } from './profile/profile.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { StripeModule } from './stripe/stripe.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env.development' }),
    AuthModule,
    UsersModule,
    PassportModule.register({ session: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: /* 'database-1.c4ffj2rebimq.eu-central-1.rds.amazonaws.com' */ process
        .env.PGHOST,
      /* 'localhost' */ /* 'database-1.chwzotdkgmwi.eu-central-1.rds.amazonaws.com' */ port: 5432,
      username: process.env.PGUSER /* 'postgres' */,
      password:
        process.env.PGPASSWORD /* '12345678' */ /* 123 */ /* '12345678' */,
      database: process.env.PGDATABASE /* 'chat' */,
      entities,
      synchronize: true,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    ConversationsModule,
    MessagesModule,
    GatewayModule,
    ProfileModule,
    PostsModule,
    CommentsModule,
    StripeModule,
    EventEmitterModule.forRoot(),
    FriendsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
