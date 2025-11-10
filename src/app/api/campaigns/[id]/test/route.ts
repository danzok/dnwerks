import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { createSMSService } from '@/lib/sms';
import { getCampaignById, getCustomerById } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { testPhoneNumber, customerId } = await request.json();

    if (!testPhoneNumber && !customerId) {
      return NextResponse.json(
        { error: 'Either testPhoneNumber or customerId is required' },
        { status: 400 }
      );
    }

    // Get campaign details
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if ((campaign as any).userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get recipient information
    let recipientPhone = testPhoneNumber;
    let recipientFirstName = 'Test';
    let recipientLastName = 'User';
    let recipientEmail = 'test@example.com';

    if (customerId) {
      const customer = await getCustomerById(customerId);
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      if ((customer as any).userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      recipientPhone = (customer as any).phone;
      recipientFirstName = (customer as any).firstName || '';
      recipientLastName = (customer as any).lastName || '';
      recipientEmail = (customer as any).email || '';
    }

    // Validate phone number
    const smsService = createSMSService();
    if (!smsService.validatePhoneNumber(recipientPhone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    // Format phone number
    const formattedPhone = smsService.formatPhoneNumber(recipientPhone);

    // Personalize message
    const personalizedMessage = (campaign as any).messageBody
      .replace(/\{\{firstName\}\}/g, recipientFirstName)
      .replace(/\{\{lastName\}\}/g, recipientLastName)
      .replace(/\{\{phone\}\}/g, recipientPhone)
      .replace(/\{\{email\}\}/g, recipientEmail);

    // Add test prefix
    const testMessage = `[TEST MESSAGE] ${personalizedMessage}`;

    // Send test message
    const message = await smsService.sendMessage({
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaignId,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER || '+15017122661',
      body: testMessage,
      status: 'pending',
    });

    // Log test message for analytics
    await supabase
      .from('test_messages')
      .insert({
        id: message.id,
        campaign_id: campaignId,
        user_id: user.id,
        to: formattedPhone,
        message_body: testMessage,
        status: message.status,
        error_code: message.errorCode,
        error_message: message.errorMessage,
        sent_at: message.sentAt?.toISOString(),
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: 'Test message sent successfully',
      messageId: message.id,
      status: message.status,
      to: formattedPhone,
      sentAt: message.sentAt,
      error: message.errorMessage,
    });

  } catch (error: any) {
    console.error('Failed to send test message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test message' },
      { status: 500 }
    );
  }
}