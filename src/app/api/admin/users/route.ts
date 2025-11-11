import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase Admin Client with Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    console.log('📋 GET /api/admin/users - Fetching all users');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all user profiles
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Users fetched:', users?.length);
    return NextResponse.json({ data: users, error: null });
  } catch (error: any) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    console.log('➕ POST /api/admin/users - Creating new user');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, full_name, role = 'user' } = body;

    console.log('📝 Creating user:', { email, full_name, role });

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update role if admin
    if (role === 'admin') {
      await supabaseAdmin
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('user_id', authData.user.id);
    }

    // Fetch created profile
    const { data: newProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    return NextResponse.json({
      data: newProfile || authData.user,
      error: null
    });
  } catch (error: any) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ PUT /api/admin/users - Updating user');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, full_name, role } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📝 Updating user:', { user_id, full_name, role });

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ full_name, role })
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    console.log('✅ User updated successfully');
    return NextResponse.json({ data: updatedProfile, error: null });
  } catch (error: any) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/admin/users - Deleting user');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    console.log('🗑️ Deleting user:', userId);

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    console.log('✅ User deleted successfully');
    return NextResponse.json({ data: { success: true }, error: null });
  } catch (error: any) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}