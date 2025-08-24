import { Injectable, Logger } from '@nestjs/common';
import { InstagramService } from './instagram.service';

@Injectable()
export class InstagramAutomationService {
  private readonly logger = new Logger(InstagramAutomationService.name);

  constructor(private readonly instagramService: InstagramService) {}

  /**
   * Auto-reply to messages based on keywords
   */
  async handleAutoReply(
    message: string, 
    userId: string, 
    facebookPageId: string, 
    facebookAccessToken: string
  ) {
    const lowerMessage = message.toLowerCase();
    
    // Welcome messages
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return await this.instagramService.sendDirectMessage(
        userId, 
        "👋 Hello! Thanks for reaching out. How can I help you today?",
        facebookPageId,
        facebookAccessToken
      );
    }

    // Help messages
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "🆘 I'm here to help! What do you need assistance with?",
        facebookPageId,
        facebookAccessToken
      );
    }

    // Product inquiries
    if (lowerMessage.includes('product') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "💰 Thanks for your interest! I'll have our team get back to you with pricing details within 24 hours.",
        facebookPageId,
        facebookAccessToken
      );
    }

    // Business hours
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "🕒 We're open Monday-Friday 9 AM - 6 PM EST. Feel free to reach out anytime!",
        facebookPageId,
        facebookAccessToken
      );
    }

    // Default response
    return await this.instagramService.sendDirectMessage(
      userId,
      "Thanks for your message! I'll get back to you as soon as possible. 😊",
      facebookPageId,
      facebookAccessToken
    );
  }

  /**
   * Welcome new followers
   */
  async welcomeNewFollower(
    userId: string, 
    username: string, 
    facebookPageId: string, 
    facebookAccessToken: string
  ) {
    const welcomeMessage = `🎉 Welcome @${username}! Thanks for following us. We're excited to have you here! 

What brings you to our page today?`;
    
    return await this.instagramService.sendDirectMessage(
      userId, 
      welcomeMessage, 
      facebookPageId, 
      facebookAccessToken
    );
  }

  /**
   * Follow-up after initial contact
   */
  async sendFollowUp(
    userId: string, 
    daysSinceContact: number, 
    facebookPageId: string, 
    facebookAccessToken: string
  ) {
    let message = '';
    
    if (daysSinceContact === 1) {
      message = "👋 Hi there! Just checking in to see if you have any questions about our services.";
    } else if (daysSinceContact === 3) {
      message = "💡 Quick reminder: We're here to help! Let us know if you need anything.";
    } else if (daysSinceContact === 7) {
      message = "🌟 Hope you're having a great week! Don't forget we're available for any questions.";
    }

    if (message) {
      return await this.instagramService.sendDirectMessage(
        userId, 
        message, 
        facebookPageId, 
        facebookAccessToken
      );
    }
  }

  /**
   * Holiday/Event greetings
   */
  async sendHolidayGreeting(
    userId: string, 
    holiday: string, 
    facebookPageId: string, 
    facebookAccessToken: string
  ) {
    const greetings = {
      'christmas': '🎄 Merry Christmas! Wishing you and your family a wonderful holiday season!',
      'newyear': '🎆 Happy New Year! Here\'s to an amazing 2025!',
      'valentines': '💝 Happy Valentine\'s Day! Sending you lots of love!',
      'birthday': '🎂 Happy Birthday! Hope your day is filled with joy!'
    };

    const message = greetings[holiday.toLowerCase()] || '🎉 Happy holidays!';
    return await this.instagramService.sendDirectMessage(
      userId, 
      message, 
      facebookPageId, 
      facebookAccessToken
    );
  }

  /**
   * Send promotional messages
   */
  async sendPromotionalMessage(
    userId: string, 
    promotion: string, 
    facebookPageId: string, 
    facebookAccessToken: string
  ) {
    const promotionalMessages = {
      'special offer': '🔥 Special Offer Alert! Get 20% off your next purchase with code SPECIAL20!',
      'new product': '🆕 We just launched something amazing! Check out our latest product!',
      'sale': '💰 Big Sale! Don\'t miss out on incredible deals this week!',
      'newsletter': '📧 Stay updated! Subscribe to our newsletter for exclusive content!'
    };

    const message = promotionalMessages[promotion.toLowerCase()] || `🎯 ${promotion}`;
    return await this.instagramService.sendDirectMessage(
      userId, 
      message, 
      facebookPageId, 
      facebookAccessToken
    );
  }

  /**
   * Handle customer service inquiries
   */
  async handleCustomerService(
    message: string, 
    userId: string, 
    facebookPageId: string, 
    facebookAccessToken: string
  ) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('tracking')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "📦 I'll check your order status right away. Can you provide your order number?",
        facebookPageId,
        facebookAccessToken
      );
    }
    
    if (lowerMessage.includes('refund') || lowerMessage.includes('return')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "🔄 I understand you'd like a refund. Let me connect you with our customer service team. They'll be in touch within 2 hours.",
        facebookPageId,
        facebookAccessToken
      );
    }
    
    if (lowerMessage.includes('technical') || lowerMessage.includes('bug') || lowerMessage.includes('error')) {
      return await this.instagramService.sendDirectMessage(
        userId,
        "🔧 I'm sorry you're experiencing technical issues. Our tech team will contact you within 1 hour to resolve this.",
        facebookPageId,
        facebookAccessToken
      );
    }
    
    return await this.instagramService.sendDirectMessage(
      userId,
      "📞 Thanks for reaching out! I'm connecting you with our customer service team. They'll respond within 2 hours.",
      facebookPageId,
      facebookAccessToken
    );
  }

  /**
   * Engage with users based on their activity
   */
  async engageWithUser(
    userId: string, 
    userActivity: string, 
    facebookPageId: string, 
    facebookAccessToken: string
  ) {
    const engagementMessages = {
      'recent_activity': '👋 I noticed your recent activity! How can I help you today?',
      'new_follower': '🎉 Welcome to our community! We\'re excited to have you here!',
      'comment': '💬 Thanks for your comment! We appreciate your engagement!',
      'like': '❤️ Thanks for the like! We\'re glad you enjoyed our content!'
    };

    const message = engagementMessages[userActivity.toLowerCase()] || `👋 Thanks for your ${userActivity}!`;
    return await this.instagramService.sendDirectMessage(
      userId, 
      message, 
      facebookPageId, 
      facebookAccessToken
    );
  }
}
