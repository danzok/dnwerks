import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import { getCampaignsByUserId, createCampaign } from '@/lib/db';
import { transformApiRequest, transformDatabaseResponse } from '@/lib/property-transform';
import type { NewCampaignUI, CampaignUI } from '@/lib/ui-types';

// GET /api/campaigns - List all campaigns for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const orderBy = searchParams.get('orderBy') || undefined;
    const ascending = searchParams.get('ascending') === 'true' ? true : undefined;

    // Get campaigns for the user
    const campaigns = await getCampaignsByUserId(user.id, {
      status,
      search,
      dateFrom,
      dateTo,
      limit,
      offset,
      orderBy,
      ascending
    });

    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });

  } catch (error: any) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.messageBody) {
      return NextResponse.json(
        { error: 'Missing required fields: name and messageBody are required' },
        { status: 400 }
      );
    }

    // Transform UI data to database format
    const campaignData: NewCampaignUI = {
      userId: user.id,
      name: body.name,
      messageBody: body.messageBody,
      status: body.status || 'draft',
      scheduledAt: body.scheduledAt || null,
      totalRecipients: body.totalRecipients || 0
    };

    // Transform to snake_case for database
    const dbCampaignData = transformApiRequest(campaignData);

    // Create campaign
    const newCampaign = await createCampaign(dbCampaignData as any);

    if (!newCampaign) {
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newCampaign,
      message: 'Campaign created successfully'
    });

  } catch (error: any) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}