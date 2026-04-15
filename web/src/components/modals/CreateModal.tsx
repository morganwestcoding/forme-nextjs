'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import {
  GridViewIcon,
  UserAdd01Icon,
} from 'hugeicons-react';

const PostIcon = ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth || 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="7.5" r="1.5" />
    <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" />
    <path d="M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424" />
  </svg>
);

const ShopIcon = ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth || 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 8.75L15.0447 19.5532C15.015 19.684 15 19.8177 15 19.9518C15 20.9449 15.8051 21.75 16.7982 21.75H18" />
    <path d="M19.2192 21.75H4.78078C3.79728 21.75 3 20.9527 3 19.9692C3 19.8236 3.01786 19.6786 3.05317 19.5373L5.24254 10.7799C5.60631 9.32474 5.78821 8.59718 6.33073 8.17359C6.87325 7.75 7.6232 7.75 9.12311 7.75H14.8769C16.3768 7.75 17.1267 7.75 17.6693 8.17359C18.2118 8.59718 18.3937 9.32474 18.7575 10.7799L20.9468 19.5373C20.9821 19.6786 21 19.8236 21 19.9692C21 20.9527 20.2027 21.75 19.2192 21.75Z" />
    <path d="M15 7.75V5.75C15 4.09315 13.6569 2.75 12 2.75C10.3431 2.75 9 4.09315 9 5.75V7.75" />
    <path d="M10 10.75H12.5" />
  </svg>
);

const ProductIcon = ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth || 1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.5V13.5C2.5 17.2712 2.5 19.1569 3.67157 20.3284C4.84315 21.5 6.72876 21.5 10.5 21.5H13.5C17.2712 21.5 19.1569 21.5 20.3284 20.3284C21.5 19.1569 21.5 17.2712 21.5 13.5V7.5" />
    <path d="M3.86909 5.31461L2.5 7.5H21.5L20.2478 5.41303C19.3941 3.99021 18.9673 3.2788 18.2795 2.8894C17.5918 2.5 16.7621 2.5 15.1029 2.5H8.95371C7.32998 2.5 6.51812 2.5 5.84013 2.8753C5.16215 3.2506 4.73113 3.93861 3.86909 5.31461Z" />
    <path d="M12 7.5V2.5" />
    <path d="M6 18H11M6 15H9" />
  </svg>
);
import Modal from './Modal';
import Button from '../ui/Button';
import useCreateModal from '@/app/hooks/useCreateModal';

const CreateModal = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const createModal = useCreateModal();
  const [showNoShop, setShowNoShop] = useState(false);
  const [showNoListing, setShowNoListing] = useState(false);
  const [checkingShop, setCheckingShop] = useState(false);
  const [checkingListing, setCheckingListing] = useState(false);

  const handleNavigate = (path: string) => {
    setShowNoShop(false);
    setShowNoListing(false);
    createModal.onClose();
    router.push(path);
  };

  const handleProductClick = async () => {
    if (!session?.user?.id) return;
    setCheckingShop(true);
    try {
      const res = await axios.get(`/api/shops?userId=${session.user.id}&limit=1`);
      const shops = res.data;
      if (shops && shops.length > 0) {
        // User has a shop — navigate to shop edit with products step or add product directly
        setShowNoShop(false);
        createModal.onClose();
        router.push(`/shops/${shops[0].id}/edit`);
      } else {
        setShowNoShop(true);
      }
    } catch {
      setShowNoShop(true);
    } finally {
      setCheckingShop(false);
    }
  };

  const handleWorkerClick = async () => {
    if (!session?.user?.id) return;
    setCheckingListing(true);
    try {
      const res = await axios.get(`/api/listings?userId=${session.user.id}&limit=1`);
      const listings = res.data?.listings || res.data;
      if (listings && listings.length > 0) {
        setShowNoListing(false);
        createModal.onClose();
        router.push(`/listing/${listings[0].id}/edit`);
      } else {
        setShowNoListing(true);
      }
    } catch {
      setShowNoListing(true);
    } finally {
      setCheckingListing(false);
    }
  };

  const handleClose = () => {
    setShowNoShop(false);
    setShowNoListing(false);
    createModal.onClose();
  };

  const items = [
    {
      icon: PostIcon,
      label: 'Post',
      description: 'Share your work',
      onClick: () => handleNavigate('/post/new'),
    },
    {
      icon: GridViewIcon,
      label: 'Listing',
      description: 'Create a business',
      onClick: () => handleNavigate('/listing/new'),
    },
    {
      icon: ShopIcon,
      label: 'Shop',
      description: 'Open a storefront',
      onClick: () => handleNavigate('/shop/new'),
    },
    {
      icon: ProductIcon,
      label: 'Product',
      description: 'Add to your shop',
      onClick: handleProductClick,
      loading: checkingShop,
    },
    {
      icon: UserAdd01Icon,
      label: 'Worker',
      description: 'Add a team member',
      onClick: handleWorkerClick,
      loading: checkingListing,
    },
  ];

  const body = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-6 pb-5">
        <p className="text-[16px] font-semibold text-stone-900 dark:text-stone-100">What would you like to create?</p>
        <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-0.5">Choose an option to get started</p>
      </div>

      <div className="px-5 pb-5">
        {showNoShop ? (
          <div className="text-center py-6">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">You don&apos;t have a shop yet</p>
            <p className="text-xs text-stone-500  dark:text-stone-500 mb-5">Create a shop first to start adding products</p>
            <Button type="button" onClick={() => handleNavigate('/shop/new')}>
              Create a shop
            </Button>
            <button
              type="button"
              onClick={() => setShowNoShop(false)}
              className="block mx-auto mt-3 text-xs text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors"
            >
              Go back
            </button>
          </div>
        ) : showNoListing ? (
          <div className="text-center py-6">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">You don&apos;t have a listing yet</p>
            <p className="text-xs text-stone-500  dark:text-stone-500 mb-5">Create a listing first to start adding team members</p>
            <Button type="button" onClick={() => handleNavigate('/listing/new')}>
              Create a listing
            </Button>
            <button
              type="button"
              onClick={() => setShowNoListing(false)}
              className="block mx-auto mt-3 text-xs text-stone-400  hover:text-stone-600 dark:text-stone-300 transition-colors"
            >
              Go back
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {items.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                disabled={'loading' in item && item.loading}
                className="flex flex-col items-center gap-2 py-5 px-2 rounded-2xl bg-stone-50  hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 border border-stone-100 dark:border-stone-800 hover:border-stone-200  transition-all disabled:opacity-50"
              >
                {'loading' in item && item.loading ? (
                  <div className="w-[22px] h-[22px] border-2 border-stone-200 dark:border-stone-800 border-t-stone-600 rounded-full animate-spin" />
                ) : (
                  <item.icon className="w-[22px] h-[22px] text-stone-500  dark:text-stone-500" strokeWidth={1.5} />
                )}
                <div className="text-center">
                  <span className="text-[12px] font-medium text-stone-600 dark:text-stone-300 block">{item.label}</span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">{item.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={createModal.isOpen}
      onClose={handleClose}
      onSubmit={() => {}}
      title="Create"
      body={body}
    />
  );
};

export default CreateModal;
