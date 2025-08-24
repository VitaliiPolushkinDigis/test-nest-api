import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { InstagramAutomationService } from './instagram-automation.service';
import { InstagramWebhookController } from './instagram-webhook.controller';
import { InstagramWebhookService } from './instagram-webhook.service';
import { InstagramAuthController } from './instagram-auth.controller';
import { InstagramAuthService } from './instagram-auth.service';
import { InstagramProfileService } from './instagram-profile.service';
import { InstagramApiController } from './instagram-api.controller';
import { InstagramProfile } from '../utils/typeorm/entities/InstagramProfile';
import { User } from '../utils/typeorm/entities/User';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([InstagramProfile, User]),
  ],
  controllers: [
    InstagramController,
    InstagramWebhookController,
    InstagramAuthController,
    InstagramApiController,
  ],
  providers: [
    InstagramService,
    InstagramAutomationService,
    InstagramWebhookService,
    InstagramAuthService,
    InstagramProfileService,
  ],
  exports: [
    InstagramService,
    InstagramAutomationService,
    InstagramProfileService,
  ],
})
export class InstagramModule {}
