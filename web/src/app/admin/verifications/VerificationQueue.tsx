'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface PendingUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  licensingImage: string | null;
  createdAt: string;
  userType: string | null;
  location: string | null;
}

export default function VerificationQueue({ users }: { users: PendingUser[] }) {
  const router = useRouter();
  const [acting, setActing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showReject, setShowReject] = useState<string | null>(null);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      setActing(userId);
      await axios.post(`/api/admin/verifications/${userId}`, {
        action,
        reason: action === 'reject' ? rejectReason[userId] || '' : undefined,
      });
      toast.success(action === 'approve' ? 'Verification approved' : 'Verification rejected');
      setShowReject(null);
      router.refresh();
    } catch (err) {
      toast.error((err as any)?.response?.data?.error || 'Failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div key={user.id} className="rounded-2xl border border-stone-200 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-5">
          <div className="flex items-start gap-4">
            {/* User info */}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-stone-900 dark:text-stone-100">{user.name || 'No Name'}</p>
              <p className="text-[12px] text-stone-400 dark:text-stone-500">{user.email}</p>
              <div className="flex items-center gap-3 mt-2 text-[12px] text-stone-400 dark:text-stone-500">
                {user.userType && <span>{user.userType}</span>}
                {user.location && <><span>•</span><span>{user.location}</span></>}
                <span>•</span>
                <span>Submitted {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            {showReject !== user.id && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(user.id, 'approve')}
                  disabled={acting === user.id}
                  className="text-[12px] font-medium px-4 py-2 rounded-xl text-success-soft-foreground bg-success-soft hover:bg-success-soft transition-all"
                >
                  {acting === user.id ? '...' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowReject(user.id)}
                  className="text-[12px] font-medium px-4 py-2 rounded-xl text-danger-soft-foreground bg-danger-soft hover:bg-danger-soft transition-all"
                >
                  Reject
                </button>
              </div>
            )}
          </div>

          {/* Licensing image */}
          {user.licensingImage && (
            <div className="mt-4">
              <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 tracking-wide mb-2">Licensing document</p>
              <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                <Image
                  src={user.licensingImage}
                  alt="Licensing document"
                  fill
                  sizes="(max-width: 768px) 100vw, 28rem"
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Reject reason input */}
          {showReject === user.id && (
            <div className="mt-4 p-4 rounded-xl bg-danger-soft/50 border border-red-100">
              <p className="text-[12px] font-medium text-danger-soft-foreground mb-2">Rejection reason (optional)</p>
              <textarea
                value={rejectReason[user.id] || ''}
                onChange={(e) => setRejectReason({ ...rejectReason, [user.id]: e.target.value })}
                placeholder="e.g., Document is expired, image is unclear..."
                className="w-full px-3 py-2 rounded-lg border border-danger-soft text-[13px] text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-danger-soft resize-none"
                rows={2}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowReject(null)}
                  className="text-[12px] font-medium px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700/60 hover:bg-stone-50 dark:hover:bg-stone-800  transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(user.id, 'reject')}
                  disabled={acting === user.id}
                  className="text-[12px] font-medium px-4 py-2 rounded-xl text-white bg-danger hover:bg-danger/90 transition-all"
                >
                  {acting === user.id ? '...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
