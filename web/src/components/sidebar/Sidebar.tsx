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
import useLoginModal from "@/app/hooks/useLoginModal";
import useInboxModal from "@/app/hooks/useInboxModal";
import useNotificationsModal from "@/app/hooks/useNotificationsModal";
import { clearEarlyAccess } from "@/app/utils/earlyAccess";

interface SidebarProps {
  currentUser?: {
    id?: string;
    name?: string | null;
    image?: string | null;
  } | null;
}

const phrases = [
  "Stay Curious",
  "Find Yours",
  "Locally Made",
  "Intentional Living",
  "Discover More",
  "Made Local",
  "Your Taste",
];

const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const pathname = usePathname();
  const router = useRouter();
  const loginModal = useLoginModal();
  const inboxModal = useInboxModal();
  const notificationsModal = useNotificationsModal();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState<number | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Hide sidebar on full-screen pages
  const isFullScreenPage = pathname?.startsWith('/register') || pathname?.startsWith('/listing/new') || pathname?.startsWith('/reserve');

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) setIsCollapsed(saved === "true");

    // Set random phrase on client only to avoid hydration mismatch
    setPhraseIndex(Math.floor(Math.random() * phrases.length));

    // Only animate once per session
    const animated = sessionStorage.getItem("sidebarAnimated");
    if (!animated) {
      sessionStorage.setItem("sidebarAnimated", "true");
      setTimeout(() => setHasAnimated(true), 50);
    } else {
      setHasAnimated(true);
    }
  }, []);

  // Hide sidebar on full-screen pages (after hooks)
  if (isFullScreenPage) return null;

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
    window.dispatchEvent(new Event("sidebarToggle"));
  };

  const isActive = (path: string, includes?: string[]) => {
    if (pathname === path) return true;
    if (includes?.some(p => pathname?.startsWith(p))) return true;
    return false;
  };

  const navItems = [
    { label: "Discover", href: "/", active: isActive("/", ["/post"]) },
    { label: "Businesses", href: "/market", active: isActive("/market", ["/market", "/listings"]) },
    { label: "Shops", href: "/shops", active: isActive("/shops", ["/shops"]) },
    ...(currentUser ? [
      { label: "Appointments", href: "/bookings/reservations", active: isActive("/bookings/reservations", ["/bookings"]) },
      { label: "Favorites", href: "/favorites", active: isActive("/favorites") },
      { label: "Inbox", onClick: () => inboxModal.onOpen(currentUser), active: false },
      { label: "Notifications", onClick: () => notificationsModal.onOpen(), active: false },
    ] : []),
    { label: "Settings", href: "/settings", active: isActive("/settings") },
  ];

  // Skip animation if already animated this session
  const shouldAnimate = !hasAnimated;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-100 border-r border-zinc-200 transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-56"
      } ${shouldAnimate ? 'opacity-0' : 'opacity-100'}`}
      style={{
        opacity: hasAnimated ? 1 : 0,
        transition: 'opacity 0.5s ease-out'
      }}
    >
      {/* Logo */}
      <div
        className="flex flex-col items-center justify-center pt-16 pb-4"
        style={{
          opacity: hasAnimated ? 1 : 0,
          transform: hasAnimated ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s'
        }}
      >
        <Link href="/" className="group">
          <Image src="/logos/black.png" alt="Logo" width={30} height={40} className="opacity-90 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>
        {!isCollapsed && phraseIndex !== null && (
          <p
            className="mt-3.5 text-sm tracking-wide text-zinc-500"
            style={{
              opacity: hasAnimated ? 1 : 0,
              transition: 'opacity 0.6s ease-out 0.25s'
            }}
          >
            {phrases[phraseIndex]}
          </p>
        )}
      </div>

      {/* User */}
      <div
        className={`mx-6 mt-4 mb-3 ${isCollapsed ? "mx-2" : ""}`}
        style={{
          opacity: hasAnimated ? 1 : 0,
          transform: hasAnimated ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.5s ease-out 0.15s, transform 0.5s ease-out 0.15s'
        }}
      >
        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DropdownMenuTrigger className="w-full outline-none">
            <div className={`group flex items-center gap-3 p-3 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all duration-300 cursor-pointer ${isCollapsed ? "justify-center p-2" : ""}`}>
              {currentUser?.image ? (
                <Image src={currentUser.image} alt="" width={32} height={32} className="rounded-lg" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-500 text-xs font-semibold">
                  G
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-medium text-zinc-900 truncate">
                    {currentUser?.name
                      ? currentUser.name.split(" ").length > 1
                        ? `${currentUser.name.split(" ")[0]} ${currentUser.name.split(" ").slice(-1)[0][0]}.`
                        : currentUser.name
                      : "Guest"}
                  </p>
                  <p className={`text-[11px] ${currentUser ? "text-emerald-600" : "text-zinc-500"}`}>{currentUser ? "Online" : "Tap to join"}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-48 mt-2">
            {currentUser ? (
              <>
                <DropdownMenuItem onClick={() => router.push(`/profile/${currentUser.id}`)} className="text-zinc-700 hover:bg-zinc-100">Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/properties")} className="text-zinc-700 hover:bg-zinc-100">Listings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/analytics")} className="text-zinc-700 hover:bg-zinc-100">Analytics</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/subscription")} className="text-zinc-700 hover:bg-zinc-100">Subscription</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { if(confirm("Clear early access?")) clearEarlyAccess(); }} className="text-red-500 hover:bg-zinc-100 hover:text-red-500">Clear Data</DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="text-zinc-700 hover:bg-zinc-100">Sign Out</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => loginModal.onOpen()} className="text-zinc-700 hover:bg-zinc-100">Sign In</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/register")} className="text-zinc-700 hover:bg-zinc-100">Sign Up</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 pt-2 flex flex-col"
        style={{
          opacity: hasAnimated ? 1 : 0,
          transition: 'opacity 0.5s ease-out 0.2s'
        }}
      >
        <div className="space-y-1 pl-[76px]">
          {navItems.map((item, i) => {
            const El = item.href ? Link : "button";
            return (
              <El
                key={i}
                href={item.href as string}
                onClick={item.onClick}
                className={`group flex items-center gap-2.5 py-2.5 text-[14px] ${isCollapsed ? "justify-center" : ""}`}
              >
                {!isCollapsed && (
                  <span className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    item.active
                      ? "text-zinc-900 font-medium opacity-100"
                      : "text-zinc-500 opacity-60 group-hover:opacity-100 group-hover:text-zinc-700"
                  }`}>{item.label}</span>
                )}
              </El>
            );
          })}
        </div>
      </nav>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button onClick={toggle} className="p-4 text-zinc-400 hover:text-zinc-600">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="1.5" d="M9 6l6 6-6 6"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Sidebar;
