import { useState, useEffect, useCallback, useRef } from "react";
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
  tags: string[];
  createdAt: Date;
  company?: string;
  address?: string;
  notes?: string;
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
  manualRefresh: () => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>;
  availableTags: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
}

export function useContactsRealtime(
  searchQuery: string = "",
  selectedState: string = "all",
  selectedTags: string[] = []
): UseContactsRealtimeResult {
  const { user } = useUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Refs for debouncing and optimization
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  // Transform database format to Contact format
  const transformContact = useCallback((customer: any): Contact => ({
    id: customer.id,
    firstName: customer.first_name || customer.firstName || '',
    lastName: customer.last_name || customer.lastName || '',
    email: customer.email || '',
    phone: customer.phone || '',
    state: customer.state || '',
    status: (customer.status as "active" | "inactive") || "active",
    tags: customer.tags || [],
    createdAt: new Date(customer.created_at || customer.createdAt),
    company: customer.company || '',
    address: customer.address || '',
    notes: customer.notes || ''
  }), []);

  // Fetch all available tags from dedicated endpoint
  const fetchAvailableTags = useCallback(async () => {
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchAvailableTags: No user, skipping');
      }
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchAvailableTags: Fetching tags...');
      }

      const response = await fetch('/api/customers/tags?includeStats=true', {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔗 [CONTACTS] fetchAvailableTags: API error:', response.status, errorText);
        throw new Error(`Failed to fetch available tags: ${response.status}`);
      }

      const result = await response.json();
      const tagNames = result.tags?.map((tag: any) => tag.name) || [];

      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchAvailableTags: Got tags:', tagNames.length, 'tags');
      }

      setAvailableTags(tagNames.sort());
    } catch (err) {
      console.error('🔗 [CONTACTS] fetchAvailableTags: Error:', err);
      // Don't set error state for tags, just log it to avoid breaking the UI
    }
  }, [user]);

  // Fetch contacts from API with optimized dependencies
  const fetchContacts = useCallback(async (page: number = pagination.page, forceRefresh: boolean = false) => {
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchContacts: No user, skipping');
      }
      return;
    }

    // Skip if already loading and not forcing refresh
    if (loading && !forceRefresh) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchContacts: Already loading, skipping');
      }
      return;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchContacts: Starting fetch...', {
          page,
          searchQuery,
          selectedState,
          selectedTags,
          forceRefresh
        });
      }

      setLoading(true);

      // Build query string
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedState !== 'all') params.append('state', selectedState);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());

      const url = `/api/customers?${params}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchContacts: Requesting:', url);
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔗 [CONTACTS] fetchContacts: API error:', response.status, errorText);
        throw new Error(`Failed to fetch contacts: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchContacts: Got response:', {
          dataCount: result.data?.length,
          pagination: result.pagination,
          tagsCount: result.tags?.length
        });
      }

      const transformedContacts = result.data.map(transformContact);

      setContacts(transformedContacts);
      setPagination(prev => ({ ...prev, ...result.pagination }));

      // Update tags from API response (fallback if dedicated endpoint fails)
      if (result.tags && result.tags.length > 0) {
        setAvailableTags(result.tags.sort());
        if (process.env.NODE_ENV === 'development') {
          console.log('🔗 [CONTACTS] fetchContacts: Updated tags from API:', result.tags.length);
        }
      }

      setError(null);
      setLastUpdated(new Date());

      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 [CONTACTS] fetchContacts: Success!');
      }
    } catch (err) {
      console.error('🔗 [CONTACTS] fetchContacts: Error:', err);
      setError(`Failed to load contacts: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [user, searchQuery, selectedState, selectedTags, pagination.limit, transformContact]);

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

      // Refresh available tags after deletion
      setTimeout(() => fetchAvailableTags(), 100);

      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'contacts_updated',
        newValue: Date.now().toString()
      }));

    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }, [fetchAvailableTags]);

  // Update contact
  const updateContact = useCallback(async (contactId: string, data: Partial<Contact>) => {
    try {
      // Transform data to match API format
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        state: data.state,
        status: data.status,
        tags: data.tags,
        company: data.company,
        address: data.address,
        notes: data.notes,
      };

      const response = await fetch(`/api/customers/${contactId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      const updatedContact = await response.json();
      const transformedContact = transformContact(updatedContact);

      // Update local state immediately
      setContacts(prev => prev.map(contact =>
        contact.id === contactId ? transformedContact : contact
      ));
      setLastUpdated(new Date());

      // Refresh available tags after update if tags were changed
      if (data.tags) {
        setTimeout(() => fetchAvailableTags(), 100);
      }

      // Trigger storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'contacts_updated',
        newValue: Date.now().toString()
      }));

      // Also trigger a custom event for immediate UI update
      window.dispatchEvent(new CustomEvent('contactsUpdated', {
        detail: { contact: transformedContact }
      }));

    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }, [transformContact, fetchAvailableTags]);

  // Set page function
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Calculate stats
  const stats: ContactStats = {
    total: pagination.total,
    active: contacts.filter(c => c.status === 'active').length,
    inactive: contacts.filter(c => c.status === 'inactive').length,
    recentlyAdded: contacts.filter(c => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return c.createdAt > yesterday;
    }).length
  };

  // Since filtering is now done server-side, use contacts directly
  // Keep minimal client filtering only as fallback for instant UI updates
  const filteredContacts = contacts;

  // Debounced fetch for search and filters
  useEffect(() => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for 300ms debounce
    debounceRef.current = setTimeout(() => {
      fetchContacts(1); // Reset to page 1 when filters change
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, selectedState, selectedTags, fetchContacts]); // Include fetchContacts in deps

  // Initial fetch and page changes
  useEffect(() => {
    if (user) {
      fetchContacts(pagination.page);
      fetchAvailableTags(); // Fetch tags separately
    }
  }, [pagination.page, user, fetchContacts, fetchAvailableTags]);

  // Auto-refresh every 30 seconds (currently disabled)
  useEffect(() => {
    // Auto-refresh is disabled - comment out the polling timer
    // To enable auto-refresh, uncomment the following lines:
    /*
    if (!user) return;

    const interval = setInterval(() => {
      fetchContacts(pagination.page);
      fetchAvailableTags();
    }, 30000);
    return () => clearInterval(interval);
    */
    return () => {}; // Empty cleanup function
  }, [user, fetchContacts, pagination.page, fetchAvailableTags]);

  // Listen for real-time updates
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contacts_updated' || e.key === 'customers_updated') {
        fetchContacts();
        fetchAvailableTags();
      }
    };

    const handleCustomUpdate = () => {
      fetchContacts();
      fetchAvailableTags();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contactsUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contactsUpdated', handleCustomUpdate);
    };
  }, [user, fetchContacts, fetchAvailableTags]);

  // Manual refresh function that can be called from UI components
  const manualRefresh = useCallback(async () => {
    try {
      // Show loading state
      setLoading(true);
      setError(null);

      // Fetch current page data and tags
      await Promise.all([
        fetchContacts(pagination.page),
        fetchAvailableTags()
      ]);

      // Trigger cross-tab sync to update other tabs
      try {
        const timestamp = Date.now().toString();
        localStorage.setItem('contacts_updated', timestamp);
        window.dispatchEvent(new CustomEvent('contactsUpdated', {
          detail: { timestamp, source: 'manual_refresh' }
        }));
      } catch (syncError) {
        console.warn('Cross-tab sync failed:', syncError);
      }

    } catch (error) {
      console.error('Manual refresh failed:', error);
      setError('Manual refresh failed');
    } finally {
      setLoading(false);
    }
  }, [fetchContacts, fetchAvailableTags, pagination.page]);

  const refreshContacts = useCallback(async () => {
    await Promise.all([
      fetchContacts(),
      fetchAvailableTags()
    ]);
  }, [fetchContacts, fetchAvailableTags]);

  return {
    contacts,
    stats,
    filteredContacts,
    loading,
    error,
    lastUpdated,
    refreshContacts,
    manualRefresh,
    deleteContact,
    updateContact,
    availableTags,
    pagination,
    setPage,
  };
}