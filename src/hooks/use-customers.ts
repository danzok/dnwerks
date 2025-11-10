import { useState, useEffect } from "react";
import { Customer } from "@/lib/types";

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

interface UseCustomersResult {
  customers: Customer[];
  isLoading: boolean;
  createCustomer: (customer: Partial<Customer>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  importCustomers: (customers: Partial<Customer>[]) => Promise<void>;
}

export function useCustomers(searchQuery: string = ""): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/customers', {
      headers: getAuthHeaders()
    });

        if (!response.ok) {
          throw new Error(`Failed to fetch customers: ${response.statusText}`);
        }

        const data: Customer[] = await response.json();

        console.log('Raw customers data:', data);

        // Convert snake_case to camelCase for frontend compatibility
        const normalizedCustomers = data.map(customer => {
          const normalized = {
            ...customer,
            userId: customer.user_id,
            firstName: customer.first_name,
            lastName: customer.last_name,
            createdAt: new Date(customer.created_at),
            updatedAt: new Date(customer.updated_at),
          };
          console.log(`Customer ${customer.id} normalized:`, normalized);
          return normalized;
        });

        // Filter by search query if provided
        let filteredCustomers = normalizedCustomers;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredCustomers = normalizedCustomers.filter(customer =>
            `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase().includes(query) ||
            customer.firstName?.toLowerCase().includes(query) ||
            customer.lastName?.toLowerCase().includes(query) ||
            customer.phone.includes(searchQuery) ||
            customer.email?.toLowerCase().includes(query) ||
            customer.state?.toLowerCase().includes(query)
          );
        }

        setCustomers(filteredCustomers);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [searchQuery]);

  const createCustomer = async (customer: Partial<Customer>) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const newCustomer = await response.json();

      console.log('Raw API response:', newCustomer);

      // Normalize response data - handle both snake_case and camelCase
      const normalizedCustomer: Customer = {
        ...newCustomer,
        userId: newCustomer.user_id || newCustomer.userId,
        firstName: newCustomer.first_name || newCustomer.firstName,
        lastName: newCustomer.last_name || newCustomer.lastName,
        createdAt: new Date(newCustomer.created_at || newCustomer.createdAt),
        updatedAt: new Date(newCustomer.updated_at || newCustomer.updatedAt),
      };

      console.log('Normalized customer:', normalizedCustomer);

      setCustomers(prev => [normalizedCustomer, ...prev]);
    } catch (error) {
      console.error("Failed to create customer:", error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }

      const updatedCustomer = await response.json();

      // Normalize response data
      const normalizedCustomer: Customer = {
        ...updatedCustomer,
        userId: updatedCustomer.user_id || updatedCustomer.userId,
        firstName: updatedCustomer.first_name || updatedCustomer.firstName,
        lastName: updatedCustomer.last_name || updatedCustomer.lastName,
        createdAt: new Date(updatedCustomer.created_at || updatedCustomer.createdAt),
        updatedAt: new Date(updatedCustomer.updated_at || updatedCustomer.updatedAt),
      };

      setCustomers(prev =>
        prev.map(c =>
          c.id === id ? normalizedCustomer : c
        )
      );
    } catch (error) {
      console.error("Failed to update customer:", error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Failed to delete customer:", error);
      throw error;
    }
  };

  const importCustomers = async (customersToImport: Partial<Customer>[]) => {
    try {
      const response = await fetch('/api/customers/import', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ customers: customersToImport }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import customers');
      }

      const result = await response.json();
      console.log(`Imported ${result.imported} customers, skipped ${result.skipped}`);

      // Refetch customers to get the latest data
      const fetchResponse = await fetch('/api/customers', {
        headers: getAuthHeaders()
      });
      if (fetchResponse.ok) {
        const data: Customer[] = await fetchResponse.json();
        const normalizedCustomers = data.map(customer => ({
          ...customer,
          userId: customer.user_id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          createdAt: new Date(customer.created_at),
          updatedAt: new Date(customer.updated_at),
        }));
        setCustomers(normalizedCustomers);
      }
    } catch (error) {
      console.error("Failed to import customers:", error);
      throw error;
    }
  };

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    importCustomers,
  };
}