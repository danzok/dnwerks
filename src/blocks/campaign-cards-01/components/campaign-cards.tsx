import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Calendar, 
  Users, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Edit, 
  Trash2, 
  MessageSquare 
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "sending" | "completed" | "failed";
  messageBody: string;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  scheduledAt?: string;
  createdAt: string;
}

interface CampaignCardsProps {
  campaigns: Campaign[];
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (id: string) => void;
  onTest?: (id: string) => void;
  onSend?: (id: string) => void;
  className?: string;
}

export function CampaignCards({ 
  campaigns, 
  onEdit, 
  onDelete, 
  onTest, 
  onSend, 
  className = "" 
}: CampaignCardsProps) {
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
        return <Clock className="h-3 w-3" />;
      case "scheduled":
        return <Calendar className="h-3 w-3" />;
      case "sending":
        return <Send className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "failed":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatMessage = (message: string) => {
    if (message.length <= 80) return message;
    return message.substring(0, 80) + "...";
  };

  const getDeliveryRate = (campaign: Campaign) => {
    return campaign.totalRecipients > 0 
      ? ((campaign.deliveredCount || 0) / campaign.totalRecipients) * 100 
      : 0;
  };

  return (
    <div className={`*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {campaigns.map((campaign) => {
        const deliveryRate = getDeliveryRate(campaign);
        
        return (
          <Card key={campaign.id} className="@container/card flex flex-col" data-slot="card">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <CardDescription className="line-clamp-1">{campaign.name}</CardDescription>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(campaign)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {campaign.status === "draft" && (
                      <>
                        <DropdownMenuItem onClick={() => onTest?.(campaign.id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Test
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSend?.(campaign.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Send Now
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete?.(campaign.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
                {campaign.totalRecipients?.toLocaleString() || "0"} Recipients
              </CardTitle>
              
              <CardAction>
                <Badge variant="outline" className={`${getStatusColor(campaign.status)} border-0`}>
                  {getStatusIcon(campaign.status)}
                  <span className="ml-1 capitalize">{campaign.status}</span>
                </Badge>
              </CardAction>
            </CardHeader>
            
            <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
              <div className="line-clamp-2 flex gap-2 font-medium w-full">
                <MessageSquare className="size-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{formatMessage(campaign.messageBody)}</span>
              </div>
              <div className="text-muted-foreground w-full flex justify-between items-center">
                <span>{campaign.sentCount || 0} sent</span>
                <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
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
      })}
    </div>
  );
}

// Example usage component
export function ExampleCampaignCards() {
  const sampleCampaigns: Campaign[] = [
    {
      id: "1",
      name: "Welcome Series",
      status: "completed",
      messageBody: "Welcome to our service! We're excited to have you on board. Here's what you can expect...",
      totalRecipients: 1250,
      sentCount: 1250,
      deliveredCount: 1198,
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: "2", 
      name: "Product Launch",
      status: "draft",
      messageBody: "🚀 Exciting news! Our new product is launching soon. Be the first to know about exclusive features and early access.",
      totalRecipients: 850,
      sentCount: 0,
      deliveredCount: 0,
      createdAt: "2024-01-20T14:15:00Z"
    },
    {
      id: "3",
      name: "Holiday Promotion",
      status: "scheduled", 
      messageBody: "🎉 Special holiday offer just for you! Save 30% on all premium plans. Limited time only.",
      totalRecipients: 2100,
      sentCount: 0,
      deliveredCount: 0,
      scheduledAt: "2024-12-24T09:00:00Z",
      createdAt: "2024-01-18T16:45:00Z"
    }
  ];

  const handleEdit = (campaign: Campaign) => {
    console.log("Edit campaign:", campaign.name);
  };

  const handleDelete = (id: string) => {
    console.log("Delete campaign:", id);
  };

  const handleTest = (id: string) => {
    console.log("Send test for campaign:", id);
  };

  const handleSend = (id: string) => {
    console.log("Send campaign:", id);
  };

  return (
    <CampaignCards 
      campaigns={sampleCampaigns}
      onEdit={handleEdit}
      onDelete={handleDelete} 
      onTest={handleTest}
      onSend={handleSend}
    />
  );
}