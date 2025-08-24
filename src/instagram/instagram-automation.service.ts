import { Injectable, Logger } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Injectable()
export class InstagramAutomationService {
  private readonly logger = new Logger(InstagramAutomationService.name);

  constructor(private readonly instagramService: InstagramService) {}

  /**
   * Auto-reply to messages based on keywords
   */
  async handleAutoReply(message: string, userId: string) {
    const lowerMessage = message.toLowerCase();
    
    // Welcome messages
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return await this.instagramService.sendDirectMessage(
        userId, 
        "👋 Hello! Thanks for reaching out. How can I help you today?"
      );
    }

    // Help messages
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "🆘 I'm here to help! What do you need assistance with?"
      );
    }

    // Product inquiries
    if (lowerMessage.includes('product') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "💰 Thanks for your interest! I'll have our team get back to you with pricing details within 24 hours."
      );
    }

    // Business hours
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "🕒 We're open Monday-Friday 9 AM - 6 PM EST. Feel free to reach out anytime!"
      );
    }

    // Default response
    return await this.instagramService.sendDirectMessage(
      userId,
      "Thanks for your message! I'll get back to you as soon as possible. 😊"
    );
  }

  /**
   * Welcome new followers
   */
  async welcomeNewFollower(userId: string, username: string) {
    const welcomeMessage = `🎉 Welcome @${username}! Thanks for following us. We're excited to have you here! 

What brings you to our page today?`;
    
    return await this.instagramService.sendDirectMessage(userId, welcomeMessage);
  }

  /**
   * Follow-up after initial contact
   */
  async sendFollowUp(userId: string, daysSinceContact: number) {
    let message = '';
    
    if (daysSinceContact === 1) {
      message = "👋 Hi there! Just checking in to see if you have any questions about our services.";
    } else if (daysSinceContact === 3) {
      message = "💡 Quick reminder: We're here to help! Let us know if you need anything.";
    } else if (daysSinceContact === 7) {
      message = "🌟 Hope you're having a great week! Don't forget we're available for any questions.";
    }

    if (message) {
      return await this.instagramService.sendDirectMessage(userId, message);
    }
  }

  /**
   * Holiday/Event greetings
   */
  async sendHolidayGreeting(userId: string, holiday: string) {
    const greetings = {
      'christmas': '🎄 Merry Christmas! Wishing you and your family a wonderful holiday season!',
      'newyear': '🎆 Happy New Year! Here\'s to an amazing 2025!',
      'valentines': '💝 Happy Valentine\'s Day! Sending you lots of love!',
      'birthday': '🎂 Happy Birthday! Hope your day is filled with joy!'
    };

    const message = greetings[holiday.toLowerCase()] || '🎉 Happy holidays!';
    return await this.instagramService.sendDirectMessage(userId, message);
  }

  /**
   * Promotional messages (use sparingly)
   */
  async sendPromotionalMessage(userId: string, promotion: string) {
    const promotionalMessages = {
      'discount': '🔥 Special offer just for you! Use code WELCOME20 for 20% off your first order!',
      'new_product': '🚀 Exciting news! We just launched our new product. Want to be the first to know more?',
      'event': '📅 Join us for our upcoming event! DM us for details and registration.',
      'newsletter': '📧 Stay updated with our latest news! Would you like to join our newsletter?'
    };

    const message = promotionalMessages[promotion.toLowerCase()] || '🎯 We have something special for you!';
    return await this.instagramService.sendDirectMessage(userId, message);
  }

  /**
   * Customer service automation
   */
  async handleCustomerService(message: string, userId: string) {
    const lowerMessage = message.toLowerCase();
    
    // Order status
    if (lowerMessage.includes('order') && lowerMessage.includes('status')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "📦 I'll check your order status right away. Can you provide your order number?"
      );
    }

    // Refund requests
    if (lowerMessage.includes('refund') || lowerMessage.includes('return')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "🔄 I understand you'd like a refund. Let me connect you with our customer service team. They'll be in touch within 2 hours."
      );
    }

    // Technical support
    if (lowerMessage.includes('technical') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "🔧 I'm sorry you're experiencing technical issues. Our tech team will contact you within 1 hour to resolve this."
      );
    }

    // General inquiry
    return await this.instagramService.sendDirectMessage(
      userId,
      "📞 Thanks for reaching out! I'm connecting you with our customer service team. They'll respond within 2 hours."
    );
  }

  /**
   * Engagement automation
   */
  async engageWithUser(userId: string, userActivity: string) {
    const engagementMessages = {
      'liked_post': '❤️ Thanks for the like! We appreciate your support!',
      'commented': '💬 Thanks for your comment! We love hearing from our community!',
      'shared': '🔄 Thanks for sharing our content! Youre helping us reach more people!',
      'saved': '🔖 Thanks for saving our post! We hope you find it useful!'
    };

    const message = engagementMessages[userActivity.toLowerCase()] || '🙏 Thanks for engaging with our content!';
    return await this.instagramService.sendDirectMessage(userId, message);
  }
}
