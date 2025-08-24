# Instagram DM Automation Setup Guide

This guide will help you set up Instagram DM automation using your NestJS backend and NextJS frontend.

## Prerequisites

1. **Facebook Business Account** (not personal account)
2. **Instagram Business Account** connected to your Facebook page
3. **Facebook App** with proper permissions
4. **Long-lived Access Token**

## Step 1: Facebook App Setup

### 1.1 Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → Choose "Business" type
3. Fill in app details and create

### 1.2 Add Instagram Basic Display
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Follow the setup wizard

### 1.3 Add Facebook Login
1. Click "Add Product" again
2. Add "Facebook Login" product
3. Configure OAuth redirect URIs

## Step 2: Get Required Permissions

### 2.1 App Review Process
You'll need these permissions approved by Facebook:
- `instagram_basic` - Basic profile info
- `instagram_manage_comments` - Manage comments
- `instagram_manage_insights` - View insights
- ` ` - Access to Facebook pages
- `pages_manage_metadata` - Manage page metadata

### 2.2 Submit for Review
1. Go to "App Review" → "Permissions and Features"
2. Request each permission with business justification
3. Wait for Facebook approval (can take 1-7 days)

## Step 3: Get Access Tokens

### 3.1 Generate User Access Token
1. Go to [Facebook Access Token Tool](https://developers.facebook.com/tools/access_token/)
2. Select your app
3. Generate token with required permissions

### 3.2 Convert to Long-lived Token
```bash
curl -X GET "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

### 3.3 Get Instagram Business Account ID
```bash
curl -X GET "https://graph.facebook.com/v18.0/{page-id}?fields=instagram_business_account&access_token={access-token}"
```

## Step 4: Environment Configuration

### 4.1 Backend (.env file)
```env
# Facebook/Instagram Configuration
FACEBOOK_ACCESS_TOKEN=your_long_lived_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Optional: Webhook verification
FACEBOOK_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### 4.2 Frontend (.env.local file)
```env
NEXT_PUBLIC_URL=https://test-nest-api-production.up.railway.app
```

## Step 5: Install Dependencies

### 5.1 Backend (NestJS)
```bash
cd test-nest-api
npm install @nestjs/axios axios
```

### 5.2 Frontend (NextJS)
```bash
cd nextjs-chat-app
npm install axios
```

## Step 6: Test the Setup

### 6.1 Test Backend Endpoints
```bash
# Test profile endpoint
curl -X GET "https://your-backend-url/api/instagram/profile"

# Test sending DM (you'll need a valid recipient ID)
curl -X POST "https://your-backend-url/api/instagram/send-dm" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":"user_id","message":"Hello from automation!"}'
```

### 6.2 Test Frontend
1. Navigate to `/instagram` page
2. Check if profile loads
3. Try sending a test message

## Step 7: Advanced Features

### 7.1 Webhook Setup (Optional)
For real-time notifications:
```typescript
// In your Instagram service
//curl -X GET "https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=2262921327515775&client_secret=f73c5ac77b870f58974ae5b79ca16a4c&fb_exchange_token=EAAgKHW3hmH8BPEZB8c3P9MAvfcZBqRGsmSG4FmDcNBylPYtV7rgq5abwHlYq2oW9qz24oiEwcAoP6s1A78QZBO7Jmm3hWZC8tsYnnDqCDZBHWjEDPc1uBpG8HycSAh0yRjuyFQR2MTzFRQyeSHMM0XZACGrvlzF71kJaA3uovueG7tbu6zkLKVDJIHdSG8YAlMH6cNZCDgjt2ZBcsOLaR91nPQtUkYNPbRzQsdFTmuHCzv6lXWX6kJDqZA5E2TtZASoAZDZD"
// {"access_token":"EAAgKHW3hmH8BPKCwLf8ivTXhstOBlyGZBBGZA817zZBLZCU3b5USso5OiyCFXZBSgRqJXoGLGPQ7ZBWoVQfUk2XCZCBlz8SJJN4GZCcnv8zZAyA8nO9ynZAIHfu4NK5SBh0hFH6qqAzJd2V43itpgfnenyZBRTcb5QgW5rNQYy0ZCCZAPQmtVvOLBiwDNiLP73cZA9d449WoY1G3bJMfzV","token_type":"bearer","expires_in":5183687}
async setupWebhook(callbackUrl: string) {
  const url = `${this.baseUrl}/${this.instagramBusinessAccountId}/subscriptions`;
  const payload = {
    object: 'instagram',
    callback_url: callbackUrl,
    fields: ['messages', 'comments'],
    access_token: this.accessToken,
  };
  
  return await firstValueFrom(
    this.httpService.post(url, payload)
  );
}
```

### 7.2 Message Templates
```typescript
// Pre-defined message templates
const messageTemplates = {
  welcome: "Welcome! Thanks for reaching out.",
  followUp: "How can I help you today?",
  support: "I'll get back to you within 24 hours.",
  custom: (name: string) => `Hi ${name}! Thanks for your message.`
};
```

### 7.3 Automated Responses
```typescript
// Auto-reply based on keywords
async handleAutoReply(message: string, userId: string) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return await this.sendDirectMessage(userId, messageTemplates.welcome);
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return await this.sendDirectMessage(userId, messageTemplates.support);
  }
}
```

## Step 8: Monitoring & Analytics

### 8.1 Track Message Performance
```typescript
// Log message analytics
async logMessageAnalytics(messageId: string, recipientId: string, status: string) {
  // Store in database for analytics
  await this.analyticsService.log({
    messageId,
    recipientId,
    status,
    timestamp: new Date(),
    platform: 'instagram'
  });
}
```

### 8.2 Rate Limiting
Instagram has rate limits:
- **Messages**: 100 per day per user
- **Comments**: 100 per hour per post
- **API calls**: 200 per hour per app

## Troubleshooting

### Common Issues

1. **"Invalid access token"**
   - Token expired → Generate new long-lived token
   - Wrong permissions → Check app review status

2. **"User not found"**
   - User ID format incorrect
   - User has private account
   - User blocked your account

3. **"Rate limit exceeded"**
   - Implement exponential backoff
   - Queue messages for later delivery

4. **"Permission denied"**
   - Check app review status
   - Verify token has required scopes

### Debug Mode
Enable detailed logging:
```typescript
// In Instagram service
private readonly debugMode = process.env.NODE_ENV === 'development';

async sendDirectMessage(recipientId: string, message: string) {
  if (this.debugMode) {
    this.logger.debug(`Sending DM to ${recipientId}: ${message}`);
  }
  // ... rest of the method
}
```

## Security Considerations

1. **Never expose access tokens** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** to avoid API abuse
4. **Validate user input** before sending messages
5. **Log all actions** for audit purposes

## Next Steps

1. **Implement message queuing** for high-volume scenarios
2. **Add user management** for multiple Instagram accounts
3. **Create message templates** for common responses
4. **Set up webhooks** for real-time notifications
5. **Add analytics dashboard** for performance tracking

## Support

- [Facebook Developer Documentation](https://developers.facebook.com/docs/instagram-api)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)

## Legal Compliance

⚠️ **Important**: Ensure compliance with:
- Instagram's Terms of Service
- Facebook's Platform Policy
- GDPR and privacy regulations
- Anti-spam laws in your jurisdiction

Always respect user privacy and provide opt-out mechanisms.
