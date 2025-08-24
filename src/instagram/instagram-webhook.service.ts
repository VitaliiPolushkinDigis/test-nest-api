import { Injectable, Logger } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Injectable()
export class InstagramWebhookService {
  private readonly logger = new Logger(InstagramWebhookService.name);

  constructor(private readonly instagramService: InstagramService) {}

  log(message: string, data?: any) {
    if (data) {
      this.logger.log(message, data);
    } else {
      this.logger.log(message);
    }
  }

  async processWebhook(webhookData: any) {
    try {
      this.logger.log('Processing webhook data:', webhookData);

      // Check if this is a messaging webhook
      if (webhookData.object === 'instagram' && webhookData.entry) {
        for (const entry of webhookData.entry) {
          if (entry.messaging) {
            for (const messagingEvent of entry.messaging) {
              await this.handleMessagingEvent(messagingEvent);
            }
          }
        }
      }

      // Check if this is a comment webhook
      if (webhookData.object === 'instagram' && webhookData.entry) {
        for (const entry of webhookData.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              await this.handleCommentChange(change);
            }
          }
        }
      }

    } catch (error) {
      this.logger.error('Error processing webhook:', error);
    }
  }

  private async handleMessagingEvent(messagingEvent: any) {
    try {
      const { sender, recipient, message, postback } = messagingEvent;

      if (message) {
        // Handle incoming message
        await this.handleIncomingMessage(sender.id, message);
      } else if (postback) {
        // Handle postback (button clicks, etc.)
        await this.handlePostback(sender.id, postback);
      }

    } catch (error) {
      this.logger.error('Error handling messaging event:', error);
    }
  }

  private async handleCommentChange(change: any) {
    try {
      if (change.field === 'comments') {
        const comment = change.value;
        await this.handleNewComment(comment);
      }
    } catch (error) {
      this.logger.error('Error handling comment change:', error);
    }
  }

  private async handleIncomingMessage(senderId: string, message: any) {
    try {
      this.logger.log(`Received message from ${senderId}: ${message.text}`);

      // Skip test/dummy data
      if (this.isTestMessageData(senderId, message)) {
        this.logger.log('Skipping test/dummy message data');
        return;
      }

      // Auto-reply logic
      if (message.text) {
        const autoReply = await this.generateAutoReply(message.text);
        if (autoReply) {
          await this.instagramService.sendDirectMessage(senderId, autoReply);
          this.logger.log(`Auto-reply sent to ${senderId}: ${autoReply}`);
        }
      }

    } catch (error) {
      this.logger.error('Error handling incoming message:', error);
    }
  }

  private async handlePostback(senderId: string, postback: any) {
    try {
      this.logger.log(`Received postback from ${senderId}: ${postback.payload}`);

      // Handle different postback types
      switch (postback.payload) {
        case 'GET_STARTED':
          await this.handleGetStarted(senderId);
          break;
        case 'HELP':
          await this.handleHelp(senderId);
          break;
        default:
          this.logger.log(`Unknown postback payload: ${postback.payload}`);
      }

    } catch (error) {
      this.logger.error('Error handling postback:', error);
    }
  }

  private async handleNewComment(comment: any) {
    try {
      this.logger.log(`New comment received: ${comment.text} from ${comment.from.username}`);

      // Skip test/dummy data - check if this looks like real data
      if (this.isTestData(comment)) {
        this.logger.log('Skipping test/dummy comment data');
        return;
      }

      // Auto-reply to comments if needed
      if (comment.text.toLowerCase().includes('hello') || comment.text.toLowerCase().includes('hi')) {
        const reply = `👋 Hello @${comment.from.username}! Thanks for your comment!`;
        await this.instagramService.replyToComment(comment.id, reply);
        this.logger.log(`Auto-reply sent to comment: ${reply}`);
      }

    } catch (error) {
      this.logger.error('Error handling new comment:', error);
    }
  }

  private isTestData(comment: any): boolean {
    // Check if this is test/dummy data from Instagram
    // Test data often has these characteristics:
    // - Username is "test" or similar
    // - Comment ID is very long and looks like test data
    // - Text is generic like "This is an example."
    
    if (!comment || !comment.from || !comment.text) {
      return true;
    }

    // Check for test username
    if (comment.from.username === 'test' || comment.from.username === 'example') {
      return true;
    }

    // Check for test comment text
    const testTexts = [
      'This is an example.',
      'Sample comment',
      'Test comment',
      'Example text'
    ];
    
    if (testTexts.some(testText => comment.text.includes(testText))) {
      return true;
    }

    // Check for test user ID patterns
    if (comment.from.id === '232323232' || comment.from.id === '123123123') {
      return true;
    }

    return false;
  }

  private async generateAutoReply(messageText: string): Promise<string | null> {
    const lowerText = messageText.toLowerCase();

    // Simple auto-reply logic
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return "👋 Hello! Thanks for reaching out. How can I help you today?";
    }

    if (lowerText.includes('help') || lowerText.includes('support')) {
      return "I'm here to help! What do you need assistance with?";
    }

    if (lowerText.includes('price') || lowerText.includes('cost')) {
      return "For pricing information, please check our website or send me a specific question!";
    }

    if (lowerText.includes('thank')) {
      return "You're welcome! 😊 Is there anything else I can help you with?";
    }

    // No auto-reply for other messages
    return null;
  }

  private async handleGetStarted(senderId: string) {
    try {
      const welcomeMessage = `🎉 Welcome! I'm your Instagram automation assistant. Here's what I can help you with:

• Answer questions about our products
• Provide support and assistance
• Help with orders and pricing
• Connect you with our team

Just send me a message and I'll help you out!`;
      
      await this.instagramService.sendDirectMessage(senderId, welcomeMessage);
      this.logger.log(`Welcome message sent to ${senderId}`);
    } catch (error) {
      this.logger.error('Error sending welcome message:', error);
    }
  }

  private async handleHelp(senderId: string) {
    try {
      const helpMessage = `🔧 Here's how I can help you:

• **Product Info**: Ask about our products and services
• **Support**: Get help with any issues
• **Pricing**: Learn about our rates and packages
• **Contact**: Get in touch with our team

What specific help do you need?`;
      
      await this.instagramService.sendDirectMessage(senderId, helpMessage);
      this.logger.log(`Help message sent to ${senderId}`);
    } catch (error) {
      this.logger.error('Error sending help message:', error);
    }
  }

  private isTestMessageData(senderId: string, message: any): boolean {
    // Check if this is test/dummy message data
    if (!message || !message.text) {
      return true;
    }

    // Check for test user ID patterns
    if (senderId === '232323232' || senderId === '123123123') {
      return true;
    }

    // Check for test message text
    const testTexts = [
      'This is an example.',
      'Sample message',
      'Test message',
      'Example text'
    ];
    
    if (testTexts.some(testText => message.text.includes(testText))) {
      return true;
    }

    return false;
  }
}
