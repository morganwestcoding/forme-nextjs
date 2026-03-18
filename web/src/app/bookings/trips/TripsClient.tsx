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

interface TripsClientProps {
  reservations: SafeReservation[];
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

const MOCK_TRIPS: SafeReservation[] = [
  { id: 'mock-trip-1', createdAt: new Date().toISOString(), date: new Date(Date.now() + 3 * 86400000), time: '10:30', serviceName: 'Deep Tissue Massage', totalPrice: 95, status: 'accepted', employeeId: 'emp-t1', userId: 'mc1', listingId: 't1', user: mockUser('mc1', 'You'), listing: mockListing('t1', 'Zen Wellness Spa', '/assets/people/wellness.png', 'Wellness', 'Brooklyn, NY', '58 N 3rd St', 'Luna K.') } as any,
  { id: 'mock-trip-2', createdAt: new Date().toISOString(), date: new Date(Date.now() + 1 * 86400000), time: '15:00', serviceName: 'Signature Fade + Beard', totalPrice: 60, status: 'pending', employeeId: 'emp-t2', userId: 'mc1', listingId: 't2', user: mockUser('mc1', 'You'), listing: mockListing('t2', 'Studio Noir Barbershop', '/assets/people/barber.png', 'Barber', 'Brooklyn, NY', '142 Bedford Ave', 'Marcus J.') } as any,
  { id: 'mock-trip-3', createdAt: new Date().toISOString(), date: new Date(Date.now() + 6 * 86400000), time: '12:00', serviceName: 'Classic Full Set', totalPrice: 85, status: 'accepted', employeeId: 'emp-t3', userId: 'mc1', listingId: 't3', user: mockUser('mc1', 'You'), listing: mockListing('t3', 'Lash Lounge', '/assets/people/lashes.png', 'Lash', 'Queens, NY', '25-11 Broadway', 'Priya M.') } as any,
  { id: 'mock-trip-4', createdAt: new Date().toISOString(), date: new Date(Date.now() - 1 * 86400000), time: '09:00', serviceName: 'Custom Ink Session', totalPrice: 200, status: 'accepted', employeeId: 'emp-t4', userId: 'mc1', listingId: 't4', user: mockUser('mc1', 'You'), listing: mockListing('t4', 'Ink Masters', '/assets/people/ink.png', 'Ink', 'Manhattan, NY', '21 E 1st St', 'Rio V.') } as any,
  { id: 'mock-trip-5', createdAt: new Date().toISOString(), date: new Date(Date.now() + 10 * 86400000), time: '14:00', serviceName: 'Luxury Spa Manicure', totalPrice: 75, status: 'pending', employeeId: 'emp-t5', userId: 'mc1', listingId: 't5', user: mockUser('mc1', 'You'), listing: mockListing('t5', 'The Nail Bar', '/assets/people/nails.png', 'Nails', 'Manhattan, NY', '401 W 14th St', 'Sofia R.') } as any,
  { id: 'mock-trip-6', createdAt: new Date().toISOString(), date: new Date(Date.now() - 5 * 86400000), time: '17:00', serviceName: 'Blowout & Style', totalPrice: 55, status: 'declined', employeeId: 'emp-t6', userId: 'mc1', listingId: 't6', user: mockUser('mc1', 'You'), listing: mockListing('t6', 'Salon Luxe', '/assets/people/salon.png', 'Salon', 'Manhattan, NY', '155 Mercer St', 'Ava Chen') } as any,
];

const TripsClient: React.FC<TripsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState('');
  const isSidebarCollapsed = useSidebarState();

  // Dynamic items per page: 12 when sidebar collapsed, 10 when expanded
  const ITEMS_PER_PAGE = isSidebarCollapsed ? 12 : 10;

