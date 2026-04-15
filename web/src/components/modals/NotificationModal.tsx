// components/modals/NotificationsModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
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
  Calendar03Icon,
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
import BouncingDots from '../ui/BouncingDots';
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

const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'NEW_FOLLOWER':
    case 'SHOP_FOLLOW':
    case 'LISTING_FOLLOW':
      return { icon: UserAdd01Icon, color: 'text-stone-600 dark:text-stone-300', bg: 'bg-stone-50 dark:bg-stone-900' };
    case 'MUTUAL_FOLLOW':
      return { icon: UserMultiple02Icon, color: 'text-stone-600 dark:text-stone-300', bg: 'bg-stone-50 dark:bg-stone-900' };
    case 'POST_LIKED':
      return { icon: FavouriteIcon, color: 'text-rose-600', bg: 'bg-rose-50' };
    case 'POST_COMMENTED':
      return { icon: Comment01Icon, color: 'text-violet-600', bg: 'bg-violet-50' };
    case 'NEW_BOOKMARK':
      return { icon: Bookmark02Icon, color: 'text-amber-600', bg: 'bg-amber-50' };
    case 'NEW_MESSAGE':
      return { icon: MessageMultiple01Icon, color: 'text-stone-600 dark:text-stone-300', bg: 'bg-stone-50 dark:bg-stone-900' };
    case 'NEW_RESERVATION':
    case 'RESERVATION_CREATED':
      return { icon: CalendarAdd02Icon, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'RESERVATION_ACCEPTED':
      return { icon: CheckmarkCircle02Icon, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'RESERVATION_DECLINED':
    case 'RESERVATION_CANCELLED_BY_BUSINESS':
    case 'RESERVATION_CANCELLED_BY_USER':
      return { icon: CalendarRemove02Icon, color: 'text-rose-600', bg: 'bg-rose-50' };
    case 'REFUND_REQUESTED':
      return { icon: RefreshIcon, color: 'text-amber-600', bg: 'bg-amber-50' };
    case 'REFUND_COMPLETED':
      return { icon: MoneyReceive02Icon, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'VERIFICATION_APPROVED':
      return { icon: ShieldUserIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'VERIFICATION_REJECTED':
      return { icon: Alert02Icon, color: 'text-rose-600', bg: 'bg-rose-50' };
    case 'PAYOUT_REQUEST':
      return { icon: DollarSend01Icon, color: 'text-amber-600', bg: 'bg-amber-50' };
    case 'PAYOUT_COMPLETED':
      return { icon: DollarCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'PAYOUT_DENIED':
      return { icon: Cancel01Icon, color: 'text-rose-600', bg: 'bg-rose-50' };
    case 'FEE_WAIVED':
      return { icon: MoneyBag02Icon, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'TIME_OFF_REQUEST':
      return { icon: Clock01Icon, color: 'text-amber-600', bg: 'bg-amber-50' };
    case 'TIME_OFF_APPROVED':
      return { icon: CheckmarkCircle02Icon, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'TIME_OFF_DENIED':
      return { icon: Cancel01Icon, color: 'text-rose-600', bg: 'bg-rose-50' };
    default:
      return { icon: Notification03Icon, color: 'text-stone-700 dark:text-stone-200', bg: 'bg-stone-50 dark:bg-stone-900' };
  }
};

const AVATAR_COLORS = [
  'bg-stone-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-stone-500', 'bg-teal-500', 'bg-orange-500',
  'bg-red-500', 'bg-stone-500',
];
const getAvatarColor = (name?: string | null) => {
  if (!name) return 'bg-stone-500';
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
};
const initials = (name?: string | null) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '') || parts[0]?.[0] || 'U').toUpperCase();
};

// Time formatting helper
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)}d ago`;
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const style = getNotificationStyle(notification.type);
  const Icon = style.icon;

  return (
    <div className="relative mb-2">
      <div
        className={`group relative flex items-center gap-3.5 px-5 py-4 rounded-xl
                    transition-all duration-200 cursor-pointer
                    ${!notification.isRead
                      ? 'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700'
                      : 'bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
        onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      >
        {/* Listing image, Avatar, or Icon */}
        <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
          {notification.relatedListing ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              {notification.relatedListing.imageSrc ? (
                <Image
                  src={notification.relatedListing.imageSrc}
                  alt={notification.relatedListing.title}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Icon className="w-[15px] h-[15px] text-stone-900 dark:text-white" strokeWidth={1.5} />
              )}
            </div>
          ) : notification.relatedUser ? (
            <>
              <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-[11px]
                              ${!notification.relatedUser.image ? getAvatarColor(notification.relatedUser.name) : 'bg-stone-100 dark:bg-stone-800'}`}>
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
              <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-white dark:bg-stone-900 ring-2 ring-white dark:ring-stone-800 flex items-center justify-center">
                <Icon className="w-[10px] h-[10px] text-stone-900 dark:text-white" strokeWidth={2} />
              </div>
            </>
          ) : (
            <div className="w-9 h-9 rounded-full bg-white dark:bg-stone-900 ring-1 ring-stone-200 dark:ring-stone-700 flex items-center justify-center">
              <Icon className="w-[15px] h-[15px] text-stone-900 dark:text-white" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[13.5px] leading-[1.5] tracking-[-0.01em] ${
            !notification.isRead ? 'font-medium text-stone-900 dark:text-stone-100' : 'text-stone-700 dark:text-stone-200'
          }`}>
            {notification.content}
          </p>
          <p className="text-[11.5px] text-stone-500  dark:text-stone-500 mt-1.5">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="flex-shrink-0 w-1.5 h-1.5 bg-stone-900 rounded-full" />
        )}
      </div>
    </div>
  );
};

