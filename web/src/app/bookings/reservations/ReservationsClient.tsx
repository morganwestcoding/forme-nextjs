'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import Container from "@/components/Container";
import ReserveCard from "@/components/listings/ReserveCard";
import PageHeader from "@/components/PageHeader";
import { useSidebarState } from "@/app/hooks/useSidebarState";

interface ReservationsClientProps {
  incomingReservations: SafeReservation[];
  outgoingReservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

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

type BookingTab = 'incoming' | 'outgoing';
type TimeTab = 'upcoming' | 'past';

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  incomingReservations,
  outgoingReservations,
  currentUser,
}) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState('');
  const isSidebarCollapsed = useSidebarState();
  const [directionTab, setDirectionTab] = useState<BookingTab>('incoming');
  const [timeTab, setTimeTab] = useState<TimeTab>('upcoming');

  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3';

  const onAccept = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.patch(`/api/reservations/${id}`, { action: 'accept' });
      toast.success('Reservation accepted');
      router.refresh();
    } catch { toast.error('Something went wrong.'); }
    finally { setProcessingId(''); }
  }, [router]);

  const onDecline = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation declined');
      router.refresh();
    } catch { toast.error('Something went wrong.'); }
    finally { setProcessingId(''); }
  }, [router]);

  const onCancel = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation cancelled');
      router.refresh();
    } finally { setProcessingId(''); }
  }, [router]);

  // Base reservations with mocks
  const baseReservations = useMemo(() => {
    const real = directionTab === 'outgoing' ? outgoingReservations : incomingReservations;
    const realIds = new Set(real.map(r => r.id));
    const mocks = MOCK_RESERVATIONS.filter(r => !realIds.has(r.id));
    return [...real, ...mocks];
  }, [directionTab, incomingReservations, outgoingReservations]);

  // Time filter
  const now = new Date();
  const filteredReservations = useMemo(() => {
    return baseReservations.filter(r =>
      timeTab === 'upcoming' ? new Date(r.date) >= now : new Date(r.date) < now
    );
  }, [baseReservations, timeTab]);

  const totalCount = filteredReservations.length;

  return (
    <Container>
      <PageHeader currentUser={currentUser} />

      <div className="mt-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Bookings</h1>
          <p className="text-[14px] text-stone-400 mt-1">{totalCount} {totalCount === 1 ? 'reservation' : 'reservations'}</p>
        </div>

        {/* Tab bars */}
        <div className="flex items-center gap-6 mb-8">
          {/* Direction tabs */}
          <div className="flex items-center gap-2">
            {(['incoming', 'outgoing'] as BookingTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setDirectionTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                  directionTab === tab
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                {tab === 'incoming' ? 'Incoming' : 'Outgoing'}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-stone-200" />

          {/* Time tabs */}
          <div className="flex items-center gap-2">
            {(['upcoming', 'past'] as TimeTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                  timeTab === tab
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                {tab === 'upcoming' ? 'Upcoming' : 'Past'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filteredReservations.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-5`}>
            {filteredReservations.map((reservation, idx) => (
              <div
                key={reservation.id}
                style={{
                  opacity: 0,
                  animation: 'fadeInUp 520ms ease-out both',
                  animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
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
                  showAcceptDecline={directionTab === 'incoming'}
                  onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-stone-700 mb-1">
              No {timeTab} {directionTab} reservations
            </p>
            <p className="text-[13px] text-stone-400 max-w-xs">
              {timeTab === 'upcoming'
                ? 'When you receive new bookings, they\'ll appear here.'
                : 'Your completed reservations will show up here.'}
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default ReservationsClient;
