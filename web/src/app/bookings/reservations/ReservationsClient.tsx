'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import Container from "@/components/Container";
import ReserveCard from "@/components/listings/ReserveCard";
import PageSearch from "@/components/search/PageSearch";
import CategoryNav from "@/app/bookings/CategoryNav";
import SectionHeader from "@/app/market/SectionHeader";
import PageHeader from "@/components/PageHeader";
import { useSidebarState } from "@/app/hooks/useSidebarState";

interface ReservationsClientProps {
  incomingReservations: SafeReservation[];
  outgoingReservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const FADE_OUT_DURATION = 200;

// ── Mock reservations for representation ──
const mockListing = (id: string, title: string, img: string, cat: string, loc: string, addr: string, empName: string) => ({
  id, title, description: '', imageSrc: img, category: cat, location: loc, userId: 'mock-owner',
  createdAt: new Date().toISOString(), services: [{ id: 's1', serviceName: title, price: 0, category: cat }],
  phoneNumber: null, website: null, address: addr, zipCode: '10001', galleryImages: [], employees: [{ id: `emp-${id}`, fullName: empName }], storeHours: [],
});
const mockUser = (id: string, name: string): SafeUser => ({
  id, name, email: null, image: null, imageSrc: null, bio: '', isSubscribed: false,
  subscriptionStartDate: null, subscriptionEndDate: null, following: [], followers: [],
  managedListings: [], resetTokenExpiry: null, createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(), emailVerified: null,
} as any);

const MOCK_RESERVATIONS: SafeReservation[] = [
  { id: 'mock-res-1', createdAt: new Date().toISOString(), date: new Date(Date.now() + 2 * 86400000), time: '10:00', serviceName: 'Classic Fade', totalPrice: 45, status: 'pending', employeeId: 'emp-l1', userId: 'mc1', listingId: 'l1', user: mockUser('mc1', 'Jordan Ellis'), listing: mockListing('l1', 'Studio Noir Barbershop', '/assets/people/barber.png', 'Barber', 'Brooklyn, NY', '142 Bedford Ave', 'Marcus J.') } as any,
  { id: 'mock-res-2', createdAt: new Date().toISOString(), date: new Date(Date.now() + 4 * 86400000), time: '14:30', serviceName: 'Hydra Glow Facial', totalPrice: 120, status: 'accepted', employeeId: 'emp-l2', userId: 'mc2', listingId: 'l2', user: mockUser('mc2', 'Ava Chen'), listing: mockListing('l2', 'Glow Aesthetics', '/assets/people/skincare.png', 'Skincare', 'Manhattan, NY', '88 Spring St', 'Priya M.') } as any,
  { id: 'mock-res-3', createdAt: new Date().toISOString(), date: new Date(Date.now() + 1 * 86400000), time: '11:00', serviceName: 'Volume Lash Set', totalPrice: 150, status: 'pending', employeeId: 'emp-l3', userId: 'mc3', listingId: 'l3', user: mockUser('mc3', 'Sofia R.'), listing: mockListing('l3', 'Lash Lounge', '/assets/people/lashes.png', 'Lash', 'Queens, NY', '25-11 Broadway', 'Luna K.') } as any,
  { id: 'mock-res-4', createdAt: new Date().toISOString(), date: new Date(Date.now() + 5 * 86400000), time: '16:00', serviceName: 'Gel Art Manicure', totalPrice: 65, status: 'accepted', employeeId: 'emp-l4', userId: 'mc4', listingId: 'l4', user: mockUser('mc4', 'Derek W.'), listing: mockListing('l4', 'The Nail Bar', '/assets/people/nails.png', 'Nails', 'Manhattan, NY', '401 W 14th St', 'Nina T.') } as any,
  { id: 'mock-res-5', createdAt: new Date().toISOString(), date: new Date(Date.now() - 2 * 86400000), time: '09:00', serviceName: 'Power Hour Training', totalPrice: 75, status: 'declined', employeeId: 'emp-l5', userId: 'mc5', listingId: 'l5', user: mockUser('mc5', 'Marcus J.'), listing: mockListing('l5', 'Iron Temple', '/assets/people/fitness.png', 'Training', 'Bronx, NY', '900 Grand Concourse', 'Derek W.') } as any,
  { id: 'mock-res-6', createdAt: new Date().toISOString(), date: new Date(Date.now() + 7 * 86400000), time: '13:00', serviceName: 'Brow Lamination & Tint', totalPrice: 85, status: 'pending', employeeId: 'emp-l6', userId: 'mc6', listingId: 'l6', user: mockUser('mc6', 'Jasmine L.'), listing: mockListing('l6', 'Brow Studio', '/assets/people/brows.png', 'Brows', 'Brooklyn, NY', '58 N 3rd St', 'Jasmine L.') } as any,
];

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  incomingReservations,
  outgoingReservations,
  currentUser,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processingId, setProcessingId] = useState('');
  const isSidebarCollapsed = useSidebarState();

  // Dynamic items per page: 12 when sidebar collapsed, 10 when expanded
  const ITEMS_PER_PAGE = isSidebarCollapsed ? 12 : 10;

  // Pagination state
  const [reservationsIndex, setReservationsIndex] = useState(0);
  const [reservationsVisible, setReservationsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // View all mode
  const [viewAllMode, setViewAllMode] = useState(false);

  // Responsive grid - matches MarketClient for consistent card sizing
  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';

  // Reset pagination on sidebar change
  useEffect(() => {
    setReservationsIndex(0);
  }, [isSidebarCollapsed]);

  // Get selected categories from URL
  const selectedCategories = searchParams?.get('categories')?.split(',').filter(Boolean) || [];

  const onAccept = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.patch(`/api/reservations/${id}`, { action: 'accept' });
      toast.success('Reservation accepted');
      router.refresh();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setProcessingId('');
    }
  }, [router]);

  const onDecline = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation declined');
      router.refresh();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setProcessingId('');
    }
  }, [router]);

  const onCancel = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation cancelled');
      router.refresh();
    } finally {
      setProcessingId('');
    }
  }, [router]);

  // Determine which reservations to show based on direction filter
  const isOutgoingSelected = selectedCategories.includes('outgoing');
  const realBase = isOutgoingSelected ? outgoingReservations : incomingReservations;
  // Merge mock data so the page always has content
  const baseReservations = useMemo(() => {
    const realIds = new Set(realBase.map(r => r.id));
    const mocks = MOCK_RESERVATIONS.filter(r => !realIds.has(r.id));
    return [...realBase, ...mocks];
  }, [realBase]);

  // Filter reservations based on selected status categories
  const filteredReservations = useMemo(() => {
    const statusFilters = selectedCategories.filter(cat => !['incoming', 'outgoing'].includes(cat));

    if (statusFilters.length === 0) return baseReservations;

    return baseReservations.filter(reservation =>
      statusFilters.includes(reservation.status)
    );
  }, [baseReservations, selectedCategories]);

  const hasReservations = filteredReservations.length > 0;

  // Animated transition helper
  const animateTransition = (
    setVisible: (visible: boolean) => void,
    setIndex: (index: number) => void,
    currentIndex: number,
    totalPages: number,
    direction: 'left' | 'right'
  ) => {
    if (totalPages <= 1 || isAnimating) return;

    setIsAnimating(true);
    setVisible(false);

    setTimeout(() => {
      const newIndex = direction === 'right'
        ? (currentIndex + 1) % totalPages
        : currentIndex === 0 ? totalPages - 1 : currentIndex - 1;

      setIndex(newIndex);
      setTimeout(() => {
        setVisible(true);
        setIsAnimating(false);
      }, 50);
    }, FADE_OUT_DURATION);
  };

  // Paginated items
  const currentReservations = useMemo(() => {
    if (filteredReservations.length <= ITEMS_PER_PAGE) return filteredReservations;
    const start = reservationsIndex * ITEMS_PER_PAGE;
    return filteredReservations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReservations, reservationsIndex]);

  // Total pages
  const totalReservationsPages = Math.max(1, Math.ceil(filteredReservations.length / ITEMS_PER_PAGE));

  // Scroll handler
  const scrollReservations = (dir: 'left' | 'right') =>
    animateTransition(setReservationsVisible, setReservationsIndex, reservationsIndex, totalReservationsPages, dir);

  // View all handlers
  const handleViewAll = () => {
    setViewAllMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setViewAllMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Upcoming / Past toggle
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past'>('upcoming');

  const now = new Date();
  const upcomingReservations = useMemo(
    () => filteredReservations.filter(r => new Date(r.date) >= now),
    [filteredReservations]
  );
  const pastReservations = useMemo(
    () => filteredReservations.filter(r => new Date(r.date) < now),
    [filteredReservations]
  );

  const activeReservations = timeFilter === 'upcoming' ? upcomingReservations : pastReservations;

  // Paginated items (recalculate for active set)
  const paginatedReservations = useMemo(() => {
    if (activeReservations.length <= ITEMS_PER_PAGE) return activeReservations;
    const start = reservationsIndex * ITEMS_PER_PAGE;
    return activeReservations.slice(start, start + ITEMS_PER_PAGE);
  }, [activeReservations, reservationsIndex]);

  const totalPages = Math.max(1, Math.ceil(activeReservations.length / ITEMS_PER_PAGE));

  return (
    <Container>
      <PageHeader currentUser={currentUser} />

      {/* Upcoming / Past Toggle */}
      <div className="flex items-center gap-1 mt-8 mb-6">
        <button
          onClick={() => { setTimeFilter('upcoming'); setReservationsIndex(0); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            timeFilter === 'upcoming'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
          }`}
          type="button"
        >
          Upcoming
          {upcomingReservations.length > 0 && (
            <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-md ${
              timeFilter === 'upcoming' ? 'bg-white/20' : 'bg-neutral-200'
            }`}>
              {upcomingReservations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setTimeFilter('past'); setReservationsIndex(0); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            timeFilter === 'past'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
          }`}
          type="button"
        >
          Past
          {pastReservations.length > 0 && (
            <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-md ${
              timeFilter === 'past' ? 'bg-white/20' : 'bg-neutral-200'
            }`}>
              {pastReservations.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        <div>
          {activeReservations.length > 0 ? (
            <>
              {/* View All Mode */}
              {viewAllMode && (
                <>
                  <SectionHeader
                    title={timeFilter === 'upcoming' ? 'Upcoming Reservations' : 'Past Reservations'}
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="← Back"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {activeReservations.map((reservation, idx) => (
                      <div
                        key={reservation.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out both`,
                          animationDelay: `${Math.min(idx * 30, 300)}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ReserveCard
                          reservation={reservation}
                          listing={reservation.listing}
                          currentUser={currentUser}
                          disabled={processingId === reservation.id}
                          onAccept={() => onAccept(reservation.id)}
                          onDecline={() => onDecline(reservation.id)}
                          onCancel={() => onCancel(reservation.id)}
                          showAcceptDecline={!isOutgoingSelected}
                          onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Normal View */}
              {!viewAllMode && (
                <>
                  <SectionHeader
                    title={timeFilter === 'upcoming' ? 'Upcoming Reservations' : 'Past Reservations'}
                    onPrev={totalPages > 1 ? () => scrollReservations('left') : undefined}
                    onNext={totalPages > 1 ? () => scrollReservations('right') : undefined}
                    onViewAll={activeReservations.length > ITEMS_PER_PAGE ? handleViewAll : undefined}
                  />
                  <div id="reservations-rail">
                    <div className={`grid ${gridColsClass} gap-5 pb-8 transition-all duration-300`}>
                      {paginatedReservations.map((reservation, idx) => (
                        <div
                          key={`${reservation.id}-${reservationsIndex}`}
                          style={{
                            opacity: reservationsVisible ? 0 : 0,
                            animation: reservationsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                            animationDelay: reservationsVisible ? `${140 + idx * 30}ms` : '0ms',
                            willChange: 'transform, opacity',
                            transition: !reservationsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                          }}
                          className={!reservationsVisible ? 'opacity-0' : ''}
                        >
                          <ReserveCard
                            reservation={reservation}
                            listing={reservation.listing}
                            currentUser={currentUser}
                            disabled={processingId === reservation.id}
                            onAccept={() => onAccept(reservation.id)}
                            onDecline={() => onDecline(reservation.id)}
                            onCancel={() => onCancel(reservation.id)}
                            showAcceptDecline={!isOutgoingSelected}
                            onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="px-8 pt-16 text-center text-gray-500">
              {timeFilter === 'upcoming' ? 'No upcoming reservations.' : 'No past reservations.'}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

export default ReservationsClient;
