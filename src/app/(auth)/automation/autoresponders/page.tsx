"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Plus, Edit, Trash2, Power, PowerOff } from "lucide-react"

interface AutoResponder {
  id: string;
  name: string;
  trigger_type: 'keyword' | 'all_incoming' | 'time_based';
  trigger_value?: string;
  message_template: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function AutoRespondersPage() {
  const router = useRouter();
  const [autoresponders, setAutoresponders] = useState<AutoResponder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingResponder, setEditingResponder] = useState<AutoResponder | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    trigger_type: 'keyword' | 'all_incoming' | 'time_based';
    trigger_value: string;
    message_template: string;
    is_active: boolean;
  }>({
    name: '',
    trigger_type: 'keyword',
    trigger_value: '',
    message_template: '',
    is_active: true
  });

  const supabase = createClient();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // User is authenticated, fetch autoresponders
      await fetchAutoresponders();
    };

    checkAuth();
  }, []);

  const fetchAutoresponders = async () => {
    try {
      const { data, error } = await supabase
        .from('autoresponders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAutoresponders(data || []);
    } catch (error) {
      console.error('Error fetching autoresponders:', error);
      setError('Failed to fetch autoresponders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingResponder) {
        // Update existing autoresponder
        const { error } = await supabase
          .from('autoresponders')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResponder.id);

        if (error) throw error;
        setSuccess('Autoresponder updated successfully!');
      } else {
        // Create new autoresponder
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { error } = await supabase
          .from('autoresponders')
          .insert({
            ...formData,
            user_id: user.id
          });

        if (error) throw error;
        setSuccess('Autoresponder created successfully!');
      }

      // Reset form and refresh list
      setFormData({
        name: '',
        trigger_type: 'keyword',
        trigger_value: '',
        message_template: '',
        is_active: true
      });
      setEditingResponder(null);
      setIsCreateDialogOpen(false);
      await fetchAutoresponders();
    } catch (error: any) {
      console.error('Error saving autoresponder:', error);
      setError(error.message || 'Failed to save autoresponder');
    }
  };

  const handleEdit = (responder: AutoResponder) => {
    setEditingResponder(responder);
    setFormData({
      name: responder.name,
      trigger_type: responder.trigger_type,
      trigger_value: responder.trigger_value || '',
      message_template: responder.message_template,
      is_active: responder.is_active
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this autoresponder?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('autoresponders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Autoresponder deleted successfully!');
      await fetchAutoresponders();
    } catch (error: any) {
      console.error('Error deleting autoresponder:', error);
      setError(error.message || 'Failed to delete autoresponder');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('autoresponders')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchAutoresponders();
    } catch (error: any) {
      console.error('Error toggling autoresponder:', error);
      setError(error.message || 'Failed to update autoresponder');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load your autoresponders.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Autoresponders</h1>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingResponder(null);
                  setFormData({
                    name: '',
                    trigger_type: 'keyword',
                    trigger_value: '',
                    message_template: '',
                    is_active: true
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Autoresponder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingResponder ? 'Edit Autoresponder' : 'Create New Autoresponder'}
                  </DialogTitle>
                  <DialogDescription>
                    Set up automated responses to incoming messages
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Welcome Message"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trigger_type">Trigger Type</Label>
                    <Select
                      value={formData.trigger_type}
                      onValueChange={(value: 'keyword' | 'all_incoming' | 'time_based') => 
                        setFormData(prev => ({ ...prev, trigger_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keyword">Keyword Match</SelectItem>
                        <SelectItem value="all_incoming">All Incoming Messages</SelectItem>
                        <SelectItem value="time_based">Time Based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.trigger_type === 'keyword' && (
                    <div className="space-y-2">
                      <Label htmlFor="trigger_value">Keyword</Label>
                      <Input
                        id="trigger_value"
                        value={formData.trigger_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, trigger_value: e.target.value }))}
                        placeholder="e.g., hello, info, help"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="message_template">Message Template</Label>
                    <Textarea
                      id="message_template"
                      value={formData.message_template}
                      onChange={(e) => setFormData(prev => ({ ...prev, message_template: e.target.value }))}
                      placeholder="Enter your automated response message..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable this autoresponder
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingResponder ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              Your Autoresponders ({autoresponders.length})
            </CardTitle>
            <CardDescription>
              Automated responses to incoming messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {autoresponders.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No autoresponders found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first autoresponder to automate your responses
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Autoresponder
                  </Button>
                </div>
              ) : (
                autoresponders.map((responder) => (
                  <div key={responder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-medium text-gray-900">{responder.name}</div>
                        <Badge variant={responder.is_active ? "default" : "secondary"}>
                          {responder.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {responder.trigger_type === 'keyword' ? 'Keyword' : 
                           responder.trigger_type === 'all_incoming' ? 'All Messages' : 'Time Based'}
                        </Badge>
                      </div>
                      {responder.trigger_type === 'keyword' && responder.trigger_value && (
                        <div className="text-sm text-gray-500 mb-1">
                          Trigger: {responder.trigger_value}
                        </div>
                      )}
                      <div className="text-sm text-gray-600 mb-2">
                        {responder.message_template.length > 100 
                          ? `${responder.message_template.substring(0, 100)}...`
                          : responder.message_template
                        }
                      </div>
                      <div className="text-xs text-gray-400">
                        Created: {new Date(responder.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(responder.id, responder.is_active)}
                      >
                        {responder.is_active ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(responder)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(responder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}