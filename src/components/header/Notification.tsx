'use client';

import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSession } from 'next-auth/react';

interface NotificationItem {
  id: string;
  type: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${session?.user?.id}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    // Mark notification as read
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-full drop-shadow-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:rounded-full focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center justify-center bg-transparent backdrop-blur-lg rounded-full p-3 cursor-pointer shadow-sm border border-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20} color={"#ffffff"} fill={"none"}>
              <path d="M5.15837 11.491C5.08489 12.887 5.16936 14.373 3.92213 15.3084C3.34164 15.7438 3 16.427 3 17.1527C3 18.1508 3.7818 19 4.8 19H19.2C20.2182 19 21 18.1508 21 17.1527C21 16.427 20.6584 15.7438 20.0779 15.3084C18.8306 14.373 18.9151 12.887 18.8416 11.491C18.6501 7.85223 15.6438 5 12 5C8.35617 5 5.34988 7.85222 5.15837 11.491Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.5 3.125C10.5 3.95343 11.1716 5 12 5C12.8284 5 13.5 3.95343 13.5 3.125C13.5 2.29657 12.8284 2 12 2C11.1716 2 10.5 2.29657 10.5 3.125Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M15 19C15 20.6569 13.6569 22 12 22C10.3431 22 9 20.6569 9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                onClick={() => handleNotificationClick(notification.id)}
                className={notification.isRead ? 'opacity-50' : ''}
              >
                {notification.content}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem>No notifications</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => console.log('Clear all notifications')}>
            Clear all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Notification;