'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GridViewIcon,
  Route01Icon,
  GpsSignal01Icon,
  Search01Icon,
  Cancel01Icon,
  Tick02Icon,
  ArrowRight02Icon,
  SparklesIcon,
  UserCircleIcon,
  Compass01Icon,
  Calendar03Icon,
  Clock04Icon,
  FavouriteIcon,
  BubbleChatIcon,
  ServiceIcon,
  UserMultipleIcon,
  AnalyticsUpIcon,
  SchoolIcon,
} from 'hugeicons-react';
import Modal from './Modal';
import Logo from '@/components/ui/Logo';
import useWelcomeModal from '@/app/hooks/useWelcomeModal';
import useWalkthrough from '@/app/hooks/useWalkthrough';
import walkthroughSteps from '@/components/walkthrough/walkthroughSteps';
import { categories } from '@/components/Categories';
import { hasFeature } from '@/app/utils/subscription';
import { SafeUser } from '@/app/types';

const WELCOME_PENDING_KEY = 'forme-welcome-pending';

// Kill switch: set to false to fully suppress the welcome modal auto-open
// flow (it can still be invoked manually via useWelcomeModal().onOpen()).
const WELCOME_AUTO_OPEN_ENABLED = false;

type Screen = 'welcome' | 'interests' | 'location' | 'started';

const SCREEN_ORDER: Screen[] = ['welcome', 'interests', 'location', 'started'];

const PostIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="7.5" r="1.5" />
    <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" />
    <path d="M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424" />
  </svg>
);

const ShopIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 8.75L15.0447 19.5532C15.015 19.684 15 19.8177 15 19.9518C15 20.9449 15.8051 21.75 16.7982 21.75H18" />
    <path d="M19.2192 21.75H4.78078C3.79728 21.75 3 20.9527 3 19.9692C3 19.8236 3.01786 19.6786 3.05317 19.5373L5.24254 10.7799C5.60631 9.32474 5.78821 8.59718 6.33073 8.17359C6.87325 7.75 7.6232 7.75 9.12311 7.75H14.8769C16.3768 7.75 17.1267 7.75 17.6693 8.17359C18.2118 8.59718 18.3937 9.32474 18.7575 10.7799L20.9468 19.5373C20.9821 19.6786 21 19.8236 21 19.9692C21 20.9527 20.2027 21.75 19.2192 21.75Z" />
    <path d="M15 7.75V5.75C15 4.09315 13.6569 2.75 12 2.75C10.3431 2.75 9 4.09315 9 5.75V7.75" />
  </svg>
);

interface WelcomeModalProps {
  currentUser?: SafeUser | null;
  /**
   * When true, the modal auto-opens once after a fresh registration
   * (createdAt within ~10 minutes). Returning users never see it pop;
   * they can re-trigger via the user menu.
   */
  isFirstTimeUser?: boolean;
}

