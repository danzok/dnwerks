import { createClient } from '@/lib/supabase/server';
import { transformDatabaseResponse, transformApiRequest } from './property-transform';
import type {
  Campaign,
  Customer,
  UserProfile,
  CampaignMessage,
  CampaignTemplate,
  NewCampaign,
  NewCustomer,
  QueryOptions,
  FilterOptions,
  DatabaseResponse,
  DatabaseListResponse
} from './types';

// Re-export types for convenience
export * from './types';

// Get Supabase client
function getSupabaseClient() {
  return createClient();
}

// Campaign functions
export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }

    return transformDatabaseResponse(data);
  } catch (error) {
    console.error('Error in getCampaignById:', error);
    return null;
  }
}

export async function getCampaignsByUserId(
  userId: string, 
  options: QueryOptions & FilterOptions = {}
): Promise<Campaign[]> {
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,message_body.ilike.%${options.search}%`);
    }

    if (options.dateFrom) {
      query = query.gte('created_at', options.dateFrom);
    }

    if (options.dateTo) {
      query = query.lte('created_at', options.dateTo);
    }

    // Apply ordering
    const orderBy = options.orderBy || 'created_at';
    const ascending = options.ascending !== undefined ? options.ascending : false;
    query = query.order(orderBy, { ascending });

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }

    return transformDatabaseResponse(data || []);
  } catch (error) {
    console.error('Error in getCampaignsByUserId:', error);
    return [];
  }
}

export async function createCampaign(campaign: NewCampaign): Promise<Campaign | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      return null;
    }

    return transformDatabaseResponse(data);
  } catch (error) {
    console.error('Error in createCampaign:', error);
    return null;
  }
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return null;
    }

    return transformDatabaseResponse(data);
  } catch (error) {
    console.error('Error in updateCampaign:', error);
    return null;
  }
}

export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCampaign:', error);
    return false;
  }
}

// Customer functions
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching customer:', error);
      return null;
    }

    return transformDatabaseResponse(data);
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    return null;
  }
}

export async function getCustomersByUserId(
  userId: string, 
  options: QueryOptions & FilterOptions = {}
): Promise<Customer[]> {
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.search) {
      query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%,phone.ilike.%${options.search}%`);
    }

    // Apply ordering
    const orderBy = options.orderBy || 'created_at';
    const ascending = options.ascending !== undefined ? options.ascending : false;
    query = query.order(orderBy, { ascending });

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return transformDatabaseResponse(data || []);
  } catch (error) {
    console.error('Error in getCustomersByUserId:', error);
    return [];
  }
}

export async function createCustomer(customer: NewCustomer): Promise<Customer | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return null;
    }

    return transformDatabaseResponse(data);
  } catch (error) {
    console.error('Error in createCustomer:', error);
    return null;
  }
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return null;
    }

    return transformDatabaseResponse(data);
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    return null;
  }
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    return false;
  }
}

// Get customers associated with a campaign through campaign_messages
export async function getCampaignCustomers(campaignId: string): Promise<Customer[]> {
  try {
    const supabase = getSupabaseClient();
    
    // Get customers through campaign_messages junction table
    const { data, error } = await supabase
      .from('campaign_messages')
      .select(`
        customer_id,
        customers (*)
      `)
      .eq('campaign_id', campaignId);

    if (error) {
      console.error('Error fetching campaign customers:', error);
      // Fallback: get all customers for the user if junction table doesn't exist
      const campaign = await getCampaignById(campaignId);
      if (campaign) {
        return await getCustomersByUserId(campaign.user_id);
      }
      return [];
    }

    // Extract customers from the join result and transform response
    const customers = data
      .map(item => item.customers)
      .filter(customer => customer !== null);
    
    return transformDatabaseResponse(customers) as Customer[];
  } catch (error) {
    console.error('Error in getCampaignCustomers:', error);
    // Fallback: get all customers for the campaign owner
    try {
      const campaign = await getCampaignById(campaignId);
      if (campaign) {
        return await getCustomersByUserId(campaign.user_id);
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
    return [];
  }
}