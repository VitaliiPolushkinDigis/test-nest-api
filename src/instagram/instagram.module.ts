import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InstagramAutomationService } from './instagram-automation.service';
import { InstagramWebhookController } from './instagram-webhook.controller';
import { InstagramWebhookService } from './instagram-webhook.service';
import { InstagramAuthController } from './instagram-auth.controller';
import { InstagramAuthService } from './instagram-auth.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [
    InstagramController, 
    InstagramWebhookController, 
    InstagramAuthController
  ],
  providers: [
    InstagramService, 
    InstagramAutomationService, 
    InstagramWebhookService,
    InstagramAuthService
  ],
  exports: [
    InstagramService, 
    InstagramAutomationService, 
    InstagramWebhookService,
    InstagramAuthService
  ],
})
export class InstagramModule {}
