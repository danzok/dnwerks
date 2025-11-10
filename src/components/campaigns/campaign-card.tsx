"use client";

import { useState } from "react";
import { MoreHorizontal, Calendar, Users, Send, CheckCircle, XCircle, Clock, Play, Edit, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Campaign } from "@/lib/schema";

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onSend: (id: string, scheduledFor?: string) => void;
}

export function CampaignCard({ campaign, onEdit, onDelete, onTest, onSend }: CampaignCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await onDelete(campaign.id);
      } catch (error) {
        console.error("Failed to delete campaign:", error);
        setIsDeleting(false);
      }
    }
  };

  const handleTest = async () => {
    setIsSendingTest(true);
    try {
      await onTest(campaign.id);
    } catch (error) {
      console.error("Failed to send test message:", error);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSend = async () => {
    if (campaign.total_recipients === 0) {
      alert("Please add recipients to this campaign before sending.");
      return;
    }

    if (window.confirm(`Are you sure you want to send this campaign to ${campaign.total_recipients} recipient${campaign.total_recipients !== 1 ? 's' : ''}?`)) {
      setIsSending(true);
      try {
        await onSend(campaign.id);
      } catch (error) {
        console.error("Failed to send campaign:", error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-muted text-foreground";
      case "scheduled":
        return "bg-campaign-pending text-campaign-pending-foreground";
      case "sending":
        return "bg-campaign-warning text-campaign-warning-foreground";
      case "completed":
        return "bg-campaign-success text-campaign-success-foreground";
      case "failed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "sending":
        return <Send className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const deliveryRate = campaign.total_recipients && campaign.total_recipients > 0
    ? ((campaign.delivered_count || 0) / campaign.total_recipients) * 100
    : 0;

  const formatMessage = (message: string) => {
    if (message.length <= 100) return message;
    return message.substring(0, 100) + "...";
  };

  return (
    <Card className="@container/card flex flex-col hover:shadow-md transition-all duration-200" data-slot="card">
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <CardDescription>{campaign.name}</CardDescription>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {campaign.status === "draft" && (
                <>
                  <DropdownMenuItem onClick={handleTest} disabled={isSendingTest}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isSendingTest ? "Sending..." : "Send Test"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSend} disabled={isSending || campaign.total_recipients === 0}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSending ? "Sending..." : "Send Now"}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
                disabled={isDeleting || campaign.status === "sending"}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
          {campaign.total_recipients?.toLocaleString() || "0"} Recipients
        </CardTitle>
        
        <CardAction>
          <Badge variant="outline" className={`${getStatusColor(campaign.status)} border-0`}>
            {getStatusIcon(campaign.status)}
            <span className="ml-1">{campaign.status}</span>
          </Badge>
        </CardAction>
      </CardHeader>
      
      <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
        <div className="line-clamp-2 flex gap-2 font-medium w-full">
          <MessageSquare className="size-4 flex-shrink-0 mt-0.5" />
          <span className="text-xs">{formatMessage(campaign.message_body)}</span>
        </div>
        <div className="text-muted-foreground w-full flex justify-between items-center">
          <span>{campaign.sent_count || 0} sent</span>
          <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
        </div>
        {deliveryRate > 0 && (
          <div className="w-full mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Delivery Rate</span>
              <span>{deliveryRate.toFixed(1)}%</span>
            </div>
            <Progress value={deliveryRate} className="h-1" />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}