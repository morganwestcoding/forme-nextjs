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
      admin: 'text-blue-700 bg-blue-50 ring-blue-200',
      suspended: 'text-red-700 bg-red-50 ring-red-200',
      user: 'text-stone-600 bg-stone-50 ring-stone-200',
    };
    return (
      <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full ring-1 ${styles[role] || styles.user}`}>
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
          className="w-full md:w-96 px-4 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-300"
        />
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200/60">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-stone-200/60 bg-stone-50/50">
              <th className="text-left py-3 px-4 font-medium text-stone-500">User</th>
              <th className="text-left py-3 px-4 font-medium text-stone-500">Role</th>
              <th className="text-left py-3 px-4 font-medium text-stone-500">Tier</th>
              <th className="text-left py-3 px-4 font-medium text-stone-500">Verification</th>
              <th className="text-left py-3 px-4 font-medium text-stone-500">Joined</th>
              <th className="text-right py-3 px-4 font-medium text-stone-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-stone-900">{user.name || 'No Name'}</p>
                    <p className="text-[12px] text-stone-400">{user.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">{roleBadge(user.role)}</td>
                <td className="py-3 px-4 text-stone-600">{user.subscriptionTier || 'Bronze'}</td>
                <td className="py-3 px-4">
                  <span className={`text-[11px] font-medium ${
                    user.verificationStatus === 'verified' ? 'text-emerald-600' :
                    user.verificationStatus === 'pending' ? 'text-amber-600' :
                    user.verificationStatus === 'rejected' ? 'text-red-600' :
                    'text-stone-400'
                  }`}>
                    {user.verificationStatus || 'none'}
                  </span>
                </td>
                <td className="py-3 px-4 text-stone-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  {user.role !== 'master' && (
                    <button
                      onClick={() => handleSuspend(user.id, user.role === 'suspended' ? 'unsuspend' : 'suspend')}
                      disabled={acting === user.id}
                      className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all ${
                        user.role === 'suspended'
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-red-700 bg-red-50 hover:bg-red-100'
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
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60"
            >
              Previous
            </button>
          )}
          <span className="text-[12px] text-stone-400">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <button
              onClick={() => router.push(`/admin/users?page=${page + 1}${query ? `&q=${query}` : ''}`)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
