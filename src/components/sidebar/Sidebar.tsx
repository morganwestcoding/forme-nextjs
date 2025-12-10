"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSettingsModal from "@/app/hooks/useSettingsModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useInboxModal from "@/app/hooks/useInboxModal";
import useNotificationsModal from "@/app/hooks/useNotificationsModal";
import { clearEarlyAccess } from "@/app/utils/earlyAccess";

interface SidebarProps {
  currentUser?: {
    id?: string;
    name?: string | null;
    image?: string | null;
    subscriptionTier?: string | null;
  } | null;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

// Sidebar toggle icon (matches the reference)
const SidebarToggleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 4V20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

// Helper functions
const formatTier = (tier?: string | null) => {
  const cleaned = String(tier || "")
    .replace(/\s*\(.*\)\s*$/, "")
    .trim()
    .toLowerCase();
  const base = cleaned || "bronze";
  return base.charAt(0).toUpperCase() + base.slice(1);
};

const getFirstName = (name?: string | null) => {
  if (!name) return "Guest";
  return name.trim().split(/\s+/)[0];
};

const formatUserName = (name?: string | null) => {
  if (!name) return "Guest";
  const nameParts = name.trim().split(/\s+/);
  if (nameParts.length === 1) return nameParts[0];
  const firstName = nameParts[0];
  const lastNameInitial = nameParts[nameParts.length - 1]?.[0]?.toUpperCase();
  return lastNameInitial ? `${firstName} ${lastNameInitial}.` : firstName;
};

const ROTATING_PHRASES = [
  "Psst.",
  "Hey you.",
  "Looking good.",
  "Welcome back.",
  "Let's go.",
];

const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const pathname = usePathname();
  const router = useRouter();
  const settingsModal = useSettingsModal();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const inboxModal = useInboxModal();
  const notificationsModal = useNotificationsModal();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setIsCollapsed(savedState === "true");
    }
  }, []);

  // Pick a random phrase once per session
  useEffect(() => {
    const savedPhrase = sessionStorage.getItem("sidebarPhrase");
    if (savedPhrase !== null) {
      setPhraseIndex(parseInt(savedPhrase, 10));
    } else {
      const randomIndex = Math.floor(Math.random() * ROTATING_PHRASES.length);
      setPhraseIndex(randomIndex);
      sessionStorage.setItem("sidebarPhrase", String(randomIndex));
    }
  }, []);

  const handleClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUserMenuOpen(false);
    callback();
  };

  const handleSignOut = handleClick(() => signOut());
  const handleSignIn = handleClick(() => loginModal.onOpen());
  const handleSignUp = handleClick(() => registerModal.onOpen());
  const handleProfile = handleClick(() => {
    if (currentUser?.id) router.push(`/profile/${currentUser.id}`);
  });
  const handleListings = handleClick(() => router.push("/properties"));
  const handleAnalytics = handleClick(() => router.push("/analytics"));
  const handleSubscribe = handleClick(() => router.push("/subscription"));
  const handleLicensing = handleClick(() => router.push("/licensing"));
  const handleSettings = handleClick(() => settingsModal.onOpen());
  const handleClearEarlyAccess = handleClick(() => {
    if (window.confirm('Are you sure you want to clear early access? You will need the access code to re-enter the app.')) {
      clearEarlyAccess();
    }
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
    window.dispatchEvent(new Event("sidebarToggle"));
  };

  const isActiveNav = (item: NavItem): boolean => {
    if (item.id === "discover") return pathname === "/" || (pathname?.startsWith("/post") ?? false);
    if (item.id === "businesses") return (pathname?.startsWith("/market") ?? false) || (pathname?.startsWith("/listings") ?? false);
    if (item.id === "shops") return pathname?.startsWith("/shops") ?? false;
    if (item.id === "appointments") return pathname?.startsWith("/bookings") ?? false;
    if (item.id === "favorites") return pathname?.startsWith("/favorites") ?? false;
    return false;
  };

  // Browse navigation items
  const browseItems: NavItem[] = [
    {
      id: "discover",
      label: "Discover",
      href: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      ),
    },
    {
      id: "businesses",
      label: "Businesses",
      href: "/market",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M3 10.9871V15.4925C3 18.3243 3 19.7403 3.87868 20.62C4.75736 21.4998 6.17157 21.4998 9 21.4998H15C17.8284 21.4998 19.2426 21.4998 20.1213 20.62C21 19.7403 21 18.3243 21 15.4925V10.9871" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M15 17C14.3159 17.6071 13.2268 18 12 18C10.7732 18 9.68412 17.6071 9 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M17.7957 2.50294L6.14983 2.53202C4.41166 2.44248 3.966 3.78259 3.966 4.43768C3.966 5.02359 3.89055 5.87774 2.82524 7.4831C1.75993 9.08846 1.83998 9.56536 2.44071 10.6767C2.93928 11.5991 4.20741 11.9594 4.86862 12.02C6.96883 12.0678 7.99065 10.2517 7.99065 8.97523C9.03251 12.1825 11.9956 12.1825 13.3158 11.8157C14.6386 11.4483 15.7717 10.1331 16.0391 8.97523C16.195 10.4142 16.6682 11.2538 18.0663 11.8308C19.5145 12.4284 20.7599 11.515 21.3848 10.9294C22.0097 10.3439 22.4107 9.04401 21.2968 7.6153C20.5286 6.63001 20.2084 5.7018 20.1033 4.73977C20.0423 4.18234 19.9888 3.58336 19.5972 3.20219C19.0248 2.64515 18.2036 2.47613 17.7957 2.50294Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "shops",
      label: "Shops",
      href: "/shops",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M3.06164 15.1933L3.42688 13.1219C3.85856 10.6736 4.0744 9.44952 4.92914 8.72476C5.78389 8 7.01171 8 9.46734 8H14.5765C17.0321 8 18.2599 8 19.1147 8.72476C19.9694 9.44952 20.1853 10.6736 20.6169 13.1219L20.9822 15.1933C21.6157 18.5811 21.9324 20.275 20.965 21.3875C19.9975 22.5 18.2839 22.5 14.8566 22.5H9.18777C5.76045 22.5 4.0468 22.5 3.07935 21.3875C2.11191 20.275 2.42856 18.5811 3.06164 15.1933Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7.5 8L7.66782 5.98618C7.85558 3.73306 9.73907 2 12 2C14.2609 2 16.1444 3.73306 16.3322 5.98618L16.5 8" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M15 11C15 12.6569 13.6569 14 12 14C10.3431 14 9 12.6569 9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: "appointments",
      label: "Appointments",
      href: "/bookings/reservations",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M18 2V4M6 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M2.5 12.2432C2.5 7.88594 2.5 5.70728 3.75212 4.35364C5.00424 3 7.01949 3 11.05 3H12.95C16.9805 3 18.9958 3 20.2479 4.35364C21.5 5.70728 21.5 7.88594 21.5 12.2432V12.7568C21.5 17.1141 21.5 19.2927 20.2479 20.6464C18.9958 22 16.9805 22 12.95 22H11.05C7.01949 22 5.00424 22 3.75212 20.6464C2.5 19.2927 2.5 17.1141 2.5 12.7568V12.2432Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: "favorites",
      label: "Favorites",
      href: "/favorites",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: "inbox",
      label: "Inbox",
      onClick: () => inboxModal.onOpen(currentUser),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      onClick: () => notificationsModal.onOpen(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M2.52992 14.7696C2.31727 16.1636 3.268 17.1312 4.43205 17.6134C8.89481 19.4622 15.1052 19.4622 19.5679 17.6134C20.732 17.1312 21.6827 16.1636 21.4701 14.7696C21.3394 13.9129 20.6932 13.1995 20.2144 12.5029C19.5873 11.5793 19.525 10.5718 19.5249 9.5C19.5249 5.35786 16.1559 2 12 2C7.84413 2 4.47513 5.35786 4.47513 9.5C4.47503 10.5718 4.41272 11.5793 3.78561 12.5029C3.30684 13.1995 2.66061 13.9129 2.52992 14.7696Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 19C8.45849 20.7252 10.0755 22 12 22C13.9245 22 15.5415 20.7252 16 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      onClick: () => settingsModal.onOpen(),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M15.5 12C15.5 13.933 13.933 15.5 12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M21.011 14.0965C21.5329 13.9558 21.7939 13.8854 21.8969 13.7508C22 13.6163 22 13.3998 22 12.9669V11.0332C22 10.6003 22 10.3838 21.8969 10.2493C21.7938 10.1147 21.5329 10.0443 21.011 9.90358C19.0606 9.37759 17.8399 7.33851 18.3433 5.40087C18.4817 4.86799 18.5509 4.60156 18.4848 4.44529C18.4187 4.28902 18.2291 4.18134 17.8497 3.96596L16.125 2.98673C15.7528 2.77539 15.5667 2.66972 15.3997 2.69222C15.2326 2.71472 15.0442 2.90273 14.6672 3.27873C13.208 4.73448 10.7936 4.73442 9.33434 3.27864C8.95743 2.90263 8.76898 2.71463 8.60193 2.69212C8.43489 2.66962 8.24877 2.77529 7.87653 2.98663L6.15184 3.96587C5.77253 4.18123 5.58287 4.28891 5.51678 4.44515C5.45068 4.6014 5.51987 4.86787 5.65825 5.4008C6.16137 7.3385 4.93972 9.37763 2.98902 9.9036C2.46712 10.0443 2.20617 10.1147 2.10308 10.2492C2 10.3838 2 10.6003 2 11.0332V12.9669C2 13.3998 2 13.6163 2.10308 13.7508C2.20615 13.8854 2.46711 13.9558 2.98902 14.0965C4.9394 14.6225 6.16008 16.6616 5.65672 18.5992C5.51829 19.1321 5.44907 19.3985 5.51516 19.5548C5.58126 19.7111 5.77092 19.8188 6.15025 20.0341L7.87495 21.0134C8.24721 21.2247 8.43334 21.3304 8.6004 21.3079C8.76746 21.2854 8.95588 21.0973 9.33271 20.7212C10.7927 19.2644 13.2088 19.2643 14.6689 20.7212C15.0457 21.0973 15.2341 21.2853 15.4012 21.3078C15.5682 21.3303 15.7544 21.2246 16.1266 21.0133L17.8513 20.034C18.2307 19.8187 18.4204 19.711 18.4864 19.5548C18.5525 19.3985 18.4833 19.132 18.3449 18.5991C17.8417 16.6616 19.0626 14.6226 21.011 14.0965" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const navItems = browseItems;

  // Collapsed sidebar (icons only)
  if (isCollapsed) {
    return (
      <div className="fixed top-0 left-0 z-50 h-screen p-3">
        <div
          className="h-full w-[60px] flex flex-col items-center py-4 rounded-2xl border border-neutral-200"
          style={{ background: 'linear-gradient(to bottom, rgb(245 245 245) 0%, rgb(241 241 241) 100%)' }}
        >
          {/* Logo */}
          <Link href="/" className="mb-4">
            <Image
              src="/logos/black.png"
              alt="ForMe Logo"
              width={20}
              height={27}
              className="object-contain"
            />
          </Link>

          {/* Toggle button */}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg transition-colors hover:bg-neutral-50 mb-4 text-neutral-400"
          >
            <SidebarToggleIcon />
          </button>

          {/* Navigation icons */}
          <nav className="flex flex-col items-center gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = isActiveNav(item);
              const baseClassName = `p-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-neutral-100"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              }`;

              if (item.onClick) {
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={baseClassName}
                    style={isActive ? { color: 'var(--accent-color)' } : undefined}
                  >
                    {item.icon}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={baseClassName}
                  style={isActive ? { color: 'var(--accent-color)' } : undefined}
                >
                  {item.icon}
                </Link>
              );
            })}
          </nav>

          {/* Help icon */}
          <div
            className="p-2.5 rounded-xl text-neutral-300 cursor-not-allowed mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9C14 9.39815 13.8837 9.76913 13.6831 10.0808C13.0854 11.0097 12 11.8954 12 13V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Expanded sidebar
  return (
    <div className="fixed top-0 left-0 z-50 h-screen p-3">
      <div
        className="h-full w-[248px] flex flex-col rounded-2xl border border-neutral-200"
        style={{ background: 'linear-gradient(to bottom, rgb(245 245 245) 0%, rgb(241 241 241) 100%)' }}
      >
        {/* Header */}
        <div className="relative pt-4 pb-2">
          <button
            onClick={toggleCollapse}
            className="absolute top-4 right-5 p-2 rounded-lg transition-colors hover:bg-neutral-50 text-neutral-400"
          >
            <SidebarToggleIcon />
          </button>
          <div className="flex justify-center pt-[38px]">
            <Link href="/">
              <Image
                src="/logos/black.png"
                alt="ForMe Logo"
                width={26}
                height={35}
                className="object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Brand Text */}
        <div className="px-3 pt-1.5 text-center">
          <span className="text-base text-gray-500 transition-opacity duration-300">
            {ROTATING_PHRASES[phraseIndex]}
          </span>
        </div>

        {/* User Info */}
        <div className="px-3 pt-7 pb-4">
          <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <DropdownMenuTrigger className="w-full outline-none">
              <div className="flex items-center gap-2.5 bg-white border border-neutral-200 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="relative">
                  {currentUser?.image ? (
                    <Image
                      src={currentUser.image}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium bg-neutral-200 text-neutral-600">
                      {getFirstName(currentUser?.name)?.[0] || "G"}
                    </div>
                  )}
                  {currentUser?.id && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  {currentUser?.id ? (
                    <>
                      <span className="text-[14px] font-medium truncate text-neutral-800 text-left">
                        {formatUserName(currentUser?.name)}
                      </span>
                      <span className="text-xs text-neutral-500 text-left">
                        {formatTier(currentUser?.subscriptionTier)} Tier
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[14px] font-medium text-neutral-800 text-left">
                        Welcome
                      </span>
                      <span className="text-xs text-neutral-400 text-left">
                        Sign in or join us
                      </span>
                    </>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  className={`text-neutral-400 flex-shrink-0 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                >
                  <path d="M18 9L12 15L6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-white rounded-xl px-1 py-2 border border-neutral-200 z-[100] w-[224px]"
              side="bottom"
              align="start"
              sideOffset={8}
            >
              {currentUser?.id ? (
                <>
                  <DropdownMenuItem onClick={handleProfile}>My Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleListings}>My Listings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAnalytics}>My Analytics</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSubscribe}>Subscription</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLicensing}>Licensing</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettings}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleClearEarlyAccess}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clean
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleSignIn}>Sign in</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignUp}>Sign up</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation List */}
        <nav className="px-3 pt-[7px] flex-1 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = isActiveNav(item);
              const baseClassName = `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-neutral-100"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
              }`;

              if (item.onClick) {
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`${baseClassName} w-full text-left`}
                    style={isActive ? { color: 'var(--accent-color)' } : undefined}
                  >
                    <span className={isActive ? "" : "opacity-70"}>{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={baseClassName}
                  style={isActive ? { color: 'var(--accent-color)' } : undefined}
                >
                  <span className={isActive ? "" : "opacity-70"}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Help & Support */}
        <div className="px-3 pb-4 mt-auto">
          <div
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-300 cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9C14 9.39815 13.8837 9.76913 13.6831 10.0808C13.0854 11.0097 12 11.8954 12 13V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
            </svg>
            <span className="text-sm">Help & Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
