"use client"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Save, ArrowLeft, Send, Eye, Users, Calendar } from "lucide-react"

interface Campaign {
  id: string;
  name: string;
  description: string;
  message_content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  delivered_count: number;
  failed_count: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  status: 'active' | 'inactive';
}

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    message_content: '',
    scheduled_at: ''
  });

  const supabase = createClient();

  // Check if user is authenticated and fetch campaign
  useEffect(() => {
    const checkAuthAndFetchCampaign = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // User is authenticated, fetch campaign and contacts
      await Promise.all([
        fetchCampaign(campaignId, user.id),
        fetchContacts(user.id)
      ]);
    };

    checkAuthAndFetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async (id: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Campaign not found');
        } else {
          throw error;
        }
        return;
      }

      setCampaign(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        message_content: data.message_content,
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : ''
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError('Failed to fetch campaign');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData: any = {
        name: formData.name,
        description: formData.description,
        message_content: formData.message_content,
        updated_at: new Date().toISOString()
      };

      // Only update scheduled_at if provided and campaign is in draft status
      if (formData.scheduled_at && campaign?.status === 'draft') {
        updateData.scheduled_at = formData.scheduled_at;
        updateData.status = 'scheduled';
      }

      const { error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', campaignId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSuccess('Campaign updated successfully!');
      
      // Refresh campaign data
      await fetchCampaign(campaignId, user.id);
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      setError(error.message || 'Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!confirm('Are you sure you want to send this campaign now? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'sending',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSuccess('Campaign sent successfully!');
      router.push('/campaigns');
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      setError(error.message || 'Failed to send campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'scheduled': return <Badge variant="outline">Scheduled</Badge>;
      case 'sending': return <Badge className="bg-blue-100 text-blue-800">Sending</Badge>;
      case 'sent': return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load the campaign.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-4">The campaign you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/campaigns')}>
              Back to Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white dark:bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push('/campaigns')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-foreground">Edit Campaign</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <div className="flex items-center gap-2">
              {campaign.status === 'draft' && (
                <Button onClick={handleSendCampaign} variant="default">
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
              )}
              <Button onClick={() => router.push(`/campaigns/${campaignId}`)} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-800 dark:text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <AlertDescription className="text-green-800 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Edit your campaign information and message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Summer Sale Promotion"
                      required
                      disabled={campaign.status !== 'draft'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your campaign..."
                      rows={3}
                      disabled={campaign.status !== 'draft'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message_content">Message Content</Label>
                    <Textarea
                      id="message_content"
                      value={formData.message_content}
                      onChange={(e) => setFormData(prev => ({ ...prev, message_content: e.target.value }))}
                      placeholder="Enter your SMS message..."
                      rows={6}
                      required
                      disabled={campaign.status !== 'draft'}
                    />
                    <p className="text-sm text-muted-foreground">
                      {formData.message_content.length} characters (SMS limit: 160 characters per message)
                    </p>
                  </div>

                  {campaign.status === 'draft' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduled_at">Schedule Send (Optional)</Label>
                      <Input
                        id="scheduled_at"
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/campaigns')}
                    >
                      Cancel
                    </Button>
                    {campaign.status === 'draft' && (
                      <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Campaign Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recipients</span>
                  <span className="font-medium">{campaign.recipient_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Delivered</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{campaign.delivered_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{campaign.failed_count}</span>
                </div>
                {campaign.recipient_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Delivery Rate</span>
                    <span className="font-medium">
                      {Math.round((campaign.delivered_count / campaign.recipient_count) * 100)}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
                {campaign.scheduled_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scheduled</span>
                    <span className="text-sm">
                      {new Date(campaign.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {campaign.sent_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sent</span>
                    <span className="text-sm">
                      {new Date(campaign.sent_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}