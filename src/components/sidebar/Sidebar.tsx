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
  const settingsModal = useSettingsModal();
  const loginModal = useLoginModal();
  const inboxModal = useInboxModal();
  const notificationsModal = useNotificationsModal();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [phraseIndex] = useState(() => Math.floor(Math.random() * phrases.length));

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) setIsCollapsed(saved === "true");
  }, []);

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
    { label: "Shops", href: "/shops", active: isActive("/shops") },
    ...(currentUser ? [
      { label: "Appointments", href: "/bookings/reservations", active: isActive("/bookings") },
      { label: "Favorites", href: "/favorites", active: isActive("/favorites") },
      { label: "Inbox", onClick: () => inboxModal.onOpen(currentUser), active: false },
      { label: "Notifications", onClick: () => notificationsModal.onOpen(), active: false },
    ] : []),
    { label: "Settings", onClick: () => settingsModal.onOpen(), active: false },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-900 border-r border-zinc-800/50 transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex flex-col items-center justify-center pt-16 pb-4">
        <Link href="/" className="group">
          <Image src="/logos/black.png" alt="Logo" width={30} height={40} className="invert opacity-90 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>
        {!isCollapsed && (
          <p className="mt-3.5 text-sm tracking-wide text-zinc-500">
            {phrases[phraseIndex]}
          </p>
        )}
      </div>

      {/* User */}
      <div className={`mx-4 mt-4 mb-3 ${isCollapsed ? "mx-2" : ""}`}>
        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DropdownMenuTrigger className="w-full outline-none">
            <div className={`group flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-all duration-300 cursor-pointer ${isCollapsed ? "justify-center p-2" : ""}`}>
              <div className="relative">
                {currentUser?.image ? (
                  <Image src={currentUser.image} alt="" width={32} height={32} className="rounded-xl ring-1 ring-emerald-500/30" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/20 via-zinc-800 to-zinc-900 ring-1 ring-rose-500/30 flex items-center justify-center text-rose-400/90 text-xs font-semibold tracking-tight">
                    G
                  </div>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${currentUser ? "bg-emerald-400" : "bg-red-500"}`} />
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-medium text-white truncate">
                    {currentUser?.name
                      ? currentUser.name.split(" ").length > 1
                        ? `${currentUser.name.split(" ")[0]} ${currentUser.name.split(" ").slice(-1)[0][0]}.`
                        : currentUser.name
                      : "Guest"}
                  </p>
                  <p className="text-[11px] text-zinc-500">Online</p>
                </div>
              )}
              {!isCollapsed && (
                <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-48 mt-1">
            {currentUser ? (
              <>
                <DropdownMenuItem onClick={() => router.push(`/profile/${currentUser.id}`)}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/properties")}>Listings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/analytics")}>Analytics</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/subscription")}>Subscription</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { if(confirm("Clear early access?")) clearEarlyAccess(); }} className="text-red-600">Clear Data</DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => loginModal.onOpen()}>Sign In</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/register")}>Sign Up</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 pt-2 flex flex-col">
        <div className="space-y-1 pl-[58px]">
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
                  <>
                    <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ease-out ${
                      item.active
                        ? "bg-white opacity-100 -translate-x-0.5"
                        : "bg-zinc-500 opacity-0 -translate-x-2.5 group-hover:opacity-100 group-hover:-translate-x-0.5"
                    }`} />
                    <span className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                      item.active
                        ? "text-white font-medium opacity-100"
                        : "text-zinc-500 opacity-60 group-hover:opacity-100 group-hover:text-zinc-300"
                    }`}>{item.label}</span>
                  </>
                )}
              </El>
            );
          })}
        </div>
      </nav>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <button onClick={toggle} className="p-4 text-zinc-500 hover:text-zinc-300">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="1.5" d="M9 6l6 6-6 6"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Sidebar;
