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
import { Workflow, Plus, Edit, Trash2, Power, PowerOff, Play, Pause } from "lucide-react"

interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_type: 'send_message' | 'add_tag' | 'remove_tag' | 'delay' | 'condition';
  step_order: number;
  step_data: any;
  created_at: string;
}

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger_type: 'incoming_message' | 'keyword' | 'time_based' | 'contact_added';
  trigger_value?: string;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  steps?: WorkflowStep[];
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<AutomationWorkflow | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    trigger_type: 'incoming_message' | 'keyword' | 'time_based' | 'contact_added';
    trigger_value: string;
    is_active: boolean;
  }>({
    name: '',
    description: '',
    trigger_type: 'incoming_message',
    trigger_value: '',
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

      // User is authenticated, fetch workflows
      await fetchWorkflows();
    };

    checkAuth();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setError('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingWorkflow) {
        // Update existing workflow
        const { error } = await supabase
          .from('automation_workflows')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingWorkflow.id);

        if (error) throw error;
        setSuccess('Workflow updated successfully!');
      } else {
        // Create new workflow
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { error } = await supabase
          .from('automation_workflows')
          .insert({
            ...formData,
            user_id: user.id
          });

        if (error) throw error;
        setSuccess('Workflow created successfully!');
      }

      // Reset form and refresh list
      setFormData({
        name: '',
        description: '',
        trigger_type: 'incoming_message',
        trigger_value: '',
        is_active: true
      });
      setEditingWorkflow(null);
      setIsCreateDialogOpen(false);
      await fetchWorkflows();
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      setError(error.message || 'Failed to save workflow');
    }
  };

  const handleEdit = (workflow: AutomationWorkflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description,
      trigger_type: workflow.trigger_type,
      trigger_value: workflow.trigger_value || '',
      is_active: workflow.is_active
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('automation_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Workflow deleted successfully!');
      await fetchWorkflows();
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      setError(error.message || 'Failed to delete workflow');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_workflows')
        .update({ 
          is_active: !isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchWorkflows();
    } catch (error: any) {
      console.error('Error toggling workflow:', error);
      setError(error.message || 'Failed to update workflow');
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case 'incoming_message': return 'Incoming Message';
      case 'keyword': return 'Keyword Match';
      case 'time_based': return 'Time Based';
      case 'contact_added': return 'Contact Added';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load your workflows.</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Workflows</h1>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingWorkflow(null);
                  setFormData({
                    name: '',
                    description: '',
                    trigger_type: 'incoming_message',
                    trigger_value: '',
                    is_active: true
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
                  </DialogTitle>
                  <DialogDescription>
                    Set up automated workflows for your SMS campaigns
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Welcome Series"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this workflow does..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trigger_type">Trigger Type</Label>
                    <Select
                      value={formData.trigger_type}
                      onValueChange={(value: 'incoming_message' | 'keyword' | 'time_based' | 'contact_added') => 
                        setFormData(prev => ({ ...prev, trigger_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="incoming_message">Incoming Message</SelectItem>
                        <SelectItem value="keyword">Keyword Match</SelectItem>
                        <SelectItem value="time_based">Time Based</SelectItem>
                        <SelectItem value="contact_added">Contact Added</SelectItem>
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
                        placeholder="e.g., subscribe, info, help"
                        required
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable this workflow
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
                      {editingWorkflow ? 'Update' : 'Create'}
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
              <Workflow className="h-5 w-5 text-muted-foreground" />
              Your Workflows ({workflows.length})
            </CardTitle>
            <CardDescription>
              Automated workflows for your SMS campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflows.length === 0 ? (
                <div className="text-center py-8">
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No workflows found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first workflow to automate your SMS campaigns
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              ) : (
                workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-medium text-gray-900">{workflow.name}</div>
                        <Badge variant={workflow.is_active ? "default" : "secondary"}>
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {getTriggerTypeLabel(workflow.trigger_type)}
                        </Badge>
                      </div>
                      {workflow.description && (
                        <div className="text-sm text-gray-600 mb-2">
                          {workflow.description}
                        </div>
                      )}
                      {workflow.trigger_type === 'keyword' && workflow.trigger_value && (
                        <div className="text-sm text-gray-500 mb-1">
                          Trigger: {workflow.trigger_value}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Created: {new Date(workflow.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(workflow.id, workflow.is_active)}
                      >
                        {workflow.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(workflow)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(workflow.id)}
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