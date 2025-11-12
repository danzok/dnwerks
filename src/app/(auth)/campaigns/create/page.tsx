"use client";

import { Suspense, useState } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { CampaignFormSkeleton } from "@/components/campaigns/campaign-form-skeleton";
import { useContactsRealtime } from "@/hooks/use-contacts-realtime";
import { getUniqueSortedStrings } from "@/lib/utils";
import { ArrowLeft, Plus, MessageSquare, Users, Calendar, Target, Link as LinkIcon, MapPin } from "lucide-react";
import Link from "next/link";

export default function CreateCampaignPage() {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [singlePhoneNumber, setSinglePhoneNumber] = useState("");
  const [scheduleOption, setScheduleOption] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{name: string, content: string} | null>(null);
  const [customTemplates, setCustomTemplates] = useState<{name: string, content: string}[]>([
    { name: "Sale", content: "Hi {firstName}! 🎉 Special offer just for you - get 25% off your next purchase with code SAVE25. Shop now: {link} Reply STOP to opt out." },
    { name: "Reminder", content: "Hi {firstName}, don't forget about your appointment tomorrow at 2 PM. Need to reschedule? Call us or visit {link} Reply STOP to opt out." },
    { name: "Welcome", content: "Welcome {firstName}! 👋 Thanks for joining us. Here's your 15% welcome discount: code WELCOME15. Start shopping: {link} Reply STOP to opt out." }
  ]);
  
  // Get contacts data
  const { contacts, stats, loading } = useContactsRealtime("", selectedState);

  // Validate phone number format
  const isValidPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Check if it's 10 or 11 digits (with or without country code)
    return digits.length === 10 || digits.length === 11;
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  // Calculate contact count based on selection
  const getContactCount = () => {
    if (loading) return 0;
    if (selectedRecipients === "single") {
      return isValidPhoneNumber(singlePhoneNumber) ? 1 : 0;
    }
    if (selectedRecipients === "all") return stats.total;
    if (selectedRecipients === "active") return stats.active;
    if (selectedRecipients === "state") {
      const stateContacts = contacts.filter(contact => contact.state === selectedState);
      return stateContacts.length;
    }
    return 0;
  };
  
  const contactCount = getContactCount();

  // Calculate SMS metrics
  const characterCount = messageContent.length;
  const smsSegments = Math.ceil(characterCount / 160) || 1;
  const estimatedCost = smsSegments * 0.0075; // $0.0075 per segment via Twilio
  const totalCost = contactCount * estimatedCost;
  
  // SMS length validation
  const isWithinSingleSMS = characterCount <= 160;
  const isOverLimit = characterCount > 320; // 2 SMS segments max recommended
  const charactersRemaining = 160 - (characterCount % 160);
  const isNearLimit = charactersRemaining <= 20 && characterCount <= 160;
  
  // Format numbers consistently for hydration
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate campaign progress percentage
  const getProgressPercentage = () => {
    let completedSteps = 0;
    const totalSteps = 4;
    
    // Campaign Name
    if (campaignName.trim().length > 0) completedSteps++;
    
    // Message Content (at least 10 characters and not over limit)
    if (messageContent.length >= 10 && !isOverLimit) completedSteps++;
    
    // Recipients
    if (contactCount > 0) completedSteps++;
    
    // Schedule
    if (scheduleOption === 'now' || (scheduleOption === 'later' && scheduledDate && scheduledTime)) {
      completedSteps++;
    }
    
    return (completedSteps / totalSteps) * 100;
  };

  // Campaign builder utilities
  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
      textarea.value = newValue;
      setMessageContent(newValue);
      
      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  // Simplified template insertion - removed complex template management
  const insertTemplate = (template: {name: string, content: string}) => {
    setMessageContent(template.content);
    const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = template.content;
      textarea.focus();
    }
  };

  // Template management functions
  const addNewTemplate = () => {
    setEditingTemplate({ name: '', content: '' });
    setShowTemplateDialog(true);
  };

  const startEditTemplate = (template: {name: string, content: string}) => {
    setEditingTemplate(template);
    setMessageContent(template.content);
    setShowTemplateDialog(true);
  };

  const saveTemplate = () => {
    if (!editingTemplate || !editingTemplate.name.trim() || !messageContent.trim()) return;
    
    const newTemplate = {
      name: editingTemplate.name.trim(),
      content: messageContent.trim()
    };
    
    // Check if template with this name already exists
    const existingIndex = customTemplates.findIndex(t => t.name === newTemplate.name);
    
    if (existingIndex >= 0) {
      // Update existing template
      const updatedTemplates = [...customTemplates];
      updatedTemplates[existingIndex] = newTemplate;
      setCustomTemplates(updatedTemplates);
    } else {
      // Add new template
      setCustomTemplates([...customTemplates, newTemplate]);
    }
    
    // Reset and close dialog
    setEditingTemplate(null);
    setShowTemplateDialog(false);
    setMessageContent('');
  };

  const deleteTemplate = (templateName: string) => {
    setCustomTemplates(customTemplates.filter(t => t.name !== templateName));
  };

  const generateShortLink = async () => {
    if (!linkUrl.trim()) return;
    
    setIsGeneratingLink(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const shortUrl = `https://sms.ly/${Math.random().toString(36).substring(2, 8)}`;
      insertVariable(shortUrl);
      setShowLinkDialog(false);
      setLinkUrl("");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-background">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">

            {/* Simple Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/campaigns">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
                  <p className="text-muted-foreground mt-1 text-sm">Design and send your SMS campaign</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => window.location.href = '/contacts'}>
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base mb-1">Contacts</CardTitle>
                  <CardDescription className="text-xs">
                    Select your target audience
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs" onClick={() => window.location.href = '/campaigns/create'}>
                      Schedule
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base mb-1">Schedule</CardTitle>
                  <CardDescription className="text-xs">
                    Set campaign delivery time
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Campaign Form - Takes 2 columns on desktop */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Campaign Details */}
                <Card className="border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      Campaign Details
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Basic information and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="campaign-name" className="text-xs font-medium text-foreground mb-1.5 block">
                          Campaign Name *
                        </label>
                        <input
                          type="text"
                          id="campaign-name"
                          placeholder="e.g., Spring Sale 2025 - Weekend Blast"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          className="w-full h-9 px-3 text-sm border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-ring"
                        />
                      </div>
                      <div>
                        <label htmlFor="message-content" className="text-xs font-medium text-foreground mb-1.5 block">
                          Message Content *
                        </label>
                        <div className="relative">
                          <textarea
                            id="message-content"
                            placeholder="Hi {firstName}, get 25% off this weekend! Use code SAVE25. Visit {link} - Reply STOP to opt out."
                            rows={4}
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            maxLength={500} // Hard limit to prevent extremely long messages
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-ring focus:border-ring resize-none ${
                              isOverLimit 
                                ? 'border-red-500 bg-red-50 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/20' 
                                : isNearLimit 
                                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 focus:border-yellow-500 focus:ring-yellow-200 dark:focus:ring-yellow-900/20'
                                  : 'border-input bg-background'
                            }`}
                          />
                          {/* Character limit indicator in corner */}
                          <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                            isOverLimit 
                              ? 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                              : isNearLimit 
                                ? 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800'
                                : 'bg-muted text-muted-foreground border border-border'
                          }`}>
                            {characterCount}/160
                          </div>
                        </div>
                        <div className="mt-2 space-y-2">
                          {/* Character count and segments */}
                          <div className="flex justify-between items-center text-xs">
                            <span className={isOverLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}>
                              {characterCount <= 160 
                                ? `${160 - characterCount} characters remaining`
                                : `${characterCount - 160} characters over limit`
                              }
                            </span>
                            <span className={smsSegments > 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}>
                              {smsSegments} SMS part{smsSegments > 1 ? 's' : ''} • ${estimatedCost.toFixed(4)}
                            </span>
                          </div>
                          
                          {/* Warnings and alerts */}
                          {isOverLimit && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                              <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
                              <div className="text-xs text-red-700 dark:text-red-300">
                                <p className="font-medium mb-1">Message too long!</p>
                                <p>Messages over 320 characters may have delivery issues. Consider shortening your message for better results.</p>
                              </div>
                            </div>
                          )}
                          
                          {!isOverLimit && smsSegments > 1 && (
                            <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm">💡</span>
                              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                                <p className="font-medium mb-1">Multi-part SMS</p>
                                <p>Your message will be sent as {smsSegments} parts. Cost: ${(estimatedCost * contactCount).toFixed(2)} total.</p>
                              </div>
                            </div>
                          )}
                          
                          {isWithinSingleSMS && characterCount > 0 && (
                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                              <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                              <span>Perfect! Single SMS - optimal delivery and cost.</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Insert Buttons */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Quick Insert:</span>
                            <span className="text-xs text-muted-foreground">Click to add to message</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable('{firstName}')}
                              className="h-7 px-2 text-xs"
                            >
                              👤 First Name
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable('{lastName}')}
                              className="h-7 px-2 text-xs"
                            >
                              👥 Last Name
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowLinkDialog(true)}
                              className="h-7 px-2 text-xs"
                            >
                              🔗 Add Link
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable('Reply STOP to opt out')}
                              className="h-7 px-2 text-xs"
                            >
                              ✋ Opt-out
                            </Button>
                          </div>
                          
                          {/* Common Templates */}
                          <div className="pt-2 border-t border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-foreground">Quick Templates:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {/* Simplified template buttons - removed complex template management */}
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertVariable('{firstName}')}
                                  className="h-7 px-2 text-xs"
                                >
                                  👤 First Name
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertVariable('{lastName}')}
                                  className="h-7 px-2 text-xs"
                                >
                                  👥 Last Name
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowLinkDialog(true)}
                                  className="h-7 px-2 text-xs"
                                >
                                  🔗 Add Link
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertVariable('Reply STOP to opt out')}
                                  className="h-7 px-2 text-xs"
                                >
                                  ✋ Opt-out
                                </Button>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addNewTemplate}
                                className="h-6 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                              >
                                ➕ Add New
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recipients */}
                <Card className="border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Recipients
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Select your target audience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-xs text-muted-foreground">Loading contacts...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="single-number" 
                            name="recipients" 
                            value="single"
                            checked={selectedRecipients === "single"}
                            onChange={(e) => setSelectedRecipients(e.target.value)}
                            className="h-4 w-4 text-primary" 
                          />
                          <label htmlFor="single-number" className="text-sm font-medium text-foreground">
                            Send to Single Number
                          </label>
                        </div>
                        
                        {selectedRecipients === "single" && (
                          <div className="ml-6 space-y-2">
                            <Input
                              type="tel"
                              placeholder="(555) 123-4567"
                              value={singlePhoneNumber}
                              onChange={(e) => setSinglePhoneNumber(e.target.value)}
                              className="h-8 text-sm"
                            />
                            {singlePhoneNumber && !isValidPhoneNumber(singlePhoneNumber) && (
                              <p className="text-xs text-red-600">Please enter a valid 10-digit phone number</p>
                            )}
                            {singlePhoneNumber && isValidPhoneNumber(singlePhoneNumber) && (
                              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                                <span>Valid number: {formatPhoneNumber(singlePhoneNumber)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="all-contacts" 
                            name="recipients" 
                            value="all"
                            checked={selectedRecipients === "all"}
                            onChange={(e) => setSelectedRecipients(e.target.value)}
                            className="h-4 w-4 text-primary" 
                          />
                          <label htmlFor="all-contacts" className="text-sm font-medium text-foreground">
                            All Contacts ({formatNumber(stats.total)})
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            id="active-contacts" 
                            name="recipients" 
                            value="active"
                            checked={selectedRecipients === "active"}
                            onChange={(e) => setSelectedRecipients(e.target.value)}
                            className="h-4 w-4 text-primary" 
                          />
                          <label htmlFor="active-contacts" className="text-sm font-medium text-foreground">
                            Active Contacts Only ({formatNumber(stats.active)})
                          </label>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="state-contacts" 
                              name="recipients" 
                              value="state"
                              checked={selectedRecipients === "state"}
                              onChange={(e) => setSelectedRecipients(e.target.value)}
                              className="h-4 w-4 text-primary" 
                            />
                            <label htmlFor="state-contacts" className="text-sm font-medium text-foreground">
                              Filter by State
                            </label>
                          </div>
                          
                          {selectedRecipients === "state" && (
                            <div className="ml-6 space-y-2">
                              <Select value={selectedState} onValueChange={setSelectedState}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Choose state" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-background border-gray-200 dark:border-border">
                                  <SelectItem value="all">All States</SelectItem>
                                  {/* Get unique states from contacts */}
                                  {getUniqueSortedStrings(contacts.map(c => c.state)).map(state => (
                                    <SelectItem key={state} value={state}>
                                      {state} ({contacts.filter(c => c.state === state).length})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {selectedState && selectedState !== "all" && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{contacts.filter(c => c.state === selectedState).length} contacts in {selectedState}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Contact Preview */}
                        {contactCount > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                              <Users className="h-4 w-4" />
                              {formatNumber(contactCount)} recipients selected
                            </div>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              {selectedRecipients === "single" && "Single phone number for individual messaging"}
                              {selectedRecipients === "all" && "All contacts in your database"}
                              {selectedRecipients === "active" && "Only active contacts (excludes inactive/unsubscribed)"}
                              {selectedRecipients === "state" && selectedState && selectedState !== "all" && `Contacts in ${selectedState}`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Schedule */}
                <Card className="border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Schedule
                    </CardTitle>
                    <CardDescription className="text-xs">
                      When to send your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="send-now" 
                          name="schedule" 
                          value="now"
                          checked={scheduleOption === "now"}
                          onChange={(e) => setScheduleOption(e.target.value)}
                          className="h-4 w-4 text-primary" 
                        />
                        <label htmlFor="send-now" className="text-sm font-medium text-foreground">
                          Send Now
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="schedule-later" 
                          name="schedule" 
                          value="later"
                          checked={scheduleOption === "later"}
                          onChange={(e) => setScheduleOption(e.target.value)}
                          className="h-4 w-4 text-primary" 
                        />
                        <label htmlFor="schedule-later" className="text-sm font-medium text-foreground">
                          Schedule for Later
                        </label>
                      </div>
                      
                      {/* Schedule Date/Time */}
                      {scheduleOption === "later" && (
                        <div className="space-y-3 pt-3 border-t border-border">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label htmlFor="schedule-date" className="text-xs font-medium text-foreground mb-1 block">
                                Date
                              </label>
                              <input
                                type="date"
                                id="schedule-date"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full h-8 px-2 text-xs border border-input bg-background rounded-md"
                              />
                            </div>
                            <div>
                              <label htmlFor="schedule-time" className="text-xs font-medium text-foreground mb-1 block">
                                Time
                              </label>
                              <input
                                type="time"
                                id="schedule-time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full h-8 px-2 text-xs border border-input bg-background rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-border">
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-9 text-sm">
                          Save Draft
                        </Button>
                        <Button 
                          className="flex-1 h-9 text-sm"
                          disabled={
                            (selectedRecipients === "single" && !isValidPhoneNumber(singlePhoneNumber)) ||
                            messageContent.length === 0 ||
                            isOverLimit
                          }
                        >
                          {selectedRecipients === "single" ? "Send SMS" : (scheduleOption === "now" ? "Send Campaign" : "Schedule Campaign")}
                        </Button>
                      </div>
                      
                      {selectedRecipients === "single" && (
                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs text-amber-700 dark:text-amber-400">
                          💡 Tip: Single number sends are perfect for testing messages or individual communications
                        </div>
                      )}
                      
                      {isOverLimit && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs text-red-700 dark:text-red-400">
                          ⚠️ Cannot send: Message exceeds maximum length limit
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Sidebar - Takes 1 column on desktop */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Campaign Summary & Costs */}
                <Card className="border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Campaign Summary</CardTitle>
                    <CardDescription className="text-xs">
                      Costs and delivery details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Recipients</span>
                        <span className="text-sm font-medium">{formatNumber(contactCount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Message Length</span>
                        <span className="text-sm font-medium">{characterCount} chars</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">SMS Segments</span>
                        <span className="text-sm font-medium">{smsSegments} part{smsSegments > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">Cost per Message</span>
                        <span className="text-sm font-medium">${estimatedCost.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 bg-blue-50 dark:bg-blue-950/20 px-3 rounded-lg">
                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Cost (Twilio)</span>
                        <span className="text-lg font-bold text-blue-900 dark:text-blue-100">${totalCost.toFixed(2)}</span>
                      </div>
                      {scheduleOption === "later" && scheduledDate && scheduledTime && (
                        <div className="flex justify-between items-center py-2 bg-green-50 dark:bg-green-950/20 px-3 rounded-lg">
                          <span className="text-sm font-semibold text-green-900 dark:text-green-100">Scheduled</span>
                          <span className="text-sm font-medium text-green-900 dark:text-green-100">{scheduledDate} {scheduledTime}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Campaign Progress */}
                <Card className="border bg-card shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Campaign Progress</CardTitle>
                    <CardDescription className="text-xs">
                      Track your setup progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {/* Campaign Name */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Campaign Name</span>
                        <span className={`text-xs ${campaignName.trim().length > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                          {campaignName.trim().length > 0 ? '✓ Complete' : 'Pending'}
                        </span>
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Message Content</span>
                        <span className={`text-xs ${
                          isOverLimit 
                            ? 'text-red-600 dark:text-red-400'
                            : messageContent.length >= 10 
                              ? 'text-green-600 dark:text-green-400' 
                              : messageContent.length > 0
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-muted-foreground'
                        }`}>
                          {isOverLimit 
                            ? '❌ Too Long'
                            : messageContent.length >= 10 
                              ? '✓ Complete' 
                              : messageContent.length > 0
                                ? '📝 In Progress'
                                : 'Pending'}
                        </span>
                      </div>
                      
                      {/* Recipients */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Recipients</span>
                        <span className={`text-xs ${
                          contactCount > 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : selectedRecipients === 'single' && singlePhoneNumber && !isValidPhoneNumber(singlePhoneNumber)
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-muted-foreground'
                        }`}>
                          {contactCount > 0 
                            ? '✓ Complete'
                            : selectedRecipients === 'single' && singlePhoneNumber && !isValidPhoneNumber(singlePhoneNumber)
                              ? '❌ Invalid'
                              : 'Pending'}
                        </span>
                      </div>
                      
                      {/* Schedule */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Schedule</span>
                        <span className={`text-xs ${
                          scheduleOption === 'now' 
                            ? 'text-green-600 dark:text-green-400'
                            : scheduleOption === 'later' && scheduledDate && scheduledTime
                              ? 'text-green-600 dark:text-green-400'
                              : scheduleOption === 'later'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-muted-foreground'
                        }`}>
                          {scheduleOption === 'now' 
                            ? '✓ Send Now'
                            : scheduleOption === 'later' && scheduledDate && scheduledTime
                              ? '✓ Scheduled'
                              : scheduleOption === 'later'
                                ? '📅 In Progress'
                                : 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span>Overall Progress</span>
                        <span>{Math.round(getProgressPercentage())}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{ width: `${getProgressPercentage()}%` }}
                        ></div>
                      </div>
                      {getProgressPercentage() === 100 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                          <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                          <span>Ready to send!</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
            
            {/* Link Generation Dialog */}
            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base">Create Short Link</DialogTitle>
                  <DialogDescription className="text-sm">
                    Generate a trackable short URL for your campaign
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="link-url" className="text-xs font-medium">Full URL *</Label>
                    <Input
                      id="link-url"
                      type="url"
                      placeholder="https://yourbusiness.com/sale"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={generateShortLink}
                      disabled={!linkUrl.trim() || isGeneratingLink}
                      className="flex-1 h-9 text-sm"
                    >
                      {isGeneratingLink ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Generate & Insert
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowLinkDialog(false)}
                      className="h-9 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    💡 Tip: Short links help track clicks and fit better in SMS messages
                  </div>
                </div>
              </DialogContent>
            </Dialog>
  
            {/* Template Management Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-base">
                    {editingTemplate?.name ? 'Edit Template' : 'Manage Templates'}
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {editingTemplate?.name ? 'Edit your message template' : 'Create and manage your message templates'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {editingTemplate ? (
                    <div>
                      <div>
                        <Label htmlFor="template-name" className="text-xs font-medium">Template Name</Label>
                        <Input
                          id="template-name"
                          type="text"
                          placeholder="e.g., Special Sale"
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                          className="mt-1.5 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-content" className="text-xs font-medium">Message Content</Label>
                        <textarea
                          id="template-content"
                          placeholder="Hi {firstName}, get 25% off this weekend! Use code SAVE25. Visit {link} - Reply STOP to opt out."
                          rows={4}
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          maxLength={500}
                          className="w-full mt-1.5 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-foreground mb-3">Your Templates</div>
                      {customTemplates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <div className="text-4xl mb-2">📝</div>
                          <p className="text-sm">No custom templates yet</p>
                          <p className="text-xs text-muted-foreground mt-1">Create your first template to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {customTemplates.map((template, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm">{template.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{template.content}</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditTemplate(template)}
                                  className="h-7 px-2 text-xs"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteTemplate(template.name)}
                                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplateDialog(false)}
                      className="flex-1 h-9 text-sm"
                    >
                      {editingTemplate ? 'Cancel' : 'Close'}
                    </Button>
                    {editingTemplate && (
                      <Button
                        onClick={saveTemplate}
                        disabled={!editingTemplate.name.trim() || !messageContent.trim()}
                        className="flex-1 h-9 text-sm"
                      >
                        Save Template
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
  
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }