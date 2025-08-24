import { Controller, Get, Post, Body, Query, Res, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { InstagramWebhookService } from './instagram-webhook.service';


@Controller('instagram-webhook')
export class InstagramWebhookController {
  private readonly logger = new Logger(InstagramWebhookController.name);
  
  constructor(private readonly webhookService: InstagramWebhookService) {}

  // Instagram webhook verification
  @Get()
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Webhook verification attempt:');
      this.logger.log(`Mode: ${mode}`);
      this.logger.log(`Verify Token: ${verifyToken}`);
      this.logger.log(`Challenge: ${challenge}`);
      this.logger.log(`Expected Token: ${process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN}`);
      this.logger.log(`Token Match: ${verifyToken === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN}`);
      
      if (mode === 'subscribe' && verifyToken === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
        this.logger.log('Webhook verified successfully');
        return res.status(HttpStatus.OK).send(challenge);
      } else {
        this.logger.log('Webhook verification failed');
        this.logger.log(`Mode check: ${mode === 'subscribe'}`);
        this.logger.log(`Token check: ${verifyToken === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN}`);
        return res.status(HttpStatus.FORBIDDEN).send('Forbidden');
      }
    } catch (error) {
      this.logger.error('Webhook verification error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    }
  }

  // Instagram webhook notifications
  @Post()
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    try {
      this.webhookService.log('Webhook received:', JSON.stringify(body, null, 2));
      
      // Process the webhook data
      await this.webhookService.processWebhook(body);
      
      return res.status(HttpStatus.OK).send('OK');
    } catch (error) {
      this.webhookService.log('Webhook processing error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    }
  }
}
