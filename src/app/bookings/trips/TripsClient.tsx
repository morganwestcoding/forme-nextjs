'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import Container from "@/components/Container";
import ReserveCard from "@/components/listings/ReserveCard";
import MarketSearch from "@/app/market/MarketSearch";
import CategoryNav from "@/app/bookings/CategoryNav";
import SectionHeader from "@/app/market/SectionHeader";

interface TripsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const FADE_OUT_DURATION = 200;
const ITEMS_PER_PAGE = 8;

const TripsClient: React.FC<TripsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  // Sidebar collapse detection
  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    checkSidebarState();
    window.addEventListener('sidebarToggle', checkSidebarState);
    return () => window.removeEventListener('sidebarToggle', checkSidebarState);
  }, []);

  // Reset pagination on sidebar change
  useEffect(() => {
    setTripsIndex(0);
  }, [isSidebarCollapsed]);

  // Sticky nav border effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const navWrapper = document.getElementById('trips-category-nav-wrapper');
      if (navWrapper) {
        if (window.scrollY > 100) {
          navWrapper.style.borderBottomColor = 'rgb(229 231 235 / 0.5)';
        } else {
          navWrapper.style.borderBottomColor = 'transparent';
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Filter reservations based on selected categories
  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      if (selectedCategories.length === 0) return true;

      return selectedCategories.some(category => {
        if (category === 'outgoing') return true;
        if (category === 'incoming') return false;
        return reservation.status === category;
      });
    });
  }, [reservations, selectedCategories]);

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

  // Generate section header based on active filters
  const getSectionHeader = () => {
    if (selectedCategories.length === 0) {
      return "All Outgoing Trips";
    }

    const statusFilters = selectedCategories.filter(cat => !['incoming', 'outgoing'].includes(cat));
    const hasOutgoing = selectedCategories.includes('outgoing');

    if (statusFilters.length > 0) {
      const statusText = statusFilters.map(status =>
        status.charAt(0).toUpperCase() + status.slice(1)
      ).join(' & ');
      return hasOutgoing ? `${statusText} Outgoing Trips` : `${statusText} Trips`;
    }

    return hasOutgoing ? "Outgoing Trips" : "Filtered Trips";
  };

  return (
    <Container>
      {/* Hero Section - Clean minimal design (matching Market) */}
      <div className="-mx-6 md:-mx-24 -mt-2 md:-mt-8">
        <div className="relative px-6 md:px-24 pt-12 pb-8 bg-white">

          {/* Content */}
          <div className="relative z-10 pb-6">
            {/* Main Trips Title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                Trips
              </h1>
              <p className="text-gray-500 text-base mt-3 max-w-2xl mx-auto">Bookings you&apos;ve made with other businesses</p>
            </div>

            {/* Search and Controls */}
            <div className="mt-8 max-w-3xl mx-auto">
              <MarketSearch
                isHeroMode={false}
                basePath="/bookings/trips"
              />
            </div>

            {/* Category Navigation - Sticky */}
            <div className="mt-5 -mx-6 md:-mx-24">
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-transparent transition-all duration-300" id="trips-category-nav-wrapper">
                <div className="px-6 md:px-24">
                  <CategoryNav />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-[69px]">
        <div>
          {hasTrips ? (
            <>
              {/* View All Mode */}
              {viewAllMode && (
                <>
                  <SectionHeader
                    title={getSectionHeader()}
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="← Back to Trips"
                  />
                  <div className={`grid ${gridColsClass} gap-5 transition-all duration-300`}>
                    {filteredReservations.map((reservation, idx) => (
                      <div
                        key={reservation.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out forwards`,
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

              {/* Normal View - Show sections with pagination */}
              {!viewAllMode && (
                <>
                  <SectionHeader
                    title={getSectionHeader()}
                    onPrev={() => scrollTrips('left')}
                    onNext={() => scrollTrips('right')}
                    onViewAll={handleViewAll}
                  />
                  <div id="trips-rail">
                    <div className={`grid ${gridColsClass} gap-5 pb-8 transition-all duration-300`}>
                      {currentTrips.map((reservation, idx) => (
                        <div
                          key={`${reservation.id}-${tripsIndex}`}
                          style={{
                            opacity: tripsVisible ? 0 : 0,
                            animation: tripsVisible ? `fadeInUp 520ms ease-out forwards` : 'none',
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
            <div className="px-8 pt-32 text-center text-gray-500">
              No trips found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

export default TripsClient;
