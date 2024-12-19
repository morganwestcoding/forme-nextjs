// components/navigation/MobileNavBar.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '../Categories';
import { useCategory } from "@/CategoryContext";
import useDemoModal from "@/app/hooks/useDemoModal";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    route: '/'
  },
  {
    id: 'market',
    label: 'Market',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    route: '/market'
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    route: '/favorites'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    route: '/profile'
  }
];

const MobileNavBar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('home');
  const { selectedCategory, setSelectedCategory } = useCategory();
  const demoModal = useDemoModal();

  const handleItemClick = (item: NavItem) => {
    setSelectedItem(item.id);
    if (item.id === 'menu') {
      setIsMenuOpen(true);
    } else {
      router.push(item.route);
    }
  };

  return (
    <>
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-4">
        <div className="max-w-[500px] mx-auto">
          <div className="bg-[#4169E1] rounded-full p-2 flex items-center justify-between relative">
            <div className="flex items-center justify-between w-full px-4">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-2 rounded-full px-4 py-2 cursor-pointer transition-all duration-200 ${
                    selectedItem === item.id ? 'bg-black bg-opacity-20' : ''
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="text-white">{item.icon}</div>
                  {selectedItem === item.id && (
                    <span className="text-white text-sm">{item.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-up Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="h-full overflow-y-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Menu Items */}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleItemClick(item);
                    setIsMenuOpen(false);
                  }}
                  className="w-full p-4 text-left border rounded-lg flex items-center space-x-3"
                >
                  <div className="text-gray-600">{item.icon}</div>
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Categories Section */}
              <div className="mt-6">
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
        </div>
      )}
    </>
  );
};

export default MobileNavBar;