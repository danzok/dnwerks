# Next.js Page Templates

## Dynamic Page with Data Fetching

### Campaigns List Page
```typescript
// pages/campaigns/index.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { Campaign } from '@/types/campaign';
import { CampaignCard } from '@/components/CampaignCard';
import { SearchFilter } from '@/components/SearchFilter';
import { DataTable } from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface CampaignsPageProps {
  initialCampaigns: Campaign[];
  totalPages: number;
}

const CampaignsPage: React.FC<CampaignsPageProps> = ({
  initialCampaigns,
  totalPages: initialTotalPages
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const fetchCampaigns = async (pageNum: number, query: string, activeFilters: Record<string, string[]>) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      });

      if (query) params.append('search', query);
      if (activeFilters.status?.length) {
        params.append('status', activeFilters.status.join(','));
      }

      const response = await fetch(`/api/campaigns?${params}`);
      const data = await response.json();

      setCampaigns(data.campaigns);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(page, searchQuery, filters);
  }, [page, searchQuery, filters]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (activeFilters: Record<string, string[]>) => {
    setFilters(activeFilters);
    setPage(1);
  };

  const handleEdit = (campaign: Campaign) => {
    window.location.href = `/campaigns/${campaign.id}/edit`;
  };

  const handleDelete = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCampaigns(page, searchQuery, filters);
      } else {
        alert('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  const handleSend = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Campaign sent successfully!');
        fetchCampaigns(page, searchQuery, filters);
      } else {
        alert('Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  const campaignStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'sending', label: 'Sending' },
    { value: 'sent', label: 'Sent' },
    { value: 'paused', label: 'Paused' }
  ];

  const columns = [
    {
      key: 'name',
      label: 'Campaign Name',
      render: (value: string, campaign: Campaign) => (
        <Link href={`/campaigns/${campaign.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
          {value}
        </Link>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'sent' ? 'bg-green-100 text-green-800' :
          value === 'sending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'scheduled' ? 'bg-blue-100 text-blue-800' :
          value === 'paused' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: '_count',
      label: 'Messages',
      render: (value: any) => value.messages || 0
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="mt-2 text-gray-600">Manage your SMS campaigns</p>
          </div>
          <Link
            href="/campaigns/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <SearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filters={{
              status: campaignStatusOptions
            }}
            placeholder="Search campaigns by name..."
          />
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSend={handleSend}
            />
          ))}
        </div>

        {/* Table View for larger screens */}
        <div className="hidden lg:block">
          <DataTable
            data={campaigns}
            columns={columns}
            loading={loading}
            pagination={{
              page,
              totalPages,
              onPageChange: handlePageChange
            }}
            emptyMessage="No campaigns found"
          />
        </div>

        {/* Mobile Pagination */}
        <div className="lg:hidden flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false
      }
    };
  }

  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const total = await prisma.campaign.count();
    const totalPages = Math.ceil(total / 10);

    return {
      props: {
        initialCampaigns: JSON.parse(JSON.stringify(campaigns)),
        initialTotalPages: totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return {
      props: {
        initialCampaigns: [],
        initialTotalPages: 0
      }
    };
  }
};

export default CampaignsPage;
```

### Campaign Detail Page
```typescript
// pages/campaigns/[id].tsx
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { Campaign } from '@/types/campaign';
import { CampaignMetrics } from '@/components/CampaignMetrics';
import { MessageList } from '@/components/MessageList';
import { ArrowLeft, Edit, Send, Pause } from 'lucide-react';
import Link from 'next/link';

interface CampaignDetailPageProps {
  campaign: Campaign;
}

