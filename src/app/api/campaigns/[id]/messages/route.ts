import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getCampaignById } from '@/lib/db';
import { transformDatabaseResponse } from '@/lib/property-transform';

// GET /api/campaigns/[id]/messages - Get all messages for a campaign
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

    // Get campaign messages
    const { data, error } = await supabase
      .from('campaign_messages')
      .select(`
        *,
        customers (*)
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaign messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaign messages' },
        { status: 500 }
      );
    }

    // Transform to camelCase for UI
    const transformedMessages = transformDatabaseResponse(data || []);

    return NextResponse.json({
      success: true,
      data: transformedMessages
    });

  } catch (error: any) {
    console.error('Failed to fetch campaign messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign messages' },
      { status: 500 }
    );
  }
}