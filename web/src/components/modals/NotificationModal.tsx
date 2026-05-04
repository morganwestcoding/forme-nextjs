// components/modals/NotificationsModal.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Notification03Icon,
  UserAdd01Icon,
  UserMultiple02Icon,
  FavouriteIcon,
  Bookmark02Icon,
  MessageMultiple01Icon,
  Comment01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  ShieldUserIcon,
  Alert02Icon,
  DollarSend01Icon,
  DollarCircleIcon,
  MoneyReceive02Icon,
  MoneyBag02Icon,
  CalendarRemove02Icon,
  CalendarAdd02Icon,
  Clock01Icon,
  RefreshIcon,
} from 'hugeicons-react';
import Modal from './Modal';
import useNotificationsModal from '@/app/hooks/useNotificationsModal';
import useUnreadCounts from '@/app/hooks/useUnreadCounts';
import { useSSE } from '@/app/hooks/useSSE';

interface Notification {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  relatedUser?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  relatedListing?: {
    id: string;
    title: string;
    imageSrc: string | null;
  } | null;
}

const getNotificationIcon = (type: string): React.ElementType => {
  switch (type) {
    case 'NEW_FOLLOWER':
    case 'SHOP_FOLLOW':
    case 'LISTING_FOLLOW':
      return UserAdd01Icon;
    case 'MUTUAL_FOLLOW':
      return UserMultiple02Icon;
    case 'POST_LIKED':
      return FavouriteIcon;
    case 'POST_COMMENTED':
      return Comment01Icon;
    case 'NEW_BOOKMARK':
      return Bookmark02Icon;
    case 'NEW_MESSAGE':
      return MessageMultiple01Icon;
    case 'NEW_RESERVATION':
    case 'RESERVATION_CREATED':
      return CalendarAdd02Icon;
    case 'RESERVATION_ACCEPTED':
    case 'TIME_OFF_APPROVED':
      return CheckmarkCircle02Icon;
    case 'RESERVATION_DECLINED':
    case 'RESERVATION_CANCELLED_BY_BUSINESS':
    case 'RESERVATION_CANCELLED_BY_USER':
      return CalendarRemove02Icon;
    case 'REFUND_REQUESTED':
      return RefreshIcon;
    case 'REFUND_COMPLETED':
      return MoneyReceive02Icon;
    case 'VERIFICATION_APPROVED':
      return ShieldUserIcon;
    case 'VERIFICATION_REJECTED':
      return Alert02Icon;
    case 'PAYOUT_REQUEST':
      return DollarSend01Icon;
    case 'PAYOUT_COMPLETED':
      return DollarCircleIcon;
    case 'PAYOUT_DENIED':
    case 'TIME_OFF_DENIED':
      return Cancel01Icon;
    case 'FEE_WAIVED':
      return MoneyBag02Icon;
    case 'TIME_OFF_REQUEST':
      return Clock01Icon;
    default:
      return Notification03Icon;
  }
};

const initials = (name?: string | null) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '') || parts[0]?.[0] || 'U').toUpperCase();
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getDateBucket = (dateString: string): 'Today' | 'Yesterday' | 'Earlier' => {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));
  if (dayDiff <= 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  return 'Earlier';
};

