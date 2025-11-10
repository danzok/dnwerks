// Twilio import is only used on server side
let Twilio: any;
if (typeof window === 'undefined') {
  try {
    Twilio = require('twilio');
  } catch (error) {
    console.warn('Twilio not available on server side');
  }
}

export interface SMSMessage {
  id: string;
  campaignId: string;
  to: string;
  from: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  errorCode?: string;
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  price?: string;
  priceUnit?: string;
}

export interface CampaignCustomer {
  id: string;
  campaignId: string;
  customerId: string;
  customerPhone: string;
  messageBody: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  retries: number;
  lastRetryAt?: Date;
}

export interface SMSService {
  sendMessage(message: SMSMessage): Promise<SMSMessage>;
  sendBatch(messages: SMSMessage[]): Promise<SMSMessage[]>;
  getMessageStatus(messageId: string): Promise<SMSMessage>;
  validatePhoneNumber(phone: string): boolean;
  formatPhoneNumber(phone: string): string;
}

export class TwilioSMSService implements SMSService {
  private client: any; // Twilio client

  constructor(accountSid: string, authToken: string) {
    this.client = new Twilio(accountSid, authToken);
  }

  async sendMessage(message: SMSMessage): Promise<SMSMessage> {
    try {
      const twilioMessage = await this.client.messages.create({
        to: message.to,
        from: message.from,
        body: message.body,
      });

      return {
        ...message,
        status: this.mapTwilioStatus(twilioMessage.status as any),
        sentAt: twilioMessage.dateCreated ? new Date(twilioMessage.dateCreated) : undefined,
        price: twilioMessage.price || undefined,
        priceUnit: twilioMessage.priceUnit || undefined,
      };
    } catch (error: any) {
      return {
        ...message,
        status: 'failed',
        errorCode: error.code?.toString(),
        errorMessage: error.message,
      };
    }
  }

  async sendBatch(messages: SMSMessage[]): Promise<SMSMessage[]> {
    const results: SMSMessage[] = [];

    // Send messages in batches to respect rate limits
    const batchSize = 10; // Twilio recommended batch size
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(message => this.sendMessage(message))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            ...batch[index],
            status: 'failed',
            errorCode: 'BATCH_ERROR',
            errorMessage: result.reason?.message || 'Failed to send message',
          });
        }
      });

      // Rate limiting: wait between batches
      if (i + batchSize < messages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    return results;
  }

  async getMessageStatus(messageId: string): Promise<SMSMessage> {
    try {
      const twilioMessage = await this.client.messages(messageId).fetch();

      return {
        id: twilioMessage.sid,
        campaignId: '', // This would need to be looked up from database
        to: twilioMessage.to,
        from: twilioMessage.from,
        body: twilioMessage.body,
        status: this.mapTwilioStatus(twilioMessage.status as any),
        errorCode: twilioMessage.errorCode?.toString(),
        errorMessage: twilioMessage.errorMessage || undefined,
        sentAt: twilioMessage.dateCreated ? new Date(twilioMessage.dateCreated) : undefined,
        deliveredAt: twilioMessage.dateUpdated ? new Date(twilioMessage.dateUpdated) : undefined,
        price: twilioMessage.price || undefined,
        priceUnit: twilioMessage.priceUnit || undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch message status: ${error.message}`);
    }
  }

  validatePhoneNumber(phone: string): boolean {
    // Basic US phone validation
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10 && /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleanPhone);
  }

  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length === 10) {
      return `+1${cleanPhone}`;
    }

    if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
      return `+${cleanPhone}`;
    }

    return phone; // Return original if can't format
  }

  private mapTwilioStatus(twilioStatus: string): SMSMessage['status'] {
    const statusMap: Record<string, SMSMessage['status']> = {
      'queued': 'pending',
      'sending': 'sent',
      'sent': 'sent',
      'delivered': 'delivered',
      'undelivered': 'undelivered',
      'failed': 'failed',
    };

    return statusMap[twilioStatus] || 'pending';
  }
}

// Mock service for development/testing
export class MockSMSService implements SMSService {
  private messages: Map<string, SMSMessage> = new Map();

  async sendMessage(message: SMSMessage): Promise<SMSMessage> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate random success/failure for testing
    const isSuccess = Math.random() > 0.1; // 90% success rate

    const updatedMessage: SMSMessage = {
      ...message,
      status: isSuccess ? 'sent' : 'failed',
      sentAt: new Date(),
      deliveredAt: isSuccess ? new Date(Date.now() + Math.random() * 5000) : undefined,
      price: isSuccess ? '0.0079' : undefined,
      priceUnit: 'USD',
      errorCode: isSuccess ? undefined : 'MOCK_ERROR',
      errorMessage: isSuccess ? undefined : 'Mock delivery failure for testing',
    };

    this.messages.set(message.id, updatedMessage);
    return updatedMessage;
  }

  async sendBatch(messages: SMSMessage[]): Promise<SMSMessage[]> {
    const results: SMSMessage[] = [];

    for (const message of messages) {
      const result = await this.sendMessage(message);
      results.push(result);

      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  async getMessageStatus(messageId: string): Promise<SMSMessage> {
    const message = this.messages.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Simulate status progression
    if (message.status === 'sent' && Math.random() > 0.5) {
      const updatedMessage = {
        ...message,
        status: 'delivered' as const,
        deliveredAt: new Date(),
      };
      this.messages.set(messageId, updatedMessage);
      return updatedMessage;
    }

    return message;
  }

  validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10;
  }

  formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `+1${cleanPhone}`;
    }
    return phone;
  }
}

// Factory function to create SMS service
export function createSMSService(): SMSService {
  // Only use Twilio on server side
  if (typeof window !== 'undefined') {
    console.log('Using Mock SMS service for client side');
    return new MockSMSService();
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (accountSid && authToken && accountSid !== 'your_twilio_account_sid' && Twilio) {
    console.log('Using Twilio SMS service');
    return new TwilioSMSService(accountSid, authToken);
  } else {
    console.log('Using Mock SMS service for development');
    return new MockSMSService();
  }
}