const NotificationsModal = () => {
  const notificationsModal = useNotificationsModal();
  const { setNotifications: setUnreadNotifications, decrementNotifications } = useUnreadCounts();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications when modal opens
  useEffect(() => {
    if (notificationsModal.isOpen) {
      fetchNotifications();
    }
  }, [notificationsModal.isOpen]);

  // Real-time: receive new notifications
  useSSE('NOTIFICATION_CREATED', (data: any) => {
    const newNotification: Notification = {
      id: data.id || `temp-${Date.now()}`,
      type: data.type || 'default',
      content: data.content || '',
      createdAt: data.createdAt || new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => {
      // Deduplicate
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
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: string) => {
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Call API to mark as read
      await axios.patch(`/api/notifications/${id}/read`);
      decrementNotifications();
    } catch (error) {
      // Revert optimistic update
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: false }
            : notification
        )
      );
      toast.error('Failed to mark as read');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Call API to mark all as read
      await axios.patch('/api/notifications/read-all');
      setUnreadNotifications(0);
    } catch (error) {
      // Revert optimistic update
      fetchNotifications();
      toast.error('Failed to mark all as read');
    }
  };

  const styles = `
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius: 2px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.12); }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.06) transparent; }
  `;

  const bodyContent = (
    <div className="flex flex-col h-[600px] py-6">
      <style>{styles}</style>

      <div className="mx-auto w-full max-w-[460px] flex flex-col h-full">
        {/* Header - Centered */}
        <div className="text-center mb-8">
          <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p className="text-[12px] text-stone-500  dark:text-stone-500 mt-1">
              {unreadCount} unread
            </p>
          )}
        </div>

        {/* Mark all read - Centered */}
        {unreadCount > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11.5px] text-stone-600 dark:text-stone-300 hover:text-stone-900
                         font-medium transition-colors duration-200
                         px-4 py-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900 rounded-full"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <BouncingDots />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center pt-20">
              <div className="w-12 h-12 bg-stone-50 dark:bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Notification03Icon className="w-5 h-5 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-medium text-stone-900 dark:text-stone-100 mb-1">
                  No notifications
                </h3>
                <p className="text-stone-500  dark:text-stone-500 text-[12px] max-w-[240px] mx-auto leading-relaxed">
                  When you receive notifications, they&apos;ll appear here
                </p>
              </div>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>
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
      className="md:w-[480px]"
    />
  );
};

export default NotificationsModal;