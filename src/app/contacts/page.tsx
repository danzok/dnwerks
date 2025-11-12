"use client"

import { useState } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VercelDataTable, createContactColumns } from "@/components/contacts/vercel-data-table";
import { ContactsStats } from "@/components/contacts/contacts-stats";
import { RealtimeBar } from "@/components/contacts/realtime-bar";
import { ContactsByStateChart } from "@/components/contacts/contacts-by-state-chart";
import { useContactsRealtime } from "@/hooks/use-contacts-realtime";
import { Plus, Upload, Search } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { TagInput } from "@/components/contacts/tag-input";
import { Pagination } from "@/components/contacts/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from "sonner";
import { processPhoneNumber } from "@/lib/utils/phone";

// US States constant
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    state: '',
    status: 'active',
    address: '',
    notes: '',
    tags: [] as string[]
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Use the realtime contacts hook with tag filtering and pagination
  const {
    contacts,
    stats,
    filteredContacts,
    loading,
    error,
    lastUpdated,
    refreshContacts,
    deleteContact,
    availableTags,
    pagination,
    setPage
  } = useContactsRealtime(searchQuery, selectedState, selectedTags);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
        };
      case 'paused':
        return {
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
        };
      case 'completed':
        return {
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
        };
    }
  };

  // Form handler functions
  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      state: '',
      status: 'active',
      address: '',
      notes: '',
      tags: []
    });
    setFormErrors({});
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    
    // Auto-detect state from area code
    const phoneResult = processPhoneNumber(value);
    if (phoneResult.isValid && phoneResult.state && !formData.state) {
      setFormData(prev => ({ ...prev, state: phoneResult.state! }));
    }
    
    // Clear phone error if it exists
    if (formErrors.phone) {
      setFormErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate phone (required)
    const phoneResult = processPhoneNumber(formData.phone);
    if (!phoneResult.isValid) {
      newErrors.phone = phoneResult.error || 'Invalid phone number';
    }
    
    // Validate email format if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormLoading(true);
    
    try {
      const phoneResult = processPhoneNumber(formData.phone);
      
      const contactData = {
        phone: phoneResult.formatted,
        firstName: formData.first_name.trim() || null,
        lastName: formData.last_name.trim() || null,
        email: formData.email.trim() || null,
        company: formData.company.trim() || null,
        state: formData.state || phoneResult.state || null,
        status: formData.status,
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
        tags: formData.tags
      };
      
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409) {
          setFormErrors({ phone: 'This phone number already exists' });
          return;
        }
        throw new Error(error.message || 'Failed to create contact');
      }
      
      toast.success('Contact added successfully!');
      
      // Reset form and close dialog
      resetForm();
      setShowContactForm(false);
      setEditingContact(null);
      
      // Refresh contacts list
      refreshContacts();
      
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Failed to add contact. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-[#FAFAFA] dark:bg-black">
          <div className="max-w-7xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">Contact Database</h1>
              <p className="text-sm text-[#666666] dark:text-[#888888] mt-1">Manage your contact database and customer information</p>
            </div>

            {/* Realtime Status Bar */}
            <RealtimeBar 
              lastUpdated={lastUpdated}
              onRefresh={refreshContacts}
              isRefreshing={loading}
            />

            {/* Contact Statistics & Analytics */}
            <div className="grid gap-4 lg:grid-cols-3 mb-6">
              {/* Statistics take 2 columns */}
              <div className="lg:col-span-2">
                <ContactsStats stats={stats} loading={loading} />
              </div>
              {/* Chart takes 1 column */}
              <div className="lg:col-span-1">
                <ContactsByStateChart contacts={contacts} loading={loading} />
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] rounded-xl p-6 mb-4">
              <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-end">
                {/* Search Input */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#999999] dark:text-[#666666] uppercase tracking-wide mb-1.5">
                    Search Contacts
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
                    />
                  </div>
                </div>

                {/* State Filter */}
                <div className="w-full lg:w-52">
                  <label className="block text-xs font-medium text-[#999999] dark:text-[#666666] uppercase tracking-wide mb-1.5">
                    Filter by State
                  </label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by state" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-background border-[#EAEAEA] dark:border-border shadow-lg">
                      <SelectItem value="all" className="text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-900">All States</SelectItem>
                      <SelectItem value="active" className="text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-900">Active</SelectItem>
                      <SelectItem value="paused" className="text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-900">Paused</SelectItem>
                      <SelectItem value="completed" className="text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-900">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tag Filter */}
                <div className="w-full lg:w-64">
                  <label className="block text-xs font-medium text-[#999999] dark:text-[#666666] uppercase tracking-wide mb-1.5">
                    Filter by Tags
                  </label>
                  <MultiSelect
                    options={availableTags.map(tag => ({ value: tag, label: tag }))}
                    selected={selectedTags}
                    onChange={setSelectedTags}
                    placeholder="Filter by tags..."
                    searchable={true}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" className="h-9 px-3 text-sm" onClick={() => setShowContactForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                  <Button size="sm" variant="outline" className="h-9 px-3 text-sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact List Table */}
            <div className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] rounded-xl">
              <div>
                <div className="overflow-x-auto">
                  <VercelDataTable
                    columns={createContactColumns(deleteContact || undefined)}
                    data={filteredContacts}
                    loading={loading}
                    error={error || undefined}
                    onDeleteContact={deleteContact}
                  />
                </div>
              </div>
              
            </div>

            {/* Quick Stats Summary */}
            {!loading && !error && filteredContacts.length > 0 && (
              <div className="mt-3 text-center">
                <p className="text-xs text-[#666666] dark:text-[#999999]">
                  {filteredContacts.length !== stats.total && `Filtered: ${filteredContacts.length} contacts`}
                  {filteredContacts.length !== stats.total && ` • Total: ${stats.total} contacts`}
                  {selectedState !== "all" && ` in ${selectedState}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
                  {pagination.total > pagination.limit && ` (Page ${pagination.page} of ${pagination.totalPages})`}
                </p>
              </div>
            )}

            {/* Contact Detail Form */}
            <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
              <DialogContent className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">
                    {editingContact ? 'Edit Contact' : 'Add New Contact'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-[#666666] dark:text-[#888888]">
                    {editingContact
                      ? 'Update the contact information below.'
                      : 'Fill in the contact details below to add a new contact.'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <Label htmlFor="first_name" className="text-sm font-medium text-black dark:text-white">
                        First Name
                      </Label>
                      <Input
                        id="first_name"
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <Label htmlFor="last_name" className="text-sm font-medium text-black dark:text-white">
                        Last Name
                      </Label>
                      <Input
                        id="last_name"
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-black dark:text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white ${formErrors.email ? 'border-red-500' : ''}`}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-black dark:text-white">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white ${formErrors.phone ? 'border-red-500' : ''}`}
                        required
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Company */}
                    <div>
                      <Label htmlFor="company" className="text-sm font-medium text-black dark:text-white">
                        Company
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-black dark:text-white">
                        State
                      </Label>
                      <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-background border-[#EAEAEA] dark:border-border">
                          {US_STATES.map((state) => (
                            <SelectItem
                              key={state.code}
                              value={state.code}
                              className="text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-900"
                            >
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div>
                      <Label htmlFor="status" className="text-sm font-medium text-black dark:text-white">
                        Status
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                        <SelectTrigger className="mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-background border-[#EAEAEA] dark:border-border">
                          <SelectItem
                            value="active"
                            className="text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-900"
                          >
                            Active
                          </SelectItem>
                          <SelectItem
                            value="paused"
                            className="text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-900"
                          >
                            Paused
                          </SelectItem>
                          <SelectItem
                            value="completed"
                            className="text-gray-900 dark:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-900"
                          >
                            Completed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-sm font-medium text-black dark:text-white">
                        Address
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white"
                      />
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2">
                      <Label htmlFor="tags" className="text-sm font-medium text-black dark:text-white">
                        Tags
                      </Label>
                      <TagInput
                        value={formData.tags}
                        onChange={(tags) => setFormData({...formData, tags})}
                        placeholder="Add tags..."
                        suggestions={availableTags}
                        maxTags={10}
                      />
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-black dark:text-white">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="mt-1 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333] text-black dark:text-white"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowContactForm(false)
                        setEditingContact(null)
                        resetForm()
                      }}
                      className="border-[#EAEAEA] dark:border-[#333333] text-[#666666] dark:text-[#888888] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={formLoading}>
                      {formLoading ? 'Saving...' : (editingContact ? 'Update Contact' : 'Add Contact')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
