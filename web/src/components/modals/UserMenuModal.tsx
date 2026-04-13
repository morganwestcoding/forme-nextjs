'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  UserIcon,
  GridViewIcon,
  AnalyticsUpIcon,
  FavouriteIcon,
  CreditCardIcon,
  UserMultipleIcon,
  Logout01Icon,
  Login01Icon,
  UserAdd01Icon,
  Delete02Icon,
  School01Icon,
} from 'hugeicons-react';
import Modal from './Modal';
import useUserMenuModal from '@/app/hooks/useUserMenuModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { clearEarlyAccess } from '@/app/utils/earlyAccess';
import { SafeUser } from '@/app/types';

interface UserMenuModalProps {
  currentUser?: SafeUser | null;
}

const UserMenuModal: React.FC<UserMenuModalProps> = ({ currentUser }) => {
  const router = useRouter();
  const userMenuModal = useUserMenuModal();
  const loginModal = useLoginModal();

  const handleNavigate = (path: string) => {
    userMenuModal.onClose();
    router.push(path);
  };

  const menuItems = currentUser
    ? [
        {
          icon: UserIcon,
          label: 'Profile',
          onClick: () => handleNavigate(`/profile/${currentUser.id}`),
        },
        {
          icon: GridViewIcon,
          label: 'Listings',
          onClick: () => handleNavigate('/properties'),
        },
        {
          icon: AnalyticsUpIcon,
          label: 'Analytics',
          onClick: () => handleNavigate('/analytics'),
        },
        {
          icon: FavouriteIcon,
          label: 'Favorites',
          onClick: () => handleNavigate('/favorites'),
        },
        {
          icon: UserMultipleIcon,
          label: 'Team',
          onClick: () => handleNavigate('/team'),
        },
        {
          icon: CreditCardIcon,
          label: 'Subscription',
          onClick: () => handleNavigate('/subscription'),
        },
        // Master-only: shortcut to the academy admin panel.
        ...(currentUser.role === 'master'
          ? [
              {
                icon: School01Icon,
                label: 'Academies',
                onClick: () => handleNavigate('/admin/academies'),
              },
            ]
          : []),
      ]
    : [];

  const body = (
    <div className="flex flex-col">
      {/* User info header */}
      {currentUser && (
        <div className="flex items-center gap-3.5 px-6 pb-6">
          <div
            className="w-14 h-14 rounded-full overflow-hidden shrink-0"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}
          >
            {currentUser.image ? (
              <Image
                src={currentUser.image}
                alt="Profile"
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 text-base font-medium">
                {currentUser.name?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-stone-900 truncate">
              {currentUser.name || 'User'}
            </p>
            <p className="text-[13px] text-stone-400 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>
      )}

      {currentUser ? (
        <>
          {/* Panel grid */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-3 gap-2.5">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-2.5 py-5 px-2 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-100 hover:border-stone-200 transition-all"
                >
                  <item.icon className="w-[22px] h-[22px] text-stone-500" strokeWidth={1.5} />
                  <span className="text-[12px] font-medium text-stone-600">{item.label}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  if (confirm('Clear early access?')) {
                    clearEarlyAccess();
                    userMenuModal.onClose();
                  }
                }}
                className="flex flex-col items-center gap-2.5 py-5 px-2 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all"
              >
                <Delete02Icon className="w-[22px] h-[22px] text-red-400" strokeWidth={1.5} />
                <span className="text-[12px] font-medium text-red-500">Clear Data</span>
              </button>
            </div>
          </div>

          {/* Sign out */}
          <div className="px-5 pb-4">
            <button
              onClick={() => {
                userMenuModal.onClose();
                signOut({ callbackUrl: '/' });
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[13px] font-medium transition-all"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
            >
              <Logout01Icon className="w-[16px] h-[16px]" strokeWidth={1.5} />
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <div className="px-5 pb-4 flex gap-2.5">
          <button
            onClick={() => {
              userMenuModal.onClose();
              loginModal.onOpen();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[13px] font-medium transition-all"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            <Login01Icon className="w-[16px] h-[16px]" strokeWidth={1.5} />
            Sign In
          </button>
          <button
            onClick={() => handleNavigate('/register')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/60 text-[13px] font-medium transition-all"
          >
            <UserAdd01Icon className="w-[16px] h-[16px]" strokeWidth={1.5} />
            Sign Up
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={userMenuModal.isOpen}
      onClose={userMenuModal.onClose}
      onSubmit={() => {}}
      title="Account"
      body={body}
    />
  );
};

export default UserMenuModal;
