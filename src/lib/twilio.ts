import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Validate Twilio credentials format
const isValidTwilioSid = accountSid && accountSid.startsWith('AC') && accountSid.length > 10;
const isValidAuthToken = authToken && authToken.length > 10;
const isValidPhoneNumber = twilioPhoneNumber && twilioPhoneNumber.startsWith('+');

if (!isValidTwilioSid || !isValidAuthToken || !isValidPhoneNumber) {
  console.warn('Twilio credentials not properly configured. SMS functionality will not work.');
}

// Only create client if credentials are valid
const client = isValidTwilioSid && isValidAuthToken ? new Twilio(accountSid, authToken) : null;

export interface SendSMSResult {
  sid: string;
  status: string;
  to: string;
  from: string;
  body: string;
}

export async function sendSMS(to: string, body: string): Promise<SendSMSResult> {
  if (!client) {
    throw new Error('Twilio client not initialized');
  }

  try {
    // Validate US phone number
    if (!to.startsWith('+1')) {
      throw new Error('Only US phone numbers are supported. Must start with +1');
    }

    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber!,
      to,
    });

    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body || body,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, any>
): boolean {
  if (!authToken) return false;

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(url + Object.keys(params).sort().map(key => params[key]).join(''))
    .digest('base64');

  return signature === expectedSignature;
}

export async function getSMSStatus(messageSid: string) {
  if (!client) {
    throw new Error('Twilio client not initialized');
  }

  try {
    const message = await client.messages(messageSid).fetch();
    return {
      sid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from,
      body: message.body,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
    };
  } catch (error) {
    console.error('Error fetching SMS status:', error);
    throw error;
  }
}