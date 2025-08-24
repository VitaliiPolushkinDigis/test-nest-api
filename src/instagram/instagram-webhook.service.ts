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
        await this.handleMessageEvent(message);
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
        await this.handleCommentEvent(comment);
      }
    } catch (error) {
      this.logger.error('Error handling comment change:', error);
    }
  }

  private async handleMessageEvent(messageData: any) {
    try {
      const senderId = messageData.sender?.id;
      const messageText = messageData.message?.text;
      
      if (!senderId || !messageText) {
        this.logger.log('Missing sender ID or message text, skipping auto-reply');
        return;
      }

      this.logger.log(`Processing message from ${senderId}: ${messageText}`);

      // Auto-reply logic based on message content
      let autoReply = '';
      const lowerMessage = messageText.toLowerCase();

      if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        autoReply = "👋 Hello! Thanks for reaching out. How can I help you today?";
      } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        autoReply = "🆘 I'm here to help! What do you need assistance with?";
      } else if (lowerMessage.includes('product') || lowerMessage.includes('price')) {
        autoReply = "💰 Thanks for your interest! I'll have our team get back to you with pricing details within 24 hours.";
      } else if (lowerMessage.includes('hours') || lowerMessage.includes('open')) {
        autoReply = "🕒 We're open Monday-Friday 9 AM - 6 PM EST. Feel free to reach out anytime!";
      } else {
        autoReply = "Thanks for your message! I'll get back to you as soon as possible. 😊";
      }

      // Send auto-reply using the automation service
      // Note: We need to get the profile info to get facebookPageId and facebookAccessToken
      // For now, we'll log that we need to implement profile lookup
      this.logger.log(`Would send auto-reply to ${senderId}: ${autoReply}`);
      this.logger.log('Note: Need to implement profile lookup to get facebookPageId and facebookAccessToken');
      
      // TODO: Implement profile lookup to get the required parameters
      // const profile = await this.instagramProfileService.getProfileById(profileId, userId);
      // await this.instagramService.sendDirectMessage(senderId, autoReply, profile.facebookPageId, profile.facebookAccessToken);
      
    } catch (error) {
      this.logger.error('Error handling message event:', error);
    }
  }

  private async handleCommentEvent(commentData: any) {
    try {
      const comment = commentData.value;
      const commentText = comment.message?.text;
      const commenterId = comment.from?.id;
      
      if (!commentText || !commenterId) {
        this.logger.log('Missing comment text or commenter ID, skipping auto-reply');
        return;
      }

      this.logger.log(`Processing comment from ${commenterId}: ${commentText}`);

      // Auto-reply to comments
      let reply = '';
      const lowerComment = commentText.toLowerCase();

      if (lowerComment.includes('amazing') || lowerComment.includes('love') || lowerComment.includes('great')) {
        reply = "Thank you! We're so glad you like it! 😊";
      } else if (lowerComment.includes('question') || lowerComment.includes('how') || lowerComment.includes('what')) {
        reply = "Great question! Let me know if you need more details! 💡";
      } else if (lowerComment.includes('price') || lowerComment.includes('cost')) {
        reply = "Thanks for asking! Check out our latest pricing on our website! 💰";
      } else {
        reply = "Thanks for your comment! We appreciate your engagement! 🙏";
      }

      // Send reply to comment
      // Note: We need to get the profile info to get instagramAccessToken
      this.logger.log(`Would reply to comment from ${commenterId}: ${reply}`);
      this.logger.log('Note: Need to implement profile lookup to get instagramAccessToken');
      
      // TODO: Implement profile lookup to get the required parameters
      // const profile = await this.instagramProfileService.getProfileById(profileId, userId);
      // await this.instagramService.replyToComment(comment.id, reply, profile.instagramAccessToken);
      
    } catch (error) {
      this.logger.error('Error handling comment event:', error);
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
        // Note: We need profile info to get instagramAccessToken
        this.logger.log(`Would reply to comment: ${reply}`);
        this.logger.log('Note: Need to implement profile lookup to get instagramAccessToken');
        // await this.instagramService.replyToComment(comment.id, reply, profile.instagramAccessToken);
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
      
      // Note: We need profile info to get facebookPageId and facebookAccessToken
      this.logger.log(`Would send welcome message to ${senderId}: ${welcomeMessage}`);
      this.logger.log('Note: Need to implement profile lookup to get facebookPageId and facebookAccessToken');
      // await this.instagramService.sendDirectMessage(senderId, welcomeMessage, profile.facebookPageId, profile.facebookAccessToken);
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
      
      // Note: We need profile info to get facebookPageId and facebookAccessToken
      this.logger.log(`Would send help message to ${senderId}: ${helpMessage}`);
      this.logger.log('Note: Need to implement profile lookup to get facebookPageId and facebookAccessToken');
      // await this.instagramService.sendDirectMessage(senderId, helpMessage, profile.facebookPageId, profile.facebookAccessToken);
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
