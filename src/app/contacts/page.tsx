"use client"

import { useState } from "react";
import { ClientSafeSidebar } from "@/components/client-safe-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContactTable } from "@/components/customers/contact-table";
import { ContactsStats } from "@/components/contacts/contacts-stats";
import { RealtimeBar } from "@/components/contacts/realtime-bar";
import { Pagination } from "@/components/contacts/pagination";
import { ContactsByStateChart } from "@/components/contacts/contacts-by-state-chart";
import { useContactsRealtime } from "@/hooks/use-contacts-realtime";
import { Plus, Upload, Search } from "lucide-react";

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  
  // Use the realtime contacts hook with pagination (5 contacts per page)
  const {
    contacts,
    stats,
    filteredContacts,
    paginatedContacts,
    loading,
    error,
    lastUpdated,
    currentPage,
    totalPages,
    itemsPerPage,
    refreshContacts,
    deleteContact,
    setCurrentPage,
    goToNextPage,
    goToPrevPage
  } = useContactsRealtime(searchQuery, selectedState, 5);

  return (
    <SidebarProvider>
      <ClientSafeSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-foreground">Contact Database</h1>
              <p className="text-muted-foreground mt-1 text-sm">Manage your contact database</p>
            </div>

            {/* Realtime Status Bar */}
            <RealtimeBar 
              lastUpdated={lastUpdated}
              onRefresh={refreshContacts}
              isRefreshing={loading}
            />

            {/* Contact Statistics & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
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
            <div className="bg-card rounded-lg border p-4 mb-4">
              <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-end">
                {/* Search Input */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Search Contacts
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 border text-sm"
                    />
                  </div>
                </div>

                {/* State Filter */}
                <div className="w-full lg:w-52">
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Filter by State
                  </label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="h-9 border text-sm">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="all" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">All States</SelectItem>
                      <SelectItem value="AL" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Alabama</SelectItem>
                      <SelectItem value="AK" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Alaska</SelectItem>
                      <SelectItem value="AZ" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Arizona</SelectItem>
                      <SelectItem value="AR" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Arkansas</SelectItem>
                      <SelectItem value="CA" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">California</SelectItem>
                      <SelectItem value="CO" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Colorado</SelectItem>
                      <SelectItem value="CT" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Connecticut</SelectItem>
                      <SelectItem value="DE" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Delaware</SelectItem>
                      <SelectItem value="FL" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Florida</SelectItem>
                      <SelectItem value="GA" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Georgia</SelectItem>
                      <SelectItem value="HI" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Hawaii</SelectItem>
                      <SelectItem value="ID" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Idaho</SelectItem>
                      <SelectItem value="IL" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Illinois</SelectItem>
                      <SelectItem value="IN" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Indiana</SelectItem>
                      <SelectItem value="IA" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Iowa</SelectItem>
                      <SelectItem value="KS" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Kansas</SelectItem>
                      <SelectItem value="KY" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Kentucky</SelectItem>
                      <SelectItem value="LA" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Louisiana</SelectItem>
                      <SelectItem value="ME" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Maine</SelectItem>
                      <SelectItem value="MD" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Maryland</SelectItem>
                      <SelectItem value="MA" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Massachusetts</SelectItem>
                      <SelectItem value="MI" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Michigan</SelectItem>
                      <SelectItem value="MN" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Minnesota</SelectItem>
                      <SelectItem value="MS" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Mississippi</SelectItem>
                      <SelectItem value="MO" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Missouri</SelectItem>
                      <SelectItem value="MT" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Montana</SelectItem>
                      <SelectItem value="NE" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Nebraska</SelectItem>
                      <SelectItem value="NV" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Nevada</SelectItem>
                      <SelectItem value="NH" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">New Hampshire</SelectItem>
                      <SelectItem value="NJ" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">New Jersey</SelectItem>
                      <SelectItem value="NM" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">New Mexico</SelectItem>
                      <SelectItem value="NY" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">New York</SelectItem>
                      <SelectItem value="NC" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">North Carolina</SelectItem>
                      <SelectItem value="ND" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">North Dakota</SelectItem>
                      <SelectItem value="OH" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Ohio</SelectItem>
                      <SelectItem value="OK" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Oklahoma</SelectItem>
                      <SelectItem value="OR" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Oregon</SelectItem>
                      <SelectItem value="PA" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Pennsylvania</SelectItem>
                      <SelectItem value="RI" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Rhode Island</SelectItem>
                      <SelectItem value="SC" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">South Carolina</SelectItem>
                      <SelectItem value="SD" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">South Dakota</SelectItem>
                      <SelectItem value="TN" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Tennessee</SelectItem>
                      <SelectItem value="TX" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Texas</SelectItem>
                      <SelectItem value="UT" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Utah</SelectItem>
                      <SelectItem value="VT" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Vermont</SelectItem>
                      <SelectItem value="VA" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Virginia</SelectItem>
                      <SelectItem value="WA" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Washington</SelectItem>
                      <SelectItem value="WV" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">West Virginia</SelectItem>
                      <SelectItem value="WI" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Wisconsin</SelectItem>
                      <SelectItem value="WY" className="text-gray-900 hover:bg-gray-50 focus:bg-gray-100">Wyoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" className="h-9 px-3 text-sm">
                    <Plus className="w-3 h-3 mr-1.5" />
                    Add
                  </Button>
                  <Button size="sm" variant="outline" className="h-9 px-3 text-sm">
                    <Upload className="w-3 h-3 mr-1.5" />
                    Import
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact List Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              {error ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-red-600 mb-2">{error}</p>
                    <Button onClick={refreshContacts} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <ContactTable 
                    searchQuery={searchQuery} 
                    selectedState={selectedState}
                    contacts={paginatedContacts}
                    loading={loading}
                    error={error}
                    onDeleteContact={deleteContact}
                  />
                  
                  {/* Pagination */}
                  {filteredContacts.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredContacts.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      onPrevPage={goToPrevPage}
                      onNextPage={goToNextPage}
                      loading={loading}
                    />
                  )}
                </>
              )}
            </div>

            {/* Quick Stats Summary */}
            {!loading && !error && filteredContacts.length > 0 && (
              <div className="mt-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {filteredContacts.length !== stats.total && `Filtered: ${filteredContacts.length} contacts`}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedState !== "all" && ` in ${selectedState}`}
                  {filteredContacts.length !== stats.total && ` • Total: ${stats.total} contacts`}
                </p>
              </div>
            )}

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}