// Notifications that need the user to do something get a solid dot.
// Purely social/informational pings get a hollow ring dot.
const ACTIONABLE_TYPES = new Set([
  'NEW_RESERVATION',
  'RESERVATION_CREATED',
  'RESERVATION_ACCEPTED',
  'RESERVATION_DECLINED',
  'RESERVATION_CANCELLED_BY_BUSINESS',
  'RESERVATION_CANCELLED_BY_USER',
  'REFUND_REQUESTED',
  'REFUND_COMPLETED',
  'VERIFICATION_APPROVED',
  'VERIFICATION_REJECTED',
  'PAYOUT_REQUEST',
  'PAYOUT_COMPLETED',
  'PAYOUT_DENIED',
  'FEE_WAIVED',
  'TIME_OFF_REQUEST',
  'TIME_OFF_APPROVED',
  'TIME_OFF_DENIED',
  'NEW_MESSAGE',
]);

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const Icon = getNotificationIcon(notification.type);
  const isUnread = !notification.isRead;
  const isActionable = ACTIONABLE_TYPES.has(notification.type);

  return (
    <button
      type="button"
      onClick={() => isUnread && onMarkAsRead(notification.id)}
      className="group relative w-full text-left flex items-start gap-4 py-3.5 px-4 rounded-xl
                 hover:bg-stone-100 dark:bg-stone-800/70 dark:hover:bg-stone-800/60
                 active:bg-stone-100 dark:bg-stone-800 dark:active:bg-stone-800/80
                 transition-colors duration-150"
    >
      {/* Avatar / Listing image / Icon */}
      <div className="relative flex-shrink-0 mt-0.5">
        {notification.relatedListing ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            {notification.relatedListing.imageSrc ? (
              <Image
                src={notification.relatedListing.imageSrc}
                alt={notification.relatedListing.title}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <Icon className="w-4 h-4 text-stone-500 dark:text-stone-400" strokeWidth={1.5} />
            )}
          </div>
        ) : notification.relatedUser ? (
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium text-xs">
            {notification.relatedUser.image ? (
              <Image
                src={notification.relatedUser.image}
                alt={notification.relatedUser.name || 'User'}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span>{initials(notification.relatedUser.name)}</span>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800">
            <Icon className="w-4 h-4 text-stone-500 dark:text-stone-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <p className={`text-sm leading-[1.55] tracking-[-0.005em] ${
          isUnread
            ? 'text-stone-900 dark:text-stone-50'
            : 'text-stone-500 dark:text-stone-400'
        }`}>
          {notification.content}
        </p>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500 tabular-nums">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot — solid = needs action, ring = informational */}
      <div className="flex-shrink-0 mt-2 w-2 h-2 flex items-center justify-center">
        {isUnread && (
          isActionable ? (
            <span
              className="block w-2 h-2 rounded-full bg-stone-900 dark:bg-stone-100"
              aria-label="Needs your attention"
            />
          ) : (
            <span
              className="block w-[7px] h-[7px] rounded-full border border-stone-400 dark:border-stone-500"
              aria-label="Unread"
            />
          )
        )}
      </div>
    </button>
  );
};

type Tab = 'all' | 'unread';

const NotificationsModal = () => {
  const notificationsModal = useNotificationsModal();
  const { setNotifications: setUnreadNotifications, decrementNotifications } = useUnreadCounts();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (notificationsModal.isOpen) {
      fetchNotifications();
    }
  }, [notificationsModal.isOpen]);

  useSSE('NOTIFICATION_CREATED', (data: any) => {
    const newNotification: Notification = {
      id: data.id || `temp-${Date.now()}`,
      type: data.type || 'default',
      content: data.content || '',
      createdAt: data.createdAt || new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => {
      if (data.id && prev.some((n) => n.id === data.id)) return prev;
      return [newNotification, ...prev];
    });
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      const items = response.data.notifications || response.data;
      setNotifications(items);
      const unread = items.filter((n: Notification) => !n.isRead).length;
      setUnreadNotifications(unread);
    } catch (error) {
      toast.error('Couldn’t load your notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await axios.patch(`/api/notifications/${id}/read`);
      decrementNotifications();
    } catch (error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      toast.error('Couldn’t mark this as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await axios.patch('/api/notifications/read-all');
      setUnreadNotifications(0);
    } catch (error) {
      fetchNotifications();
      toast.error('Couldn’t mark everything as read.');
    }
  };

  const visibleNotifications = useMemo(() => {
    return tab === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;
  }, [notifications, tab]);

  const groupedNotifications = useMemo(() => {
    const order: Array<'Today' | 'Yesterday' | 'Earlier'> = ['Today', 'Yesterday', 'Earlier'];
    const groups: Record<string, Notification[]> = {};
    visibleNotifications.forEach((n) => {
      const bucket = getDateBucket(n.createdAt);
      if (!groups[bucket]) groups[bucket] = [];
      groups[bucket].push(n);
    });
    return order
      .filter((label) => groups[label]?.length)
      .map((label) => ({ label, items: groups[label] }));
  }, [visibleNotifications]);

  const styles = `
    .notif-scrollbar::-webkit-scrollbar { width: 4px; }
    .notif-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .notif-scrollbar::-webkit-scrollbar-thumb { background: rgba(120,113,108,0.18); border-radius: 2px; }
    .notif-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(120,113,108,0.18) transparent; }
  `;

  const SkeletonRow = () => (
    <div className="flex items-start gap-4 py-3.5 px-4">
      <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800" />
      <div className="flex-1 space-y-2 pt-1.5">
        <div className="h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 w-[78%]" />
        <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 w-[24%] mt-2" />
      </div>
    </div>
  );

  const bodyContent = (
    <div className="flex flex-col h-[640px] -mx-2 -my-2">
      <style>{styles}</style>

      {/* Header */}
      <div className="px-6 pt-1 pb-5">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50 tracking-[-0.02em] leading-none pr-12">
          Notifications
        </h2>

        {/* Tabs row + Mark all as read */}
        <div className="mt-5 flex items-center justify-between border-b border-stone-200/70 dark:border-stone-700/60 -mx-6 px-6">
          <div className="flex items-center gap-5">
            {(['all', 'unread'] as Tab[]).map((t) => {
              const isActive = tab === t;
              const label = t === 'all' ? 'All' : 'Unread';
              const count = t === 'unread' ? unreadCount : notifications.length;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative pb-3 text-sm tracking-tight transition-colors duration-150
                             ${isActive
                               ? 'text-stone-900 dark:text-stone-50 font-medium'
                               : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                             }`}
                >
                  <span className="flex items-center gap-1.5">
                    {label}
                    {count > 0 && (
                      <span className={`text-xs tabular-nums ${
                        isActive
                          ? 'text-stone-400 dark:text-stone-500'
                          : 'text-stone-300 dark:text-stone-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-px h-px bg-stone-900 dark:bg-stone-100" />
                  )}
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="pb-3 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-150 tracking-tight"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto notif-scrollbar px-2">
        {loading ? (
          <div>
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : visibleNotifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 -mt-6">
            <Notification03Icon
              className="w-6 h-6 text-stone-300 dark:text-stone-600"
              strokeWidth={1.25}
            />
            <h3 className="mt-4 text-sm font-medium text-stone-700 dark:text-stone-200 tracking-tight">
              {tab === 'unread' ? 'You’re all caught up' : 'Nothing here yet'}
            </h3>
            <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500 max-w-[260px] leading-relaxed">
              {tab === 'unread'
                ? 'Nothing new — we’ll let you know when something arrives.'
                : 'Activity from bookings, follows, and messages will show up here.'}
            </p>
          </div>
        ) : (
          <div>
            {groupedNotifications.map((group, groupIdx) => (
              <div key={group.label} className={groupIdx === 0 ? 'pt-3' : 'pt-5'}>
                <h3 className="text-xs font-medium text-stone-500 dark:text-stone-400 tracking-tight mb-1 px-4">
                  {group.label}
                </h3>
                <div>
                  {group.items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={notificationsModal.isOpen}
      onClose={notificationsModal.onClose}
      onSubmit={() => {}}
      title="Notifications"
      body={bodyContent}
      className="md:w-[460px]"
    />
  );
};

export default NotificationsModal;
