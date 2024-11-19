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
          className="flex items-center justify-center bg-[#898F91] border border-white rounded-full p-3 cursor-pointer shadow-sm relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={19} height={19} fill="none" color="#ffffff">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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