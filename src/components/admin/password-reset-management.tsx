"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Mail, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff
} from "lucide-react";

interface AdminPasswordReset {
  id: string;
  user_id: string;
  admin_id: string;
  target_user: {
    email: string;
    full_name: string;
  };
  admin_profile: {
    user_id: string;
    auth_user: {
      email: string;
    };
  };
  reason: string;
  created_at: string;
  completed_at?: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
}

export default function AdminPasswordResetManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [resets, setResets] = useState<AdminPasswordReset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [resetReason, setResetReason] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
    fetchResets();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      setError('Error fetching users');
    }
  };

  const fetchResets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/password-reset');
      const data = await response.json();
      
      if (response.ok) {
        setResets(data.resets || []);
      } else {
        setError('Failed to fetch password resets');
      }
    } catch (error) {
      setError('Error fetching password resets');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setShowUserSearch(false);
    setUserSearchQuery("");
  };

  const handlePasswordReset = async () => {
    if (!selectedUser || !resetReason.trim()) {
      setError('Please select a user and provide a reason');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          reason: resetReason.trim(),
          expiresIn: 24 // 24 hours
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate password reset');
      }

      setSuccess(`Password reset initiated for ${selectedUser.email}`);
      setSelectedUser(null);
      setResetReason("");
      
      // Refresh the resets list
      await fetchResets();

    } catch (error: any) {
      setError(error.message || "Failed to initiate password reset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      expired: { variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" },
      cancelled: { variant: "outline" as const, icon: AlertTriangle, color: "text-gray-600" }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredResets = resets.filter(reset => {
    if (statusFilter === "all") return true;
    return reset.status === statusFilter;
  });

  const filteredUsersForDisplay = showUserSearch ? filteredUsers : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Password Reset Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Initiate password resets for user accounts
          </p>
        </div>
        
        <Button
          onClick={fetchResets}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Password Reset Form */}
      <Card>
        <CardHeader>
          <CardTitle>Initiate Password Reset</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* User Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select User</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className="w-full justify-between"
                >
                  {selectedUser ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{selectedUser.full_name} ({selectedUser.email})</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <User className="h-4 w-4 mr-2" />
                      <span>Choose a user...</span>
                    </div>
                  )}
                  <MoreHorizontal className="h-4 w-4" />
                </Button>

                {showUserSearch && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    <div className="p-2">
                      <Input
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="mb-2"
                        autoFocus
                      />
                      <div className="max-h-60 overflow-y-auto">
                        {filteredUsersForDisplay.length === 0 ? (
                          <div className="text-sm text-gray-500 p-2">No users found</div>
                        ) : (
                          filteredUsersForDisplay.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleUserSelect(user)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            >
                              <User className="h-4 w-4 mr-2 text-gray-500" />
                              <div>
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-gray-500">{user.email}</div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason for Reset
              </Label>
              <textarea
                id="reason"
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                placeholder="e.g., Security precaution, Suspicious activity, User request"
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handlePasswordReset}
              disabled={!selectedUser || !resetReason.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Initiating Reset...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Initiate Password Reset
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Password Resets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Password Resets</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            
            {showFilters && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading password resets...</span>
            </div>
          ) : filteredResets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No password resets found</p>
              <p className="text-sm">Initiated password resets will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Admin</th>
                    <th className="text-left p-3 font-medium">Reason</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-left p-3 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResets.map((reset) => (
                    <tr key={reset.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{reset.target_user.full_name}</div>
                          <div className="text-gray-500 text-xs">{reset.target_user.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-600 text-xs">{reset.admin_profile?.auth_user?.email}</div>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs truncate" title={reset.reason}>
                          {reset.reason}
                        </div>
                      </td>
                      <td className="p-3">
                        {getStatusBadge(reset.status)}
                      </td>
                      <td className="p-3 text-gray-600 text-xs">
                        {formatDate(reset.created_at)}
                      </td>
                      <td className="p-3 text-gray-600 text-xs">
                        {reset.completed_at ? formatDate(reset.completed_at) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}