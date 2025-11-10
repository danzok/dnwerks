"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Phone, Mail, Search } from "lucide-react";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state: string;
  status: "active" | "inactive";
  createdAt: Date;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    state: "CA",
    status: "active",
    createdAt: new Date("2024-01-15")
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@company.com",
    phone: "+1 (555) 234-5678",
    state: "NY",
    status: "active",
    createdAt: new Date("2024-02-20")
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Davis",
    email: "m.davis@business.net",
    phone: "+1 (555) 345-6789",
    state: "TX",
    status: "inactive",
    createdAt: new Date("2024-03-10")
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Wilson",
    email: "emily.w@email.com",
    phone: "+1 (555) 456-7890",
    state: "FL",
    status: "active",
    createdAt: new Date("2024-04-05")
  },
  {
    id: "5",
    firstName: "Robert",
    lastName: "Brown",
    email: "r.brown@company.org",
    phone: "+1 (555) 567-8901",
    state: "IL",
    status: "active",
    createdAt: new Date("2024-05-12")
  },
  {
    id: "6",
    firstName: "Jennifer",
    lastName: "Miller",
    email: "j.miller@business.com",
    phone: "+1 (555) 678-9012",
    state: "WA",
    status: "inactive",
    createdAt: new Date("2024-06-18")
  },
  {
    id: "7",
    firstName: "David",
    lastName: "Garcia",
    email: "david.g@corp.net",
    phone: "+1 (555) 789-0123",
    state: "AZ",
    status: "active",
    createdAt: new Date("2024-07-22")
  },
  {
    id: "8",
    firstName: "Lisa",
    lastName: "Martinez",
    email: "lisa.martinez@email.com",
    phone: "+1 (555) 890-1234",
    state: "CO",
    status: "active",
    createdAt: new Date("2024-08-30")
  }
];

interface ContactTableProps {
  searchQuery?: string;
  selectedState?: string;
  contacts?: Contact[];
  loading?: boolean;
  error?: string | null;
  onDeleteContact?: (id: string) => Promise<void>;
}

export function ContactTable({ 
  searchQuery = "", 
  selectedState = "all", 
  contacts: externalContacts,
  loading: externalLoading,
  error: externalError,
  onDeleteContact
}: ContactTableProps) {
  const { user } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Use external contacts if provided, otherwise fetch them
  const displayContacts = externalContacts || contacts;
  const displayLoading = externalLoading !== undefined ? externalLoading : loading;
  const displayError = externalError !== undefined ? externalError : error;

  // Fetch contacts from database
  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      
      // Transform database format to Contact format
      const transformedContacts: Contact[] = data.map((customer: any) => ({
        id: customer.id,
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone,
        state: customer.state || '',
        status: (customer.status as "active" | "inactive") || "active",
        createdAt: new Date(customer.created_at)
      }));
      
      setContacts(transformedContacts);
      setError(null);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts on component mount and when user changes
  useEffect(() => {
    fetchContacts();
  }, [user]);

  // Auto-refresh contacts every 30 seconds to catch imports
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchContacts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Listen for real-time updates from import pages
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customers_updated') {
        fetchContacts(); // Immediately refresh when customers are updated
      }
    };

    // Listen for storage events (works across tabs)
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events (works within the same tab)
    const handleCustomUpdate = () => {
      fetchContacts();
    };
    window.addEventListener('storage', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomUpdate);
    };
  }, [user]);

  // Handle delete contact
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    setDeletingId(contactId);
    
    try {
      if (onDeleteContact) {
        // Use external delete function if provided
        await onDeleteContact(contactId);
      } else {
        // Fallback to local delete
        const response = await fetch(`/api/customers/${contactId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete contact');
        }

        // Remove from local state immediately for better UX
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
        
        // Trigger update event
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'customers_updated',
          newValue: Date.now().toString()
        }));
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle edit contact
  const handleEditContact = (contactId: string) => {
    // For now, we'll show an alert. Later this can open a modal or navigate to edit page
    alert(`Edit functionality for contact ${contactId} - Coming soon!`);
    // TODO: Implement edit modal or navigate to edit page
  };

  // Don't filter here if external contacts are provided (already filtered)
  const filteredContacts = externalContacts ? displayContacts : displayContacts.filter(contact => {
    const matchesSearch = searchQuery === "" ||
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);

    const matchesState = selectedState === "all" || contact.state === selectedState;

    return matchesSearch && matchesState;
  });

  // Show loading state
  if (displayLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (displayError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">{displayError}</p>
          <Button onClick={fetchContacts} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (displayContacts.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No contacts found</p>
          <p className="text-sm text-muted-foreground">Import some contacts to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Information
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div className="text-gray-500 text-sm">
                    No contacts found matching your criteria
                  </div>
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Added {contact.createdAt.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-xs text-gray-900 flex items-center mb-0.5">
                      <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    <div className="text-xs text-gray-900 flex items-center">
                      <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                      {contact.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {contact.state}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      className={
                        contact.status === 'active'
                          ? 'bg-green-100 text-green-800 text-xs'
                          : 'bg-gray-100 text-gray-800 text-xs'
                      }
                    >
                      {contact.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditContact(contact.id)}
                        disabled={deletingId === contact.id}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        onClick={() => handleDeleteContact(contact.id)}
                        disabled={deletingId === contact.id}
                      >
                        {deletingId === contact.id ? (
                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}