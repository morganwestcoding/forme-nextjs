'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '../Categories';
import { useCategory } from "@/CategoryContext";
import useDemoModal from "@/app/hooks/useDemoModal";
import UserButton from "../UserButton";
import AddListing from "../header/AddListing";
import Notification from "../header/Notification";
import Inbox from "../header/Inbox";
import { SafePost, SafeUser } from "@/app/types";

interface MobileNavBarProps {
  currentUser?: SafeUser | null;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { selectedCategory, setSelectedCategory } = useCategory();
  const demoModal = useDemoModal();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-black bg-opacity-40 w-full py-4">
        <div className="max-w-[500px] mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left side with menu and home button */}
            <div className="flex items-center">
              <div 
                className="bg-[#4169E1] rounded-lg px-6 py-3 flex items-center cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-white text-sm ml-2">Home</span>
              </div>
            </div>

            {/* Right side with user controls */}
            <div className="flex items-center space-x-4">
              <AddListing />
              <Inbox currentUser={currentUser || null} />
              <Notification />
              <UserButton currentUser={currentUser} data={{} as SafePost} />
            </div>
          </div>
        </div>
      </div>

      {/* Popup Menu */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 bottom-24 mx-auto max-w-[500px] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
            <button 
              onClick={() => { router.push('/market'); setIsMenuOpen(false); }}
              className="w-full p-3 text-left rounded-lg hover:bg-gray-100 flex items-center"
            >
              <span className="text-gray-700">Market</span>
            </button>
            <button 
              onClick={() => { router.push('/favorites'); setIsMenuOpen(false); }}
              className="w-full p-3 text-left rounded-lg hover:bg-gray-100"
            >
              <span className="text-gray-700">Favorites</span>
            </button>
            <button 
              onClick={() => { router.push('/jobs'); setIsMenuOpen(false); }}
              className="w-full p-3 text-left rounded-lg hover:bg-gray-100"
            >
              <span className="text-gray-700">Jobs</span>
            </button>
            <button 
              onClick={() => { router.push('/reservations'); setIsMenuOpen(false); }}
              className="w-full p-3 text-left rounded-lg hover:bg-gray-100"
            >
              <span className="text-gray-700">Bookings</span>
            </button>

            {/* Categories Section */}
            <div className="pt-3 border-t">
              <h3 className="text-sm text-gray-500 mb-3">Genre</h3>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((category) => (
                  <div
                    key={category.label}
                    onClick={() => {
                      setSelectedCategory(category.label);
                      setIsMenuOpen(false);
                    }}
                    className={`h-8 rounded-md ${category.color} cursor-pointer`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavBar;