import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getCampaignById, getCampaignCustomers } from '@/lib/db';
import { transformApiRequest } from '@/lib/property-transform';

// GET /api/campaigns/[id]/recipients - Get recipients for a campaign
export async function GET(
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

    // Verify campaign ownership
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if ((campaign as any).userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get campaign recipients
    const customers = await getCampaignCustomers(campaignId);

    return NextResponse.json({
      success: true,
      data: customers,
      count: customers.length
    });

  } catch (error: any) {
    console.error('Failed to fetch campaign recipients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign recipients' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/recipients - Add recipients to a campaign
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

    // Verify campaign ownership
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if ((campaign as any).userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow adding recipients to sent campaigns
    if ((campaign as any).status === 'sent' || (campaign as any).status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot modify recipients of sent or sending campaigns' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { customerIds } = body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'customerIds array is required' },
        { status: 400 }
      );
    }

    // Get customer details
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .in('id', customerIds);

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    if (customers.length !== customerIds.length) {
      return NextResponse.json(
        { error: 'Some customers were not found or do not belong to you' },
        { status: 400 }
      );
    }

    // Create campaign messages for each customer
    const campaignMessages = customers.map((customer: any) => ({
      campaign_id: campaignId,
      customer_id: customer.id,
      phone_number: customer.phone,
      message_body: (campaign as any).messageBody,
      status: 'pending'
    }));

    const { error: insertError } = await supabase
      .from('campaign_messages')
      .upsert(campaignMessages, { onConflict: 'campaign_id,customer_id' });

    if (insertError) {
      console.error('Error adding recipients:', insertError);
      return NextResponse.json(
        { error: 'Failed to add recipients' },
        { status: 500 }
      );
    }

    // Update campaign recipient count
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ 
        total_recipients: campaignMessages.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    if (updateError) {
      console.error('Error updating campaign:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${customers.length} recipients to campaign`,
      data: { addedCount: customers.length }
    });

  } catch (error: any) {
    console.error('Failed to add campaign recipients:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add campaign recipients' },
      { status: 500 }
    );
  }
}