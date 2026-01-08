// components/modals/NotificationsModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Notification03Icon,
  UserIcon,
  FavouriteIcon,
  Location01Icon,
  Calendar03Icon
} from 'hugeicons-react';
import Modal from './Modal';
import useNotificationsModal from '@/app/hooks/useNotificationsModal';

// Type based on your Prisma schema
interface Notification {
  id: string;
  type: string; // 'follow', 'favorite_post', 'favorite_listing', 'reservation', etc.
  content: string;
  createdAt: string;
  isRead: boolean;
}

// Notification type to icon and color mapping
const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'follow':
      return { icon: UserIcon, color: 'text-neutral-700', bg: 'bg-neutral-50' };
    case 'favorite_listing':
      return { icon: Location01Icon, color: 'text-neutral-700', bg: 'bg-neutral-50' };
    case 'favorite_post':
      return { icon: FavouriteIcon, color: 'text-neutral-700', bg: 'bg-neutral-50' };
    case 'reservation':
    case 'reservation_request':
      return { icon: Calendar03Icon, color: 'text-neutral-700', bg: 'bg-neutral-50' };
    default:
      return { icon: Notification03Icon, color: 'text-neutral-700', bg: 'bg-neutral-50' };
  }
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
        className={`group relative flex items-center gap-3.5 px-5 py-4 rounded-lg
                    transition-all duration-200 cursor-pointer
                    ${!notification.isRead
                      ? 'bg-white hover:bg-neutral-50/60'
                      : 'bg-white/50 hover:bg-white/80'
                    }`}
        onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-full ${style.bg}
                        flex items-center justify-center
                        transition-transform duration-200 group-hover:scale-105`}>
          <Icon className={`w-[15px] h-[15px] ${style.color}`} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[13.5px] leading-[1.5] tracking-[-0.01em] ${
            !notification.isRead ? 'font-medium text-neutral-900' : 'text-neutral-600'
          }`}>
            {notification.content}
          </p>
          <p className="text-[11.5px] text-neutral-500 mt-1.5">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="flex-shrink-0 w-1.5 h-1.5 bg-neutral-900 rounded-full" />
        )}
      </div>
    </div>
  );
};

const NotificationsModal = () => {
  const notificationsModal = useNotificationsModal();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications when modal opens
  useEffect(() => {
    if (notificationsModal.isOpen) {
      fetchNotifications();
    }
  }, [notificationsModal.isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
          <h2 className="text-[15px] font-semibold text-neutral-900 tracking-tight">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p className="text-[12px] text-neutral-500 mt-1">
              {unreadCount} unread
            </p>
          )}
        </div>

        {/* Mark all read - Centered */}
        {unreadCount > 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleMarkAllAsRead}
              className="text-[11.5px] text-neutral-600 hover:text-neutral-900
                         font-medium transition-colors duration-200
                         px-4 py-1.5 hover:bg-neutral-50 rounded-full"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-5 h-5 border-[1.5px] border-neutral-300 border-t-neutral-900 rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center pt-20">
              <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Notification03Icon className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-medium text-neutral-900 mb-1">
                  No notifications
                </h3>
                <p className="text-neutral-500 text-[12px] max-w-[240px] mx-auto leading-relaxed">
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