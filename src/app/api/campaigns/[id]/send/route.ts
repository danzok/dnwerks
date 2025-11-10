import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { scheduleCampaign } from '@/lib/scheduler';
import { getCampaignById, getCampaignCustomers } from '@/lib/db';

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
    const { scheduledFor } = await request.json();

    // Get campaign details
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if ((campaign as any).userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if ((campaign as any).status !== 'draft') {
      return NextResponse.json({ error: 'Campaign has already been sent or scheduled' }, { status: 400 });
    }

    // Get campaign customers
    const customers = await getCampaignCustomers(campaignId);
    if (customers.length === 0) {
      return NextResponse.json({ error: 'No customers selected for this campaign' }, { status: 400 });
    }

    // Update campaign with scheduled time if provided
    const scheduledAt = scheduledFor ? new Date(scheduledFor) : null;

    // Schedule the campaign
    await scheduleCampaign({
      ...campaign,
      scheduledAt
    } as any, customers);

    // Update campaign status in database
    await supabase
      .from('campaigns')
      .update({
        status: scheduledAt && scheduledAt > new Date() ? 'scheduled' : 'sending',
        scheduled_at: scheduledAt,
        total_recipients: customers.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    return NextResponse.json({
      success: true,
      message: scheduledAt && scheduledAt > new Date()
        ? 'Campaign scheduled successfully'
        : 'Campaign sending started',
      campaignId,
      totalRecipients: customers.length,
      scheduledAt: scheduledAt,
    });

  } catch (error: any) {
    console.error('Failed to send campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send campaign' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { action, scheduledFor } = await request.json();

    // Get campaign details
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if ((campaign as any).userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    switch (action) {
      case 'reschedule':
        if (!scheduledFor) {
          return NextResponse.json({ error: 'New schedule time is required' }, { status: 400 });
        }

        // Get campaign customers
        const customers = await getCampaignCustomers(campaignId);
        if (customers.length === 0) {
          return NextResponse.json({ error: 'No customers found for this campaign' }, { status: 400 });
        }

        // Update campaign schedule
        const newScheduledAt = new Date(scheduledFor);

        // Reschedule the campaign
        const { rescheduleCampaign } = await import('@/lib/scheduler');
        await rescheduleCampaign({
          ...campaign,
          scheduledAt: newScheduledAt
        } as any, customers, newScheduledAt);

        // Update database
        await supabase
          .from('campaigns')
          .update({
            scheduled_at: new Date(scheduledFor),
            updated_at: new Date().toISOString()
          })
          .eq('id', campaignId);

        return NextResponse.json({
          success: true,
          message: 'Campaign rescheduled successfully',
          scheduledAt: new Date(scheduledFor),
        });

      case 'cancel':
        // Cancel the scheduled campaign
        const { cancelScheduledCampaign } = await import('@/lib/scheduler');
        await cancelScheduledCampaign(campaignId, user.id);

        // Update database
        await supabase
          .from('campaigns')
          .update({
            status: 'draft',
            scheduled_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', campaignId);

        return NextResponse.json({
          success: true,
          message: 'Campaign cancelled successfully',
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Failed to update campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}