  // Pagination state
  const [tripsIndex, setTripsIndex] = useState(0);
  const [tripsVisible, setTripsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // View all mode
  const [viewAllMode, setViewAllMode] = useState(false);

  // Responsive grid - adds 1 column when sidebar is collapsed
  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  // Reset pagination on sidebar change
  useEffect(() => {
    setTripsIndex(0);
  }, [isSidebarCollapsed]);

  // Get selected categories from URL
  const selectedCategories = searchParams?.get('categories')?.split(',').filter(Boolean) || [];

  const onCancel = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation cancelled');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Something went wrong.');
    } finally {
      setDeletingId('');
    }
  }, [router]);

  // Merge mock data so the page always has content
  const allReservations = useMemo(() => {
    const realIds = new Set(reservations.map(r => r.id));
    const mocks = MOCK_TRIPS.filter(r => !realIds.has(r.id));
    return [...reservations, ...mocks];
  }, [reservations]);

  // Filter reservations based on selected categories
  const filteredReservations = useMemo(() => {
    return allReservations.filter(reservation => {
      if (selectedCategories.length === 0) return true;

      return selectedCategories.some(category => {
        if (category === 'outgoing') return true;
        if (category === 'incoming') return false;
        return reservation.status === category;
      });
    });
  }, [allReservations, selectedCategories]);

  const hasTrips = filteredReservations.length > 0;

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
  const currentTrips = useMemo(() => {
    if (filteredReservations.length <= ITEMS_PER_PAGE) return filteredReservations;
    const start = tripsIndex * ITEMS_PER_PAGE;
    return filteredReservations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReservations, tripsIndex]);

  // Total pages
  const totalTripsPages = Math.max(1, Math.ceil(filteredReservations.length / ITEMS_PER_PAGE));

  // Scroll handler
  const scrollTrips = (dir: 'left' | 'right') =>
    animateTransition(setTripsVisible, setTripsIndex, tripsIndex, totalTripsPages, dir);

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
  const upcomingTrips = useMemo(
    () => filteredReservations.filter(r => new Date(r.date) >= now),
    [filteredReservations]
  );
  const pastTrips = useMemo(
    () => filteredReservations.filter(r => new Date(r.date) < now),
    [filteredReservations]
  );

  const activeTrips = timeFilter === 'upcoming' ? upcomingTrips : pastTrips;

  // Paginated items (recalculate for active set)
  const paginatedTrips = useMemo(() => {
    if (activeTrips.length <= ITEMS_PER_PAGE) return activeTrips;
    const start = tripsIndex * ITEMS_PER_PAGE;
    return activeTrips.slice(start, start + ITEMS_PER_PAGE);
  }, [activeTrips, tripsIndex]);

  const totalPages = Math.max(1, Math.ceil(activeTrips.length / ITEMS_PER_PAGE));

  return (
    <Container>
      <PageHeader currentUser={currentUser} />

      {/* Upcoming / Past Toggle */}
      <div className="flex items-center gap-1 mt-8 mb-6">
        <button
          onClick={() => { setTimeFilter('upcoming'); setTripsIndex(0); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            timeFilter === 'upcoming'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
          }`}
          type="button"
        >
          Upcoming
          {upcomingTrips.length > 0 && (
            <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-md ${
              timeFilter === 'upcoming' ? 'bg-white/20' : 'bg-neutral-200'
            }`}>
              {upcomingTrips.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setTimeFilter('past'); setTripsIndex(0); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            timeFilter === 'past'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
          }`}
          type="button"
        >
          Past
          {pastTrips.length > 0 && (
            <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-md ${
              timeFilter === 'past' ? 'bg-white/20' : 'bg-neutral-200'
            }`}>
              {pastTrips.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="relative">
        <div>
          {activeTrips.length > 0 ? (
            <>
              {/* View All Mode */}
              {viewAllMode && (
                <>
                  <SectionHeader
                    title={timeFilter === 'upcoming' ? 'Upcoming Trips' : 'Past Trips'}
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="← Back"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {activeTrips.map((reservation, idx) => (
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
                          disabled={deletingId === reservation.id}
                          onCancel={() => onCancel(reservation.id)}
                          showCancel={true}
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
                    title={timeFilter === 'upcoming' ? 'Upcoming Trips' : 'Past Trips'}
                    onPrev={totalPages > 1 ? () => scrollTrips('left') : undefined}
                    onNext={totalPages > 1 ? () => scrollTrips('right') : undefined}
                    onViewAll={activeTrips.length > ITEMS_PER_PAGE ? handleViewAll : undefined}
                  />
                  <div id="trips-rail">
                    <div className={`grid ${gridColsClass} gap-5 pb-8 transition-all duration-300`}>
                      {paginatedTrips.map((reservation, idx) => (
                        <div
                          key={`${reservation.id}-${tripsIndex}`}
                          style={{
                            opacity: tripsVisible ? 0 : 0,
                            animation: tripsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                            animationDelay: tripsVisible ? `${140 + idx * 30}ms` : '0ms',
                            willChange: 'transform, opacity',
                            transition: !tripsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                          }}
                          className={!tripsVisible ? 'opacity-0' : ''}
                        >
                          <ReserveCard
                            reservation={reservation}
                            listing={reservation.listing}
                            currentUser={currentUser}
                            disabled={deletingId === reservation.id}
                            onCancel={() => onCancel(reservation.id)}
                            showCancel={true}
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
              {timeFilter === 'upcoming' ? 'No upcoming trips.' : 'No past trips.'}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

export default TripsClient;
