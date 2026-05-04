export const metadata = {
  title: 'New Listing',
  description: 'Create a new business listing',
  robots: { index: false, follow: false },
};

export default function ListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-stone-950 overflow-auto">
      {children}
    </div>
  );
}
