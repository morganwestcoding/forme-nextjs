'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  subscriptionTier: string | null;
  isSubscribed: boolean;
  verificationStatus: string | null;
  createdAt: string;
}

interface Props {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
}

export default function AdminUserList({ users, total, page, pageSize, query }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [acting, setActing] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleSuspend = async (userId: string, action: 'suspend' | 'unsuspend') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      setActing(userId);
      await axios.post(`/api/admin/users/${userId}/suspend`, { action });
      toast.success(`User ${action === 'suspend' ? 'suspended' : 'unsuspended'}`);
      router.refresh();
    } catch (err) {
      toast.error((err as any)?.response?.data?.error || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      master: 'text-purple-700 bg-purple-50 ring-purple-200',
      admin: 'text-stone-700 dark:text-stone-200 bg-stone-50 dark:bg-stone-900 ring-stone-200',
      suspended: 'text-danger-soft-foreground bg-danger-soft ring-danger-soft',
      user: 'text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-900 ring-stone-200',
    };
    return (
      <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${styles[role] || styles.user}`}>
        {role}
      </span>
    );
  };

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full md:w-96 px-4 py-2.5 rounded-xl border border-stone-200  text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300 dark:border-stone-700"
        />
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-700/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700/60 bg-stone-50 dark:bg-stone-900/50">
              <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">User</th>
              <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Role</th>
              <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Tier</th>
              <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Verification</th>
              <th className="text-left py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Joined</th>
              <th className="text-right py-3 px-4 font-medium text-stone-500  dark:text-stone-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:bg-stone-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{user.name || 'No Name'}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{user.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">{roleBadge(user.role)}</td>
                <td className="py-3 px-4 text-stone-600 dark:text-stone-300">{user.subscriptionTier || 'Bronze'}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-medium ${
                    user.verificationStatus === 'verified' ? 'text-success-soft-foreground' :
                    user.verificationStatus === 'pending' ? 'text-warning-soft-foreground' :
                    user.verificationStatus === 'rejected' ? 'text-danger-soft-foreground' :
                    'text-stone-400 dark:text-stone-500'
                  }`}>
                    {user.verificationStatus || 'none'}
                  </span>
                </td>
                <td className="py-3 px-4 text-stone-500  dark:text-stone-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  {user.role !== 'master' && (
                    <button
                      onClick={() => handleSuspend(user.id, user.role === 'suspended' ? 'unsuspend' : 'suspend')}
                      disabled={acting === user.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                        user.role === 'suspended'
                          ? 'text-success-soft-foreground bg-success-soft hover:bg-success-soft'
                          : 'text-danger-soft-foreground bg-danger-soft hover:bg-danger-soft'
                      }`}
                    >
                      {acting === user.id ? '...' : user.role === 'suspended' ? 'Unsuspend' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <button
              onClick={() => router.push(`/admin/users?page=${page - 1}${query ? `&q=${query}` : ''}`)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-50  text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60"
            >
              Previous
            </button>
          )}
          <span className="text-xs text-stone-400 dark:text-stone-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <button
              onClick={() => router.push(`/admin/users?page=${page + 1}${query ? `&q=${query}` : ''}`)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-50  text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