const POPULAR_CITIES = [
  { city: 'Los Angeles', state: 'CA' },
  { city: 'New York', state: 'NY' },
  { city: 'Miami', state: 'FL' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Austin', state: 'TX' },
  { city: 'Seattle', state: 'WA' },
];

interface MapboxFeature {
  place_name: string;
  text: string;
  context?: Array<{ id: string; text: string; short_code?: string }>;
}

interface CitySuggestion {
  label: string;
}

const formatLabel = (city: string, state: string) => `${city}, ${state}`;

// Accent gradient pairs (per-card hover tint). Hoisted so they're stable
// across renders and don't bust the actionCards useMemo.
const ACCENTS = {
  warm:  'from-[#dac6be]/30 to-[#c1a093]/20',
  blue:  'from-[#B3C5D1]/30 to-[#86A4BB]/20',
  sage:  'from-[#C4D4A9]/30 to-[#86A4BB]/20',
  blush: 'from-[#E8B4B8]/30 to-[#C4A882]/20',
  sand:  'from-[#F5E6D3]/40 to-[#D4B5A0]/20',
} as const;

const STARTED_HEADINGS: Record<
  'customer' | 'independent' | 'team_worker' | 'manager' | 'student',
  { title: string; sub: string }
> = {
  customer:    { title: 'Find what you love', sub: 'Pick where to dive in — or take the quick tour first.' },
  independent: { title: 'Time to get discovered', sub: 'Set up your work, then take the tour.' },
  team_worker: { title: 'Welcome to your team', sub: 'Sort out your profile and bookings — tour optional.' },
  manager:     { title: 'Run your shop', sub: 'Set the foundation, then learn your way around.' },
  student:     { title: 'Settle into your academy', sub: 'Show up well — then explore.' },
};

const WelcomeModal: React.FC<WelcomeModalProps> = ({ currentUser, isFirstTimeUser }) => {
  const router = useRouter();
  const pathname = usePathname();
  const welcomeModal = useWelcomeModal();
  const walkthrough = useWalkthrough();

  const [screen, setScreen] = useState<Screen>('welcome');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser?.interests || []);
  const [location, setLocation] = useState<string>(currentUser?.location || '');
  const [hasChecked, setHasChecked] = useState(false);

  // ---------- Auto-open trigger ----------
  // Only opens for brand-new accounts that haven't dismissed yet, and ONLY
  // on the home route. The sessionStorage flag is set by TypeformFlow on
  // registration submit and survives the licensing/subscription onboarding
  // redirects (including the Celebration → window.location='/' handoff).
  // Path-gating to '/' keeps the modal from popping mid-checkout on
  // /licensing or /subscription.
  useEffect(() => {
    if (!WELCOME_AUTO_OPEN_ENABLED) {
      setHasChecked(true);
      return;
    }
    if (!currentUser) {
      setHasChecked(true);
      return;
    }
    if (currentUser.hideWelcomeModal) {
      setHasChecked(true);
      return;
    }
    if (pathname !== '/') {
      setHasChecked(true);
      return;
    }
    const sessionPending =
      typeof window !== 'undefined' &&
      sessionStorage.getItem(WELCOME_PENDING_KEY) === '1';

    if (sessionPending || isFirstTimeUser) {
      const t = setTimeout(() => welcomeModal.onOpen(), 600);
      setHasChecked(true);
      return () => clearTimeout(t);
    }
    setHasChecked(true);
  }, [currentUser, isFirstTimeUser, welcomeModal, pathname]);

  // ---------- Persistence helpers ----------
  const persistInterests = useCallback(() => {
    if (!currentUser || selectedInterests.length === 0) return;
    axios
      .put(`/api/users/${currentUser.id}`, { interests: selectedInterests })
      .catch(() => {});
  }, [currentUser, selectedInterests]);

  const persistLocation = useCallback(() => {
    if (!currentUser || !location.trim()) return;
    axios
      .put(`/api/users/${currentUser.id}`, { location })
      .catch(() => {});
  }, [currentUser, location]);

  const markCompleted = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(WELCOME_PENDING_KEY);
    }
    if (currentUser) {
      axios
        .put(`/api/users/${currentUser.id}`, { hideWelcomeModal: true })
        .catch(() => {});
    }
  }, [currentUser]);

  // ---------- Navigation helpers ----------
  const goTo = useCallback((next: Screen) => {
    setDirection(SCREEN_ORDER.indexOf(next) > SCREEN_ORDER.indexOf(screen) ? 1 : -1);
    setScreen(next);
  }, [screen]);

  const closeAndComplete = useCallback(() => {
    markCompleted();
    welcomeModal.onClose();
    setTimeout(() => setScreen('welcome'), 300);
  }, [markCompleted, welcomeModal]);

  const handleAction = useCallback(
    (path: string) => {
      markCompleted();
      welcomeModal.onClose();
      router.push(path);
    },
    [markCompleted, welcomeModal, router]
  );

  const handleStartTour = useCallback(() => {
    markCompleted();
    welcomeModal.onClose();
    setTimeout(() => walkthrough.start(walkthroughSteps), 320);
  }, [markCompleted, welcomeModal, walkthrough]);

  const toggleInterest = (label: string) => {
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  // ---------- Location search (Mapbox geocoding) ----------
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!token || query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?types=place&country=us&limit=6&access_token=${token}`,
      );
      const data = await res.json();
      const cities: CitySuggestion[] = (data.features || []).map((f: MapboxFeature) => {
        const stateShort = f.context
          ?.find((c) => c.id.startsWith('region'))
          ?.short_code?.replace('US-', '');
        return { label: stateShort ? `${f.text}, ${stateShort}` : f.place_name };
      });
      setSuggestions(cities);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(search.trim()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchSuggestions]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!('geolocation' in navigator) || !token) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place&access_token=${token}`,
          );
          const data = await res.json();
          const f: MapboxFeature | undefined = data.features?.[0];
          if (!f) {
            setGeoStatus('error');
            return;
          }
          const stateShort = f.context
            ?.find((c) => c.id.startsWith('region'))
            ?.short_code?.replace('US-', '');
          setLocation(stateShort ? `${f.text}, ${stateShort}` : f.place_name);
          setGeoStatus('idle');
        } catch {
          setGeoStatus('error');
        }
      },
      () => setGeoStatus('error'),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, [token]);

  const hasQuery = search.trim().length >= 2;

  // ---------- Derived UI ----------
  const stepIndex = SCREEN_ORDER.indexOf(screen);
  const showProgress = screen !== 'welcome';

  const slideVariants = useMemo(
    () => ({
      enter: (dir: number) => ({ x: dir > 0 ? 28 : -28, opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (dir: number) => ({ x: dir > 0 ? -28 : 28, opacity: 0 }),
    }),
    []
  );

  // ---------- Role detection ----------
  // Manager status comes from managedListings, not just role — site admins
  // (role=master/admin) are also implicitly managers.
  const role: 'customer' | 'independent' | 'team_worker' | 'manager' | 'student' = useMemo(() => {
    if (!currentUser) return 'customer';
    const ut = currentUser.userType;
    const isAdmin = currentUser.role === 'master' || currentUser.role === 'admin';
    const isManager = (currentUser.managedListings?.length ?? 0) > 0 || isAdmin;
    if (ut === 'team' && isManager) return 'manager';
    if (ut === 'team') return 'team_worker';
    if (ut === 'individual') return 'independent';
    if (ut === 'student') return 'student';
    return 'customer';
  }, [currentUser]);

  const startedHeading = STARTED_HEADINGS[role];

  const actionCards: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    onClick: () => void;
    accent?: string;
  }> = useMemo(() => {
    const profileHref = currentUser ? `/profile/${currentUser.id}` : '/';

    if (role === 'customer') {
      return [
        { icon: Compass01Icon, label: 'Find services near you', description: 'Browse local pros and shops', onClick: () => handleAction('/'), accent: ACCENTS.sage },
        { icon: Calendar03Icon, label: 'My bookings', description: 'Track upcoming reservations', onClick: () => handleAction('/bookings/reservations?direction=outgoing'), accent: ACCENTS.warm },
        { icon: FavouriteIcon, label: 'Saved favorites', description: 'Pick up where you left off', onClick: () => handleAction('/favorites'), accent: ACCENTS.blush },
        { icon: BubbleChatIcon, label: 'Message a pro', description: 'Ask before you book', onClick: () => handleAction('/messages'), accent: ACCENTS.blue },
      ];
    }

    if (role === 'independent') {
      return [
        { icon: UserCircleIcon, label: 'Complete your profile', description: 'Bio, gallery, and headline', onClick: () => handleAction(profileHref), accent: ACCENTS.warm },
        { icon: ServiceIcon, label: 'Add your services', description: 'What you offer and pricing', onClick: () => handleAction('/team?tab=services'), accent: ACCENTS.sage },
        { icon: PostIcon, label: 'Share a post', description: 'Show recent work to your feed', onClick: () => handleAction('/post/new'), accent: ACCENTS.blue },
        { icon: Calendar03Icon, label: 'Incoming bookings', description: 'See requests as they arrive', onClick: () => handleAction('/bookings/reservations?direction=incoming'), accent: ACCENTS.blush },
      ];
    }

    if (role === 'team_worker') {
      return [
        { icon: UserCircleIcon, label: 'Complete your profile', description: 'Bio, gallery, and headline', onClick: () => handleAction(profileHref), accent: ACCENTS.warm },
        { icon: ServiceIcon, label: 'My services', description: 'What you can be booked for', onClick: () => handleAction('/team?tab=services'), accent: ACCENTS.sage },
        { icon: Clock04Icon, label: 'My schedule', description: 'Set your hours and availability', onClick: () => handleAction('/team?tab=schedule'), accent: ACCENTS.blue },
        { icon: Calendar03Icon, label: 'Incoming bookings', description: 'See requests as they arrive', onClick: () => handleAction('/bookings/reservations?direction=incoming'), accent: ACCENTS.blush },
      ];
    }

    if (role === 'manager') {
      const analyticsUnlocked = currentUser ? hasFeature(currentUser, 'analytics') : false;
      const fourthCard = analyticsUnlocked
        ? { icon: AnalyticsUpIcon, label: 'View analytics', description: 'Bookings, revenue, and growth', onClick: () => handleAction('/analytics'), accent: ACCENTS.sand }
        : { icon: ShopIcon, label: 'Open a shop', description: 'Sell products to your community', onClick: () => handleAction('/shop/new'), accent: ACCENTS.sand };
      return [
        { icon: UserMultipleIcon, label: 'Manage team', description: 'Roster, schedule, and pay', onClick: () => handleAction('/team'), accent: ACCENTS.warm },
        { icon: Calendar03Icon, label: 'Incoming bookings', description: 'Confirm and track reservations', onClick: () => handleAction('/bookings/reservations?direction=incoming'), accent: ACCENTS.blush },
        { icon: GridViewIcon, label: 'Edit your listing', description: 'Photos, services, and hours', onClick: () => handleAction('/properties'), accent: ACCENTS.sage },
        fourthCard,
      ];
    }

    // student
    return [
      { icon: UserCircleIcon, label: 'Complete your profile', description: 'Bio, gallery, and headline', onClick: () => handleAction(profileHref), accent: ACCENTS.warm },
      { icon: SchoolIcon, label: 'My academy', description: 'See where you train', onClick: () => handleAction('/newsfeed'), accent: ACCENTS.blue },
      { icon: PostIcon, label: 'Share a post', description: 'Show your progress', onClick: () => handleAction('/post/new'), accent: ACCENTS.sage },
      { icon: Compass01Icon, label: 'Browse community', description: 'Discover shops and pros', onClick: () => handleAction('/'), accent: ACCENTS.blush },
    ];
  }, [role, currentUser, handleAction]);

  if (!hasChecked) return null;

  // ---------- Screens ----------
  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {SCREEN_ORDER.slice(1).map((s, i) => {
        const reachedIdx = SCREEN_ORDER.indexOf(s);
        const active = reachedIdx === stepIndex;
        const completed = reachedIdx < stepIndex;
        return (
          <span
            key={s}
            className={`h-1 rounded-full transition-all duration-300 ${
              active
                ? 'w-8 bg-stone-900 dark:bg-stone-100'
                : completed
                ? 'w-4 bg-stone-700 dark:bg-stone-300'
                : 'w-4 bg-stone-200 dark:bg-stone-700'
            }`}
            aria-hidden
          />
        );
      })}
    </div>
  );

  const welcomeBody = (
    <div className="relative flex flex-col items-center text-center pt-2 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 0.9, 0.3, 1] }}
        className="mb-5 mt-2"
      >
        <Logo priority width={84} height={54} className="" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 0.9, 0.3, 1] }}
        className="relative"
      >
        <p className="text-sm font-medium text-stone-400 dark:text-stone-500 mb-2.5">
          Welcome{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-100 leading-[1.05] tracking-[-0.02em] mb-3 max-w-md">
          Your local world,
          <br />
          curated for you.
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm mx-auto">
          Discover trusted professionals, book services, shop products, and connect with your community — all in one place.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="relative mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/70 dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700/70"
      >
        <SparklesIcon className="w-3 h-3 text-stone-500 dark:text-stone-400" strokeWidth={1.8} />
        <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
          A 60-second setup, then you&apos;re in.
        </span>
      </motion.div>
    </div>
  );

  const interestsBody = (
    <div className="py-1">
      <ProgressDots />
      <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-1.5 text-center tracking-[-0.015em]">
        What moves you?
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-500 mb-6 text-center max-w-xs mx-auto">
        Pick a few categories so we can shape your feed around what you love.
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {categories.map((category) => {
          const isSelected = selectedInterests.includes(category.label);
          return (
            <motion.button
              key={category.label}
              type="button"
              onClick={() => toggleInterest(category.label)}
              whileTap={{ scale: 0.97 }}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className={`relative overflow-hidden p-3 rounded-2xl border text-center transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none ${
                isSelected
                  ? 'border-stone-900 dark:border-stone-100 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-[0_4px_18px_-6px_rgba(0,0,0,0.25)]'
                  : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              <span className={`block text-sm font-medium ${isSelected ? '' : ''}`}>
                {category.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-stone-400 dark:text-stone-500 text-center mt-5">
        {selectedInterests.length > 0
          ? `${selectedInterests.length} selected`
          : 'Optional · pick any time later'}
      </p>
    </div>
  );

  const renderLocationRow = (label: string) => {
    const selected = location === label;
    const [city, state] = label.split(',').map((p) => p.trim());
    return (
      <button
        key={label}
        type="button"
        onClick={() => setLocation(label)}
        className={`flex items-center gap-2 px-3 h-11 rounded-xl border text-left transition-all ${
          selected
            ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800/60'
            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800/40'
        }`}
      >
        <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
          <p className="text-sm text-stone-900 dark:text-stone-100 truncate">{city}</p>
          {state && (
            <p className="text-xs text-stone-400 dark:text-stone-500 shrink-0">{state}</p>
          )}
        </div>
        {selected && (
          <Tick02Icon className="w-3.5 h-3.5 text-stone-900 dark:text-stone-100 shrink-0" strokeWidth={2.4} />
        )}
      </button>
    );
  };

  const locationBody = (
    <div className="py-1">
      <ProgressDots />
      <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-1.5 text-center tracking-[-0.015em]">
        Where are you based?
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-500 mb-5 text-center max-w-xs mx-auto">
        We&apos;ll surface businesses, professionals, and shops near you first.
      </p>

      {/* Selected card */}
      {location && (
        <div className="mb-4 flex items-center gap-3 px-4 h-14 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500">
              Selected
            </p>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
              {location}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLocation('')}
            className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search01Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500"
          strokeWidth={1.75}
        />
        <input
          type="text"
          placeholder="Search any U.S. city"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl pl-11 pr-10 h-12 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Clear search"
          >
            <Cancel01Icon className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Section header + use my location */}
      <div className="mt-4 mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
          {hasQuery ? 'Results' : 'Popular cities'}
        </p>
        {!hasQuery && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={geoStatus === 'locating'}
            className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-60"
          >
            {geoStatus === 'locating' ? (
              <div className="w-3 h-3 border-2 border-stone-200 dark:border-stone-700 border-t-stone-600 dark:border-t-stone-200 rounded-full animate-spin" />
            ) : (
              <GpsSignal01Icon className="w-3.5 h-3.5" strokeWidth={1.7} />
            )}
            {geoStatus === 'locating'
              ? 'Locating…'
              : geoStatus === 'error'
              ? 'Try again'
              : 'Use my location'}
          </button>
        )}
      </div>

      {/* List */}
      <div>
        {hasQuery && isSearching && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-stone-200 dark:border-stone-800 border-t-stone-500 rounded-full animate-spin" />
          </div>
        )}
        {hasQuery && !isSearching && suggestions.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              No matches for &ldquo;{search.trim()}&rdquo;
            </p>
          </div>
        )}
        {hasQuery && !isSearching && suggestions.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pb-1">
            {suggestions.slice(0, 6).map((s) => renderLocationRow(s.label))}
          </div>
        )}
        {!hasQuery && (
          <div className="grid grid-cols-2 gap-2 pb-1">
            {POPULAR_CITIES.map((c) => renderLocationRow(formatLabel(c.city, c.state)))}
          </div>
        )}
      </div>
    </div>
  );

  const startedBody = (
    <div className="py-1">
      <ProgressDots />
      <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-1.5 text-center tracking-[-0.015em]">
        {startedHeading.title}
      </h2>
      <p className="text-sm text-stone-500 dark:text-stone-500 mb-6 text-center max-w-sm mx-auto">
        {startedHeading.sub}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {actionCards.map(({ icon: Icon, label, description, onClick, accent }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className="group relative overflow-hidden flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-left hover:border-stone-900/30 dark:hover:border-stone-100/30 transition-all duration-200"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="relative shrink-0 w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 group-hover:bg-white dark:group-hover:bg-stone-900 transition-colors">
              <Icon className="w-[18px] h-[18px]" />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                {label}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-snug mt-0.5">
                {description}
              </p>
            </div>
            <ArrowRight02Icon
              className="relative shrink-0 w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-all -translate-x-1 group-hover:translate-x-0"
              strokeWidth={2}
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleStartTour}
        className="mt-4 w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white transition-colors"
      >
        <Route01Icon className="w-4 h-4" strokeWidth={1.8} />
        <span className="text-sm font-semibold tracking-[-0.01em]">
          Take the 60-second tour
        </span>
      </button>

      <button
        type="button"
        onClick={closeAndComplete}
        className="mt-2 w-full text-xs font-medium text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors py-2"
      >
        I&apos;ll explore on my own
      </button>
    </div>
  );

  const widthClass = 'w-full md:w-[540px] lg:w-[540px] xl:w-[540px]';

  // ---------- Modal wrapping per screen ----------
  const screenContent = (() => {
    switch (screen) {
      case 'welcome':
        return welcomeBody;
      case 'interests':
        return interestsBody;
      case 'location':
        return locationBody;
      case 'started':
        return startedBody;
    }
  })();

  const animatedBody = (
    <div className="relative min-h-[260px]">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={screen}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.22, 0.9, 0.3, 1] }}
        >
          {screenContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  if (screen === 'welcome') {
    return (
      <Modal
        id="welcome-modal"
        isOpen={welcomeModal.isOpen}
        onClose={closeAndComplete}
        onSubmit={() => goTo('interests')}
        title="Welcome to ForMe"
        body={animatedBody}
        actionLabel="Begin"
        className={widthClass}
      />
    );
  }

  if (screen === 'interests') {
    return (
      <Modal
        id="welcome-modal"
        isOpen={welcomeModal.isOpen}
        onClose={closeAndComplete}
        onSubmit={() => {
          persistInterests();
          goTo('location');
        }}
        title="Welcome to ForMe"
        body={animatedBody}
        actionLabel={selectedInterests.length > 0 ? 'Continue' : 'Skip'}
        secondaryAction={selectedInterests.length > 0 ? () => goTo('location') : undefined}
        secondaryActionLabel={selectedInterests.length > 0 ? 'Skip' : undefined}
        className={widthClass}
      />
    );
  }

  if (screen === 'location') {
    return (
      <Modal
        id="welcome-modal"
        isOpen={welcomeModal.isOpen}
        onClose={closeAndComplete}
        onSubmit={() => {
          persistLocation();
          goTo('started');
        }}
        title="Welcome to ForMe"
        body={animatedBody}
        actionLabel={location ? 'Continue' : 'Skip'}
        secondaryAction={location ? () => goTo('started') : undefined}
        secondaryActionLabel={location ? 'Skip' : undefined}
        className={widthClass}
      />
    );
  }

  return (
    <Modal
      id="welcome-modal"
      isOpen={welcomeModal.isOpen}
      onClose={closeAndComplete}
      onSubmit={closeAndComplete}
      title="Welcome to ForMe"
      body={animatedBody}
      className={widthClass}
    />
  );
};

export default WelcomeModal;
