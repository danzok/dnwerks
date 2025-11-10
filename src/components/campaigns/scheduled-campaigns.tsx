"use client";

import { useState } from "react";
import { Calendar, Clock, Users, Play, Pause, RotateCcw, X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampaignUI } from "@/lib/ui-types";
import { Campaign } from "@/lib/schema";
import { useCampaignScheduler, useScheduledCampaigns } from "@/hooks/use-campaign-scheduler";
import { formatDistanceToNow } from "date-fns";

interface ScheduledCampaignsProps {
  userId: string;
  onEditCampaign: (campaign: CampaignUI) => void;
}

export function ScheduledCampaigns({ userId, onEditCampaign }: ScheduledCampaignsProps) {
  const { scheduledCampaigns, isLoading, refetch } = useScheduledCampaigns(userId);
  const { isScheduling, rescheduleCampaign, cancelCampaign, error, clearError } = useCampaignScheduler(userId);
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    isOpen: boolean;
    campaign: CampaignUI | null;
  }>({
    isOpen: false,
    campaign: null,
  });
  const [newScheduledAt, setNewScheduledAt] = useState("");

  const handleReschedule = async () => {
    if (!rescheduleDialog.campaign) return;

    try {
      // Convert UI type to database type
      const campaign: Campaign = {
        id: rescheduleDialog.campaign.id,
        user_id: rescheduleDialog.campaign.userId,
        name: rescheduleDialog.campaign.name,
        message_body: rescheduleDialog.campaign.messageBody,
        status: rescheduleDialog.campaign.status,
        scheduled_at: rescheduleDialog.campaign.scheduledAt,
        sent_at: rescheduleDialog.campaign.sentAt,
        total_recipients: rescheduleDialog.campaign.totalRecipients,
        sent_count: rescheduleDialog.campaign.sentCount,
        delivered_count: rescheduleDialog.campaign.deliveredCount,
        failed_count: rescheduleDialog.campaign.failedCount,
        created_at: rescheduleDialog.campaign.createdAt,
        updated_at: rescheduleDialog.campaign.updatedAt,
      };

      await rescheduleCampaign(
        campaign,
        [], // Would need to fetch customers
        new Date(newScheduledAt)
      );
      setRescheduleDialog({ isOpen: false, campaign: null });
      setNewScheduledAt("");
      refetch();
    } catch (error) {
      console.error("Failed to reschedule campaign:", error);
    }
  };

  const handleCancel = async (campaignId: string) => {
    try {
      await cancelCampaign(campaignId);
      refetch();
    } catch (error) {
      console.error("Failed to cancel campaign:", error);
    }
  };

  const openRescheduleDialog = (campaign: CampaignUI) => {
    setRescheduleDialog({ isOpen: true, campaign });
    setNewScheduledAt(
      campaign.scheduledAt
        ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
        : ""
    );
  };

  const getTimeUntilScheduled = (scheduledAt: Date) => {
    try {
      const now = new Date();
      const scheduled = new Date(scheduledAt);

      if (scheduled <= now) {
        return "Starting now...";
      }

      return `Starts ${formatDistanceToNow(scheduled, { addSuffix: true })}`;
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadge = (campaign: Campaign) => {
    const scheduled = new Date(campaign.scheduled_at || 0);
    const now = new Date();

    if (scheduled <= now) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Play className="w-3 h-3 mr-1" />
          Starting
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-800">
        <Clock className="w-3 h-3 mr-1" />
        Scheduled
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Scheduled Campaigns</h2>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scheduled Campaigns</h2>
        <div className="text-sm text-gray-500">
          {scheduledCampaigns.length} campaign{scheduledCampaigns.length !== 1 ? "s" : ""} scheduled
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {scheduledCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Scheduled Campaigns
            </h3>
            <p className="text-gray-500 mb-6">
              Schedule campaigns to be sent at specific times. Create a new campaign and choose the "Schedule Campaign" option.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduledCampaigns.map((campaign) => (
            <Card key={campaign.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(campaign)}
                      <span className="text-sm text-gray-500">
                        {getTimeUntilScheduled(new Date(campaign.scheduled_at!))}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>
                      {campaign.scheduled_at
                        ? new Date(campaign.scheduled_at).toLocaleString()
                        : "Not scheduled"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{campaign.total_recipients?.toLocaleString() || 0} recipients</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>~{Math.ceil((campaign.total_recipients || 0) / 50)} minutes to send</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-gray-700 truncate">
                    {campaign.message_body}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRescheduleDialog({
                      id: campaign.id,
                      userId: campaign.user_id,
                      name: campaign.name,
                      messageBody: campaign.message_body,
                      status: campaign.status,
                      scheduledAt: campaign.scheduled_at,
                      sentAt: campaign.sent_at,
                      totalRecipients: campaign.total_recipients,
                      sentCount: campaign.sent_count,
                      deliveredCount: campaign.delivered_count,
                      failedCount: campaign.failed_count,
                      createdAt: campaign.created_at,
                      updatedAt: campaign.updated_at,
                    })}
                    disabled={isScheduling}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCampaign({
                      id: campaign.id,
                      userId: campaign.user_id,
                      name: campaign.name,
                      messageBody: campaign.message_body,
                      status: campaign.status,
                      scheduledAt: campaign.scheduled_at,
                      sentAt: campaign.sent_at,
                      totalRecipients: campaign.total_recipients,
                      sentCount: campaign.sent_count,
                      deliveredCount: campaign.delivered_count,
                      failedCount: campaign.failed_count,
                      createdAt: campaign.created_at,
                      updatedAt: campaign.updated_at,
                    })}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(campaign.id)}
                    disabled={isScheduling}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialog.isOpen}
        onOpenChange={(open) => setRescheduleDialog({ isOpen: open, campaign: null })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Campaign</DialogTitle>
          </DialogHeader>

          {rescheduleDialog.campaign && (
            <div className="space-y-4">
              <div>
                <Label>Campaign</Label>
                <p className="font-medium">{rescheduleDialog.campaign.name}</p>
              </div>

              <div>
                <Label htmlFor="scheduledAt">New Schedule Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={newScheduledAt}
                  onChange={(e) => setNewScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Campaign will be sent at the specified time
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setRescheduleDialog({ isOpen: false, campaign: null })}
                  disabled={isScheduling}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleReschedule}
                  disabled={isScheduling || !newScheduledAt}
                >
                  {isScheduling ? "Rescheduling..." : "Reschedule Campaign"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}