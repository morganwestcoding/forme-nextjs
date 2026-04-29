'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { PlusSignIcon, Notification03Icon, MessageMultiple01Icon } from 'hugeicons-react';
import { SafeUser } from '@/app/types';
import useInboxModal from '@/app/hooks/useInboxModal';
import useNotificationsModal from '@/app/hooks/useNotificationsModal';
import useUserMenuModal from '@/app/hooks/useUserMenuModal';
import useCreateModal from '@/app/hooks/useCreateModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import useUnreadCounts from '@/app/hooks/useUnreadCounts';
import useLocationModal from '@/app/hooks/useLocationModal';
import PageSearch from '@/components/search/PageSearch';

interface PageHeaderProps {
  currentUser?: SafeUser | null;
  embedded?: boolean;
  currentCategories?: string[];
  currentPage?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ currentUser, embedded = false, currentCategories = [], currentPage }) => {
  const router = useRouter();
  const pathname = usePathname();
  const inboxModal = useInboxModal();
  const notificationsModal = useNotificationsModal();
  const userMenuModal = useUserMenuModal();
  const createModal = useCreateModal();
  const loginModal = useLoginModal();
  const locationModal = useLocationModal();
  const { unreadMessages, unreadNotifications } = useUnreadCounts();
  const isNavActive = (path: string, includes?: string[]) => {
    if (pathname === path) return true;
    if (includes?.some(p => pathname?.startsWith(p))) return true;
    return false;
  };

  const navItems = [
    { label: "Home", href: "/", active: isNavActive("/", ["/post", "/listings"]) },
    { label: "Newsfeed", href: "/newsfeed", active: isNavActive("/newsfeed") },
    { label: "Maps", href: "/maps", active: isNavActive("/maps") },
    { label: "Brands", href: "/shops", active: isNavActive("/shops") },
    ...(currentUser ? [
      { label: "Bookings", href: "/bookings/reservations", active: isNavActive("/bookings/reservations", ["/bookings"]) },
      { label: "Settings", href: "/settings", active: isNavActive("/settings") },
    ] : []),
  ];

  return (
    <div className={embedded ? '' : '-mx-6 md:-mx-24 -mt-2 md:-mt-8 overflow-visible'}>
      <div className={embedded ? 'relative pt-4 pb-0' : 'relative px-6 md:px-24 pt-8 pb-0 overflow-visible'}>
        <div className="relative z-10 pb-0">
          {/* Search and Controls */}
          <div className="flex items-center gap-3 w-full">
            <Link href="/" className="mr-4 shrink-0">
              <Logo />
            </Link>
            <div id="wt-search" className="flex-1 max-w-xl">
              <PageSearch
                actionContext="discover"
                showAttach={false}
                showCreate={false}
                showFilters={false}
                showDefaultActions={false}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0 ml-1.5 text-stone-500 dark:text-stone-400">
                    <path d="M15 15L16.5 16.5" />
                    <path d="M16.9333 19.0252C16.3556 18.4475 16.3556 17.5109 16.9333 16.9333C17.5109 16.3556 18.4475 16.3556 19.0252 16.9333L21.0667 18.9748C21.6444 19.5525 21.6444 20.4891 21.0667 21.0667C20.4891 21.6444 19.5525 21.6444 18.9748 21.0667L16.9333 19.0252Z" />
                    <path d="M16.5 9.5C16.5 5.63401 13.366 2.5 9.5 2.5C5.63401 2.5 2.5 5.63401 2.5 9.5C2.5 13.366 5.63401 16.5 9.5 16.5C13.366 16.5 16.5 13.366 16.5 9.5Z" />
                  </svg>
                }
                actionButtons={
                  <button
                    type="button"
                    onClick={() => locationModal.onOpen()}
                    className="flex items-center gap-2 px-6 py-1.5 rounded-xl text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-[13px] whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" color="currentColor" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M10.0808 2C5.47023 2.9359 2 7.01218 2 11.899C2 17.4776 6.52238 22 12.101 22C16.9878 22 21.0641 18.5298 22 13.9192" />
                      <path d="M18.9375 18C19.3216 17.9166 19.6771 17.784 20 17.603M14.6875 17.3406C15.2831 17.6015 15.8576 17.7948 16.4051 17.9218M10.8546 14.9477C11.2681 15.238 11.71 15.5861 12.1403 15.8865M3 13.825C3.32234 13.6675 3.67031 13.4868 4.0625 13.3321M6.45105 13C7.01293 13.0624 7.64301 13.2226 8.35743 13.5232" />
                      <path d="M18 7.5C18 6.67157 17.3284 6 16.5 6C15.6716 6 15 6.67157 15 7.5C15 8.32843 15.6716 9 16.5 9C17.3284 9 18 8.32843 18 7.5Z" />
                      <path d="M17.488 13.6202C17.223 13.8638 16.8687 14 16.5001 14C16.1315 14 15.7773 13.8638 15.5123 13.6202C13.0855 11.3756 9.83336 8.86815 11.4193 5.2278C12.2769 3.25949 14.3353 2 16.5001 2C18.6649 2 20.7234 3.25949 21.5809 5.2278C23.1649 8.86356 19.9207 11.3833 17.488 13.6202Z" />
                    </svg>
                    {locationModal.selectedLocation || 'All Locations'}
                  </button>
                }
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                id="wt-create"
                onClick={() => createModal.onOpen()}
                aria-label="Create new"
                className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <PlusSignIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </button>
              <button
                id="wt-notifications"
                onClick={() => notificationsModal.onOpen()}
                aria-label={unreadNotifications > 0 ? `Notifications (${unreadNotifications} unread)` : 'Notifications'}
                className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Notification03Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
                {unreadNotifications > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-white text-[10px] font-semibold leading-none ring-2 ring-white dark:ring-stone-950"
                    style={{
                      background: 'linear-gradient(135deg, #2a2a2a 0%, #000 100%)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              <button
                id="wt-messages"
                onClick={() => inboxModal.onOpen(currentUser)}
                aria-label={unreadMessages > 0 ? `Messages (${unreadMessages} unread)` : 'Messages'}
                className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <MessageMultiple01Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
                {unreadMessages > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-white text-[10px] font-semibold leading-none ring-2 ring-white dark:ring-stone-950"
                    style={{
                      background: 'linear-gradient(135deg, #2a2a2a 0%, #000 100%)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
              <button
                id="wt-profile"
                onClick={() => currentUser ? userMenuModal.onOpen() : loginModal.onOpen()}
                aria-label={currentUser ? 'Open user menu' : 'Sign in'}
                className="outline-none ml-1"
              >
                <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden cursor-pointer" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)' }}>
                  {currentUser?.image ? (
                    <Image
                      src={currentUser.image}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-600 dark:to-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 text-sm font-medium">
                      G
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav id="wt-nav" className="flex items-center gap-3 mt-4" style={{ paddingLeft: 'calc(72px + 1rem + 1.25rem)' }}>
            {(currentPage || currentCategories.length > 0) ? (
              <>
                <Link
                  href="/"
                  className="text-[14px] transition-colors duration-200 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  Home
                </Link>
                <span className="text-stone-300 dark:text-stone-600 text-[13px]">/</span>
                <span className="text-[14px] text-stone-900 dark:text-white font-medium">
                  {currentPage
                    ? currentPage
                    : currentCategories.length === 1
                    ? currentCategories[0]
                    : `${currentCategories.length} Categories`}
                </span>
              </>
            ) : (
              navItems.map((item, i) => (
                <React.Fragment key={item.label}>
                  {i > 0 && <span className="text-stone-300 dark:text-stone-600 text-[13px]">/</span>}
                  <Link
                    href={item.href}
                    className={`text-[14px] transition-colors duration-200 ${
                      item.active
                        ? 'text-stone-900 dark:text-white font-medium'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                </React.Fragment>
              ))
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
