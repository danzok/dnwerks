# Technical Specifications for Tag Filtering and Pagination

## Database Schema Changes

### SQL Migration Script
```sql
-- Add tags field to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create GIN index for efficient array queries
CREATE INDEX IF NOT EXISTS idx_customers_tags ON customers USING GIN(tags);

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'tags';
```

## API Implementation Details

### Updated GET /api/customers Endpoint
```typescript
// Query parameters:
// - search: string (optional)
// - state: string (optional)
// - tags: string[] (optional, comma-separated)
// - page: number (default: 1)
// - limit: number (default: 10)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || 'all';
    const tagsParam = searchParams.get('tags');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Parse tags from comma-separated string
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];

    // Build query
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (state !== 'all') {
      query = query.eq('state', state);
    }

    if (tags.length > 0) {
      query = query.contains('tags', tags);
    }

    // Apply pagination
    const { data: customers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get all unique tags for filtering options
    const { data: tagsData } = await supabase
      .from('customers')
      .select('tags')
      .eq('user_id', userId)
      .not('tags', 'eq', '{}');

    const allTags = [...new Set(
      tagsData?.flatMap(customer => customer.tags || []) || []
    )].sort();

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: customers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      tags: allTags,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
```

### Updated POST /api/customers Endpoint
```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, firstName, lastName, email, state, tags } = body;

    // Validate required fields
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' }, 
        { status: 400 }
      );
    }

    // Process and validate phone number
    const phoneResult = processPhoneNumber(phone);
    if (!phoneResult.isValid) {
      return NextResponse.json(
        { error: phoneResult.error || 'Invalid phone number' }, 
        { status: 400 }
      );
    }

    // Check for existing customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .eq('phone', phoneResult.formatted!)
      .single();

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists' }, 
        { status: 409 }
      );
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' }, 
          { status: 400 }
        );
      }
    }

    // Create new customer with tags
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        phone: phoneResult.formatted!,
        first_name: firstName?.trim() || null,
        last_name: lastName?.trim() || null,
        email: email?.trim() || null,
        state: state || phoneResult.state || null,
        tags: tags && Array.isArray(tags) ? tags : [],
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' }, 
      { status: 500 }
    );
  }
}
```

## Frontend Implementation

### Updated useContactsRealtime Hook
```typescript
interface UseContactsRealtimeResult {
  contacts: Contact[];
  filteredContacts: Contact[];
  stats: ContactStats;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshContacts: () => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  // New properties
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

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
    createdAt: new Date(customer.created_at || customer.createdAt)
  }), []);

  // Fetch contacts from API
  const fetchContacts = useCallback(async (page: number = pagination.page) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Build query string
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedState !== 'all') params.append('state', selectedState);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/customers?${params}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const result = await response.json();
      const transformedContacts = result.data.map(transformContact);
      
      setContacts(transformedContacts);
      setAvailableTags(result.tags || []);
      setPagination(result.pagination);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [user, transformContact, searchQuery, selectedState, selectedTags, pagination.page, pagination.limit]);

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

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Fetch when page changes
  useEffect(() => {
    fetchContacts(pagination.page);
  }, [pagination.page]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => fetchContacts(), 30000);
    return () => clearInterval(interval);
  }, [user, fetchContacts]);

  // Delete contact function
  const deleteContact = useCallback(async (contactId: string) => {
    try {
      const response = await fetch(`/api/customers/${contactId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      // Refresh contacts list
      fetchContacts();
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
  }, [fetchContacts]);

  return {
    contacts,
    stats,
    filteredContacts: contacts, // Now filtered on the server
    loading,
    error,
    lastUpdated,
    refreshContacts: () => fetchContacts(),
    deleteContact,
    availableTags,
    pagination,
    setPage,
  };
}
```

### MultiSelect Component
```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronDown, X } from "lucide-react"

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchable?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  searchable = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleClearAll = () => {
    onChange([])
  }

  const handleSelectAll = () => {
    onChange(options.map(option => option.value))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-sm text-[#666666] dark:text-[#888888]">
                {placeholder}
              </span>
            ) : (
              selected.map(value => {
                const option = options.find(opt => opt.value === value)
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="mr-1 mb-1 bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#666666] dark:text-[#888888]"
                  >
                    {option?.label || value}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(value)
                      }}
                    />
                  </Badge>
                )
              })
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]">
        <div className="p-2">
          {searchable && (
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 text-sm border rounded bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          <div className="flex justify-between p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center p-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                onClick={() => handleToggle(option.value)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    selected.includes(option.value)
                      ? "text-black dark:text-white"
                      : "opacity-0"
                  }`}
                />
                <span className="text-sm text-black dark:text-white">
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

### TagInput Component
```typescript
"use client"

import { useState, KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  suggestions?: string[]
  maxTags?: number
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag...",
  suggestions = [],
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (
      trimmed &&
      !value.includes(trimmed) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmed])
      setInputValue("")
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const filteredSuggestions = suggestions.filter(
    suggestion =>
      !value.includes(suggestion) &&
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#666666] dark:text-[#888888]"
          >
            {tag}
            <X
              className="ml-1 h-3 w-3 cursor-pointer"
              onClick={() => removeTag(index)}
            />
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#111111] border rounded-md shadow-lg border-[#EAEAEA] dark:border-[#333333]">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="px-3 py-2 cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
              onClick={() => {
                onChange([...value, suggestion])
                setInputValue("")
                setShowSuggestions(false)
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Pagination Component
```typescript
"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = []
  const showPages = 5
  
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
  let endPage = Math.min(totalPages, startPage + showPages - 1)
  
  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-[#666666] dark:text-[#888888]">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
            >
              1
            </Button>
            {startPage > 2 && (
              <span className="px-2 text-[#666666] dark:text-[#888888]">...</span>
            )}
          </>
        )}
        
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={
              page === currentPage
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
            }
          >
            {page}
          </Button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-[#666666] dark:text-[#888888]">...</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-white dark:bg-[#111111] border-[#EAEAEA] dark:border-[#333333]"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

## Updated VercelDataTable with Tags Column
```typescript
// Add this to the createContactColumns function
{
  accessorKey: "tags",
  header: "Tags",
  cell: ({ row }) => {
    const tags = row.getValue("tags") as string[]
    return (
      <div className="flex flex-wrap gap-1">
        {tags.length === 0 ? (
          <span className="text-xs text-[#999999] dark:text-[#666666]">-</span>
        ) : (
          tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs bg-[#F5F5F5] dark:bg-[#1A1A1A] border-[#EAEAEA] dark:border-[#333333] text-[#666666] dark:text-[#888888]"
            >
              {tag}
            </Badge>
          ))
        )}
        {tags.length > 3 && (
          <span className="text-xs text-[#999999] dark:text-[#666666]">
            +{tags.length - 3}
          </span>
        )}
      </div>
    )
  },
},