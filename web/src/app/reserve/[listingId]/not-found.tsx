import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function ReservationNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[48px] font-semibold text-stone-900 dark:text-stone-100 tracking-tight leading-none mb-2">404</p>
      <h2 className="text-[16px] font-semibold text-stone-900 dark:text-stone-100 mb-1">Listing not found</h2>
      <p className="text-[13px] text-stone-500 dark:text-stone-500 max-w-sm mb-6">
        This listing doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