const CampaignDetailPage: React.FC<CampaignDetailPageProps> = ({ campaign }) => {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign?')) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/send`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Campaign sent successfully!');
        window.location.reload();
      } else {
        alert('Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    } finally {
      setIsSending(false);
    }
  };

  const canSend = campaign.status === 'draft';
  const canEdit = campaign.status !== 'sent';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/campaigns"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                    campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    campaign.status === 'paused' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                {campaign.description && (
                  <p className="text-gray-600 mb-4">{campaign.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(campaign.createdAt).toLocaleString()}
                  </div>
                  {campaign.scheduledAt && (
                    <div>
                      <span className="font-medium">Scheduled:</span>{' '}
                      {new Date(campaign.scheduledAt).toLocaleString()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Messages:</span>{' '}
                    {campaign._count.messages}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {canEdit && (
                  <Link
                    href={`/campaigns/${campaign.id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                )}

                {canSend && (
                  <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Campaign
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Message Content</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{campaign.messageContent}</p>
              <div className="mt-2 text-xs text-gray-500">
                {campaign.messageContent.length} characters
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Metrics */}
        <CampaignMetrics campaignId={campaign.id} />

        {/* Messages List */}
        <div className="mt-8">
          <MessageList campaignId={campaign.id} />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { id } = context.params;

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false
      }
    };
  }

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: id as string },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!campaign) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        campaign: JSON.parse(JSON.stringify(campaign))
      }
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return {
      notFound: true
    };
  }
};

export default CampaignDetailPage;
```

### Create/Edit Campaign Page
```typescript
// pages/campaigns/create.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { CampaignForm } from '@/components/CampaignForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CreateCampaignPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const campaign = await response.json();
        router.push(`/campaigns/${campaign.id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/campaigns');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/campaigns"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Campaign</h1>
            <p className="text-gray-600">
              Create a new SMS campaign to send messages to your customers.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CampaignForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false
      }
    };
  }

  return {
    props: {}
  };
}

export default CreateCampaignPage;
```

### Customers Management Page
```typescript
// pages/customers/index.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { Customer } from '@/types/customer';
import { DataTable } from '@/components/DataTable';
import { SearchFilter } from '@/components/SearchFilter';
import { TagManager } from '@/components/TagManager';
import { Upload, Plus, Download } from 'lucide-react';
import Link from 'next/link';

interface CustomersPageProps {
  initialCustomers: Customer[];
  tags: Array<{ id: string; name: string }>;
}

const CustomersPage: React.FC<CustomersPageProps> = ({
  initialCustomers,
  tags: initialTags
}) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [tags] = useState(initialTags);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const fetchCustomers = async (pageNum: number, query: string, activeFilters: Record<string, string[]>) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });

      if (query) params.append('search', query);
      if (activeFilters.tags?.length) {
        params.append('tags', activeFilters.tags.join(','));
      }

      const response = await fetch(`/api/customers?${params}`);
      const data = await response.json();

      setCustomers(data.customers);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, searchQuery, filters);
  }, [page, searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (activeFilters: Record<string, string[]>) => {
    setFilters(activeFilters);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));

      const response = await fetch(`/api/customers/export?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'customers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting customers:', error);
      alert('Failed to export customers');
    }
  };

  const handleBulkTagAssign = async (tagIds: string[]) => {
    try {
      const response = await fetch('/api/customers/tags/bulk-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerIds: selectedCustomers,
          tagIds
        })
      });

      if (response.ok) {
        fetchCustomers(page, searchQuery, filters);
        setSelectedCustomers([]);
      } else {
        alert('Failed to assign tags');
      }
    } catch (error) {
      console.error('Error assigning tags:', error);
      alert('Failed to assign tags');
    }
  };

  const columns = [
    {
      key: 'firstName',
      label: 'Name',
      render: (value: string, customer: Customer) => (
        <div>
          <div className="font-medium text-gray-900">
            {customer.firstName} {customer.lastName}
          </div>
          <div className="text-sm text-gray-500">{customer.email}</div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: string) => (
        <div className="text-gray-900">{value}</div>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value: any[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'smsConsent',
      label: 'SMS Consent',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.name
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="mt-2 text-gray-600">Manage your customer database</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link
              href="/customers/upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Link>
            <Link
              href="/customers/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCustomers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                {selectedCustomers.length} customers selected
              </span>
              <TagManager
                availableTags={tagOptions}
                onTagAssign={handleBulkTagAssign}
              />
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <SearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filters={{
              tags: tagOptions
            }}
            placeholder="Search customers by name, phone, or email..."
          />
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <DataTable
            data={customers}
            columns={columns}
            loading={loading}
            pagination={{
              page,
              totalPages,
              onPageChange: setPage
            }}
            emptyMessage="No customers found"
          />
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false
      }
    };
  }

  try {
    const [customers, tags] = await Promise.all([
      prisma.customer.findMany({
        include: {
          customerTags: {
            include: { tag: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.tag.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
      })
    ]);

    const total = await prisma.customer.count();
    const totalPages = Math.ceil(total / 20);

    return {
      props: {
        initialCustomers: JSON.parse(JSON.stringify(customers)),
        tags: JSON.parse(JSON.stringify(tags)),
        initialTotalPages: totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return {
      props: {
        initialCustomers: [],
        tags: [],
        initialTotalPages: 0
      }
    };
  }
};

export default CustomersPage;
```

### Dashboard Page
```typescript
// pages/dashboard/index.tsx
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';
import { CampaignMetrics } from '@/components/CampaignMetrics';
import { RecentActivity } from '@/components/RecentActivity';
import { QuickActions } from '@/components/QuickActions';
import { AnalyticsChart } from '@/components/AnalyticsChart';

interface DashboardPageProps {
  stats: {
    totalCampaigns: number;
    totalCustomers: number;
    activeCampaigns: number;
    messagesSent: number;
  };
  recentCampaigns: any[];
  recentActivity: any[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  recentCampaigns,
  recentActivity
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your campaigns.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <span className="text-blue-600 text-2xl font-bold">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <span className="text-green-600 text-2xl font-bold">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <span className="text-yellow-600 text-2xl font-bold">🚀</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <span className="text-purple-600 text-2xl font-bold">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.messagesSent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Analytics Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h2>
              <AnalyticsChart />
            </div>

            {/* Recent Campaigns */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                <a href="/campaigns" className="text-sm text-blue-600 hover:text-blue-800">
                  View all
                </a>
              </div>
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <p className="text-sm text-gray-600">{campaign._count.messages} messages</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'sending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Activity */}
            <RecentActivity activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false
      }
    };
  }

  try {
    const [campaignsCount, customersCount, messagesCount] = await Promise.all([
      prisma.campaign.count(),
      prisma.customer.count(),
      prisma.campaignMessage.count({ where: { status: 'sent' } })
    ]);

    const activeCampaignsCount = await prisma.campaign.count({
      where: { status: { in: ['scheduled', 'sending'] } }
    });

    const recentCampaigns = await prisma.campaign.findMany({
      include: {
        _count: { select: { messages: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Mock recent activity data
    const recentActivity = [
      { type: 'campaign_sent', message: 'Campaign "Welcome Message" sent successfully', time: '2 hours ago' },
      { type: 'customer_added', message: '25 new customers imported', time: '4 hours ago' },
      { type: 'campaign_created', message: 'New campaign "Summer Sale" created', time: '1 day ago' }
    ];

    return {
      props: {
        stats: {
          totalCampaigns: campaignsCount,
          totalCustomers: customersCount,
          activeCampaigns: activeCampaignsCount,
          messagesSent: messagesCount
        },
        recentCampaigns: JSON.parse(JSON.stringify(recentCampaigns)),
        recentActivity
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      props: {
        stats: {
          totalCampaigns: 0,
          totalCustomers: 0,
          activeCampaigns: 0,
          messagesSent: 0
        },
        recentCampaigns: [],
        recentActivity: []
      }
    };
  }
};

export default DashboardPage;
```