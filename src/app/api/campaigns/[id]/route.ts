import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getCampaignById, updateCampaign, deleteCampaign } from '@/lib/db';
import { transformApiRequest, transformDatabaseResponse } from '@/lib/property-transform';
import type { CampaignUI } from '@/lib/ui-types';

// GET /api/campaigns/[id] - Get a specific campaign by ID
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

    // Get campaign by ID
    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if user owns the campaign (campaign is already transformed to camelCase)
    if ((campaign as any).userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: campaign
    });

  } catch (error: any) {
    console.error('Failed to fetch campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Update a specific campaign
export async function PUT(
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

    // Check if campaign exists and user owns it
    const existingCampaign = await getCampaignById(campaignId);
    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if ((existingCampaign as any).userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Don't allow updating certain fields
    const { id, userId, createdAt, updatedAt, ...updateData } = body;

    // Transform to snake_case for database
    const dbUpdateData = transformApiRequest(updateData);

    // Update campaign
    const updatedCampaign = await updateCampaign(campaignId, dbUpdateData as any);

    if (!updatedCampaign) {
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign updated successfully'
    });

  } catch (error: any) {
    console.error('Failed to update campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete a specific campaign
export async function DELETE(
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

    // Check if campaign exists and user owns it
    const existingCampaign = await getCampaignById(campaignId);
    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if ((existingCampaign as any).userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Don't allow deletion of campaigns that are already sent or sending
    if (existingCampaign.status === 'sending' || existingCampaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot delete campaign that is being sent or has already been sent' },
        { status: 400 }
      );
    }

    // Delete campaign
    const deleted = await deleteCampaign(campaignId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error: any) {
    console.error('Failed to delete campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}