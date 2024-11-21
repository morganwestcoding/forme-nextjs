"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []); // Empty dependency array means this runs once on mount

  // Also fetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}`);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center bg-[#5E6365] border border-[#5E6365] rounded-full p-3 cursor-pointer shadow relative"
        >


          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#ffffff" fill="none">
    <path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
          {notifications.some(n => !n.isRead) && (
            <div className="absolute -top-0 -right-0 bg-red-500 border border-red-500 rounded-full w-3 h-3 flex items-center justify-center text-xs text-[#a2a2a2] font-thin shadow">
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="
          absolute 
          z-10 
          w-64 
          mt-1 
          rounded-lg
          shadow-lg 
          transform 
          -translate-x-1/2 
          left-1/2
          bg-white
          bg-opacity-75
          backdrop-blur-md
          border-none
          overflow-hidden
        ">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-black rounded-lg">
                No notifications
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 
                    hover:bg-gray-500 
                    hover:bg-opacity-25 
                    cursor-pointer 
                    ${!notification.isRead ? 'bg-blue-500 bg-opacity-10' : ''}
                    ${index !== notifications.length - 1 ? 'border-b border-gray-500 border-opacity-25' : ''}
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === notifications.length - 1 ? 'rounded-b-lg' : ''}
                    transition
                    duration-200
                  `}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="text-sm text-black font-normal">{notification.content}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {format(new Date(notification.createdAt), 'PPp')}
                  </p>
                </div>
              ))
            )}
          </div>
          
          <style jsx global>{`
            .max-h-96::-webkit-scrollbar {
              width: 6px;
            }
            .max-h-96::-webkit-scrollbar-track {
              background: transparent;
            }
            .max-h-96::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 3px;
            }
            .max-h-96::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.3);
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Notifications;