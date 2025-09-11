// components/modals/NotificationsModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Bell, User, Heart, MapPin, Clock, Check, CheckCheck, Calendar } from 'lucide-react';
import Modal from './Modal';
import Heading from '../Heading';
import useNotificationsModal from '@/app/hooks/useNotificationsModal';


// Type based on your Prisma schema
interface Notification {
  id: string;
  type: string; // 'follow', 'favorite_post', 'favorite_listing', 'reservation', etc.
  content: string;
  createdAt: string;
  isRead: boolean;
}

// Notification type to icon mapping
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'follow':
      return <User className="w-5 h-5 text-blue-500" />;
    case 'favorite_listing':
      return <MapPin className="w-5 h-5 text-green-500" />;
    case 'favorite_post':
      return <Heart className="w-5 h-5 text-red-500" />;
    case 'reservation':
    case 'reservation_request':
      return <Calendar className="w-5 h-5 text-purple-500" />;
    case 'booking':
      return <Clock className="w-5 h-5 text-orange-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
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
  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50 ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
          {notification.content}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
      
      {/* Mark as read button */}
      {!notification.isRead && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-500 transition-colors"
          title="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
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
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent; }
  `;

  const bodyContent = (
    <div className="flex flex-col h-[580px] pb-2 pt-4 md:pt-6">
      <style>{styles}</style>
      
      <div className="mx-auto w-full max-w-[520px]">
        {/* Header */}
        <div className="mb-6">
          <Heading 
            title="Notifications" 
            subtitle="Stay updated with your latest activity" 
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="h-[420px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center mt-16 space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications yet</h3>
                <p className="text-gray-600 text-sm max-w-xs mx-auto">
                  When you get notifications, they&apos;ll show up here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
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
      className="md:w-[520px]"
    />
  );
};

export default NotificationsModal;