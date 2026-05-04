export const metadata = {
  title: 'Booking Confirmed',
  description: 'Your reservation is confirmed',
  robots: { index: false, follow: false },
};

// The post-checkout success page is the tail end of the reservation flow,
// not a regular browsing page — strip the global header/search/breadcrumb
// chrome with a fixed-inset overlay so the user lands on a clean confirmation
// screen. Mirrors web/src/app/reserve/[listingId]/layout.tsx.
export default function BookingSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-stone-50 dark:bg-stone-950 overflow-auto">
      {children}
    </div>
  );
}
