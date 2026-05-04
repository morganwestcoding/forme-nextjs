'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  UserCircleIcon,
  GridViewIcon,
  AnalyticsUpIcon,
  FavouriteIcon,
  CreditCardIcon,
  UserMultipleIcon,
  Login01Icon,
  UserAdd01Icon,
  ShieldUserIcon,
} from 'hugeicons-react';
import Modal from './Modal';
import Button from '../ui/Button';
import useUserMenuModal from '@/app/hooks/useUserMenuModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import useUpgradeModal from '@/app/hooks/useUpgradeModal';
import { hasFeature } from '@/app/utils/subscription';
import { SafeUser } from '@/app/types';

interface UserMenuModalProps {
  currentUser?: SafeUser | null;
}

const UserMenuModal: React.FC<UserMenuModalProps> = ({ currentUser }) => {
  const router = useRouter();
  const userMenuModal = useUserMenuModal();
  const loginModal = useLoginModal();
  const upgradeModal = useUpgradeModal();

  const handleNavigate = (path: string) => {
    userMenuModal.onClose();
    router.push(path);
  };

  const menuItems = currentUser
    ? [
        {
          icon: UserCircleIcon,
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
          onClick: () => {
            if (currentUser && !hasFeature(currentUser, 'analytics')) {
              userMenuModal.onClose();
              upgradeModal.onOpen('Business Analytics', 'Gold');
            } else {
              handleNavigate('/analytics');
            }
          },
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
        ...(currentUser.role === 'master' || currentUser.role === 'admin'
          ? [
              {
                icon: ShieldUserIcon,
                label: 'Admin',
                onClick: () => handleNavigate('/admin'),
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
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-base font-semibold">
                {currentUser.name?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-stone-900 dark:text-stone-100 truncate">
              {currentUser.name || 'User'}
            </p>
            <p className="text-[13px] text-stone-400 dark:text-stone-500 truncate">
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
                  className="flex flex-col items-center gap-2.5 py-5 px-2 rounded-2xl bg-stone-50  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 border border-stone-100 dark:border-stone-800 hover:border-stone-200  transition-all"
                >
                  <item.icon className="w-[22px] h-[22px] text-stone-500  dark:text-stone-500" strokeWidth={1.5} />
                  <span className="text-[12px] font-medium text-stone-600 dark:text-stone-300">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <div className="px-5 pb-4">
            <Button
              onClick={() => {
                userMenuModal.onClose();
                signOut({ callbackUrl: '/' });
              }}
              fullWidth
              size="lg"
            >
              Sign Out
            </Button>
          </div>
        </>
      ) : (
        <div className="px-5 pb-4 flex gap-2.5">
          <Button
            onClick={() => {
              userMenuModal.onClose();
              loginModal.onOpen();
            }}
            fullWidth
            size="lg"
            leftIcon={<Login01Icon className="w-[16px] h-[16px]" strokeWidth={1.5} />}
          >
            Sign In
          </Button>
          <button
            onClick={() => handleNavigate('/register')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-50  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700/60 text-[13px] font-medium transition-all"
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
