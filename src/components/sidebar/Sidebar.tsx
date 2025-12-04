"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SafeUser } from "@/app/types";
import useNotificationsModal from '@/app/hooks/useNotificationsModal';
import useInboxModal from '@/app/hooks/useInboxModal';
import Logo from "../header/Logo";
import UserButton from "../UserButton";
import axios from 'axios';

interface SidebarProps {
  currentUser?: SafeUser | null;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive, onClick }) => (
  <li className="relative w-full">
    <Link
      href={href}
      prefetch={true}
      onClick={onClick}
      className={`
        flex items-center w-full px-5 py-2.5 transition-colors duration-150 cursor-pointer
        ${isActive ? 'text-[#4F9EF8]' : 'text-neutral-500 hover:text-neutral-900'}
      `}
    >
      <div className="w-8 flex justify-center">
        {icon}
      </div>
      <span className="ml-3 text-sm">
        {label}
      </span>
    </Link>
  </li>
);

interface ModalItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ModalItem: React.FC<ModalItemProps> = ({ icon, label, isActive, onClick }) => (
  <li className="relative w-full">
    <div
      onClick={onClick}
      className={`
        flex items-center w-full px-5 py-2.5 transition-colors duration-150 cursor-pointer
        ${isActive ? 'text-[#4F9EF8]' : 'text-neutral-500 hover:text-neutral-900'}
      `}
    >
      <div className="w-8 flex justify-center">
        {icon}
      </div>
      <span className="ml-3 text-sm">
        {label}
      </span>
    </div>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
}) => {
  const pathname = usePathname();
  const notificationsModal = useNotificationsModal();
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [reservationCount, setReservationCount] = useState(0);
  const inboxModal = useInboxModal();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEdgeHovered, setIsEdgeHovered] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Clear modal selection when pathname changes
  useEffect(() => {
    setSelectedModal(null);
  }, [pathname]);

  useEffect(() => {
    const fetchReservationCount = async () => {
      if (currentUser) {
        try {
          const response = await axios.get('/api/reservations/count');
          setReservationCount(response.data);
        } catch (error) {
          console.error('Error fetching reservation count:', error);
        }
      }
    };
    fetchReservationCount();
  }, [currentUser]);

  const handleModalOpen = (modalFunction: () => void, modalId: string) => {
    setSelectedModal(modalId);
    setTimeout(() => {
      modalFunction();
    }, 10);
  };

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
    window.dispatchEvent(new Event('sidebarToggle'));
  };

  // Check if a path is active
  const isActive = (path: string): boolean => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path) ?? false;
  };

  // Icons
  const DiscoverIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" className="flex-shrink-0">
      <path d="M5.63604 18.3638C4.00736 16.7351 3 14.4851 3 11.9999C3 7.02929 7.02944 2.99986 12 2.99986C14.4853 2.99986 16.7353 4.00721 18.364 5.63589M20.2941 8.49986C20.7487 9.57574 21 10.7584 21 11.9999C21 16.9704 16.9706 20.9999 12 20.9999C10.7586 20.9999 9.57589 20.7485 8.5 20.2939" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M15.8292 3.82152C18.5323 2.13939 20.7205 1.51937 21.6005 2.39789C23.1408 3.93544 20.0911 9.48081 14.7889 14.7838C9.48663 20.0868 3.93971 23.1394 2.39946 21.6018C1.52414 20.728 2.13121 18.5599 3.79165 15.8774" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  );

  const MarketIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" className="flex-shrink-0">
      <path d="M3.00003 10.9871V15.4925C3.00003 18.3243 3.00003 19.7403 3.87871 20.62C4.75739 21.4998 6.1716 21.4998 9.00003 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" strokeWidth="1.5"></path>
      <path d="M15 16.9768C14.3159 17.584 13.2268 17.9768 12 17.9768C10.7732 17.9768 9.68412 17.584 9.00003 16.9768" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
      <path d="M17.7957 2.50294L6.14986 2.53202C4.41169 2.44248 3.96603 3.78259 3.96603 4.43768C3.96603 5.02359 3.89058 5.87774 2.82527 7.4831C1.75996 9.08846 1.84001 9.56536 2.44074 10.6767C2.93931 11.5991 4.20744 11.9594 4.86865 12.02C6.96886 12.0678 7.99068 10.2517 7.99068 8.97523C9.03254 12.1825 11.9956 12.1825 13.3158 11.8157C14.6386 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0097 10.3439 22.4107 9.04401 21.2968 7.6153C20.5286 6.63001 20.2084 5.7018 20.1033 4.73977C20.0423 4.18234 19.9888 3.58336 19.5972 3.20219C19.0248 2.64515 18.2036 2.47613 17.7957 2.50294Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  );

  const VendorsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" className="flex-shrink-0">
      <path d="M2.5 7.5V13.5C2.5 17.2712 2.5 19.1569 3.67157 20.3284C4.84315 21.5 6.72876 21.5 10.5 21.5H13.5C17.2712 21.5 19.1569 21.5 20.3284 20.3284C21.5 19.1569 21.5 17.2712 21.5 13.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M3.86909 5.31461L2.5 7.5H21.5L20.2478 5.41303C19.3941 3.99021 18.9673 3.2788 18.2795 2.8894C17.5918 2.5 16.7621 2.5 15.1029 2.5H8.95371C7.32998 2.5 6.51812 2.5 5.84013 2.8753C5.16215 3.2506 4.73113 3.93861 3.86909 5.31461Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M12 7.5V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M10 10.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  );

  const FavoritesIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" className="flex-shrink-0">
      <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const AppointmentsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" className="flex-shrink-0">
      <path d="M16 2V6M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
      <path d="M11.9955 14H12.0045M11.9955 18H12.0045M15.991 14H16M8 14H8.00897M8 18H8.00897" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  );

  const InboxIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" className="flex-shrink-0">
      <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );

  const NotificationsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" className="flex-shrink-0">
      <path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const SettingsIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" className="flex-shrink-0">
      <path d="M2.25607 15.6322C2.29003 15.309 2.52424 15.0485 2.99267 14.5276L4.02374 13.3749C4.27577 13.0558 4.45462 12.5 4.45462 11.9998C4.45462 11.5 4.27571 10.944 4.02371 10.625L2.99267 9.47231C2.52424 8.95137 2.29002 8.6909 2.25607 8.36768C2.22211 8.04446 2.39707 7.74083 2.74698 7.13358L3.24056 6.27698C3.61386 5.62915 3.8005 5.30523 4.11808 5.17607C4.43566 5.0469 4.79482 5.14883 5.51316 5.35267L6.73339 5.69637C7.192 5.80212 7.67315 5.74213 8.0919 5.52698L8.42878 5.33261C8.78786 5.10262 9.06406 4.76352 9.21694 4.36493L9.5509 3.36754C9.77047 2.70753 9.88026 2.37752 10.1416 2.18876C10.403 2 10.7502 2 11.4445 2H12.5593C13.2537 2 13.6009 2 13.8622 2.18876C14.1236 2.37752 14.2334 2.70753 14.453 3.36754L14.7869 4.36493C14.9398 4.76352 15.216 5.10262 15.5751 5.33261L15.912 5.52698C16.3307 5.74213 16.8119 5.80212 17.2705 5.69637L18.4907 5.35267C19.209 5.14883 19.5682 5.0469 19.8858 5.17607C20.2034 5.30523 20.39 5.62915 20.7633 6.27698L21.2569 7.13358C21.6068 7.74083 21.7817 8.04446 21.7478 8.36768C21.7138 8.6909 21.4796 8.95137 21.0112 9.47231L19.9801 10.625C19.7282 10.944 19.5492 11.5 19.5492 11.9998C19.5492 12.5 19.7281 13.0558 19.9801 13.3749L21.0112 14.5276C21.4796 15.0485 21.7138 15.309 21.7478 15.6322C21.7817 15.9555 21.6068 16.2591 21.2569 16.8663L20.7633 17.7229C20.39 18.3707 20.2034 18.6947 19.8858 18.8238C19.5682 18.953 19.209 18.8511 18.4907 18.6472L17.2705 18.3035C16.8118 18.1977 16.3306 18.2578 15.9118 18.473L15.575 18.6674C15.2159 18.8974 14.9398 19.2364 14.787 19.635L14.453 20.6325C14.2334 21.2925 14.1236 21.6225 13.8622 21.8112C13.6009 22 13.2537 22 12.5593 22H11.4445C10.7502 22 10.403 22 10.1416 21.8112C9.88026 21.6225 9.77047 21.2925 9.5509 20.6325" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.73696 18.7798C3.81696 17.6998 7.48896 14.0638 7.84896 13.6438C8.22953 13.1998 7.92096 12.5998 8.10456 10.7398C8.1934 9.8398 8.38699 9.16555 8.94096 8.6638C9.60096 8.0398 10.141 8.0398 12.001 7.99781C13.621 8.0398 13.813 7.8598 13.981 8.27981C14.101 8.57981 13.741 8.7598 13.309 9.23981C12.349 10.1998 11.785 10.6798 11.731 10.9798C11.341 12.2998 12.877 13.0798 13.717 12.2398C14.0346 11.9221 15.505 10.4398 15.649 10.3198C15.757 10.2238 16.0155 10.2284 16.141 10.3798C16.249 10.4859 16.261 10.4998 16.249 10.9798C16.2379 11.4241 16.2428 12.062 16.2442 12.7198C16.2459 13.5721 16.201 14.5198 15.841 14.9998C15.121 16.0798 13.921 16.1398 12.841 16.1878C11.821 16.2478 10.981 16.1398 10.717 16.3318C10.501 16.4398 9.36096 17.6398 7.98096 19.0198L5.52096 21.4798C3.48096 23.0998 1.23696 20.5798 2.73696 18.7798Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  return (
    <>
      {/* Expand zone - shown when collapsed */}
      {isCollapsed && (
        <div
          className="fixed top-0 left-0 w-3 h-screen z-[60] flex items-center cursor-pointer"
          onMouseEnter={() => setIsEdgeHovered(true)}
          onMouseLeave={() => setIsEdgeHovered(false)}
          onClick={toggleCollapse}
        >
          <div className={`
            flex flex-col items-center gap-1 ml-1
            transition-all duration-300 ease-out
            ${isEdgeHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            {[0, 1, 2].map((i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                className="text-neutral-400"
                style={{
                  animation: isEdgeHovered ? `pulseRight 1s ease-in-out ${i * 0.15}s infinite` : 'none',
                }}
              >
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        </div>
      )}

      {/* Main Sidebar */}
      <div
        className={`
          h-screen overflow-y-auto w-56
          fixed top-0 left-0 border-r border-neutral-200/40 bottom-0 z-50
          transition-transform duration-300 ease-in-out bg-neutral-100
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Right edge hover zone with animated arrows */}
        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 w-3 h-full z-20 flex items-center cursor-pointer"
            onMouseEnter={() => setIsEdgeHovered(true)}
            onMouseLeave={() => setIsEdgeHovered(false)}
            onClick={toggleCollapse}
          >
            <div className={`
              flex flex-col items-center gap-1 mr-1
              transition-all duration-300 ease-out
              ${isEdgeHovered ? 'opacity-100' : 'opacity-0'}
            `}>
              {[0, 1, 2].map((i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  className="text-neutral-400"
                  style={{
                    animation: isEdgeHovered ? `pulseLeft 1s ease-in-out ${i * 0.15}s infinite` : 'none',
                  }}
                >
                  <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center w-56 h-full pb-10 pt-10 z-50">
          <Logo variant="vertical" />
          <UserButton currentUser={currentUser} />

          <div className="flex flex-col w-full px-6 flex-1">
            <ul className="list-none m-0 p-0 flex flex-col items-center space-y-4 flex-1">
              <NavItem
                href="/"
                icon={DiscoverIcon}
                label="Discover"
                isActive={isActive('/') && pathname === '/'}
              />
              <NavItem
                href="/market"
                icon={MarketIcon}
                label="Market"
                isActive={isActive('/market')}
              />
              <NavItem
                href="/shops"
                icon={VendorsIcon}
                label="Vendors"
                isActive={isActive('/shops')}
              />
              <NavItem
                href="/favorites"
                icon={FavoritesIcon}
                label="Favorites"
                isActive={isActive('/favorites')}
              />
              <NavItem
                href="/bookings/reservations"
                icon={AppointmentsIcon}
                label="Appointments"
                isActive={isActive('/bookings')}
              />
              <ModalItem
                icon={InboxIcon}
                label="Inbox"
                isActive={selectedModal === 'inbox'}
                onClick={() => handleModalOpen(() => inboxModal.onOpen(currentUser), 'inbox')}
              />
              <ModalItem
                icon={NotificationsIcon}
                label="Notifications"
                isActive={selectedModal === 'notifications'}
                onClick={() => handleModalOpen(() => notificationsModal.onOpen(), 'notifications')}
              />
              <NavItem
                href="/settings"
                icon={SettingsIcon}
                label="Settings"
                isActive={isActive('/settings')}
              />
            </ul>
          </div>
        </div>

      </div>
    </>
  );
}

export default Sidebar;
