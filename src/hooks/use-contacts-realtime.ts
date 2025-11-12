import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/lib/auth";

// Helper function to add mock auth headers in development
const getAuthHeaders = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (isDevelopment) {
    headers['x-mock-auth'] = 'development';
  }
  return headers;
};

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

interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  recentlyAdded: number; // added in last 24 hours
}

interface UseContactsRealtimeResult {
  contacts: Contact[];
  stats: ContactStats;
  filteredContacts: Contact[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshContacts: () => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export function useContactsRealtime(
  searchQuery: string = "",
  selectedState: string = "all"
): UseContactsRealtimeResult {
  const { user } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Transform database format to Contact format
  const transformContact = useCallback((customer: any): Contact => ({
    id: customer.id,
    firstName: customer.first_name || customer.firstName || '',
    lastName: customer.last_name || customer.lastName || '',
    email: customer.email || '',
    phone: customer.phone || '',
    state: customer.state || '',
    status: (customer.status as "active" | "inactive") || "active",
    createdAt: new Date(customer.created_at || customer.createdAt)
  }), []);

  // Fetch contacts from API
  const fetchContacts = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/customers', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      const transformedContacts = data.map(transformContact);
      
      setContacts(transformedContacts);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [user, transformContact]);

  // Delete contact
  const deleteContact = useCallback(async (contactId: string) => {
    try {
      const response = await fetch(`/api/customers/${contactId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      // Remove from local state immediately
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      setLastUpdated(new Date());
      
      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'contacts_updated',
        newValue: Date.now().toString()
      }));

    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }, []);

  // Calculate stats
  const stats: ContactStats = {
    total: contacts.length,
    active: contacts.filter(c => c.status === 'active').length,
    inactive: contacts.filter(c => c.status === 'inactive').length,
    recentlyAdded: contacts.filter(c => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return c.createdAt > yesterday;
    }).length
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchQuery === "" ||
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);

    const matchesState = selectedState === "all" || contact.state === selectedState;

    return matchesSearch && matchesState;
  });

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(fetchContacts, 30000);
    return () => clearInterval(interval);
  }, [user, fetchContacts]);

  // Listen for real-time updates
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contacts_updated' || e.key === 'customers_updated') {
        fetchContacts();
      }
    };

    const handleCustomUpdate = () => {
      fetchContacts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contactsUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contactsUpdated', handleCustomUpdate);
    };
  }, [user, fetchContacts]);

  return {
    contacts,
    stats,
    filteredContacts,
    loading,
    error,
    lastUpdated,
    refreshContacts: fetchContacts,
    deleteContact
  };
}