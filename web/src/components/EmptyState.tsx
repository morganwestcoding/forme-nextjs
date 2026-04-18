'use client';

import { useRouter } from "next/navigation";

import Button from "./ui/Button";
import Heading from "./Heading";
import { Search01Icon, FavouriteIcon, MessageMultiple01Icon, Calendar03Icon, GridViewIcon } from 'hugeicons-react';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
  icon?: 'search' | 'favorites' | 'messages' | 'bookings' | 'listings';
}

const ICONS = {
  search: Search01Icon,
  favorites: FavouriteIcon,
  messages: MessageMultiple01Icon,
  bookings: Calendar03Icon,
  listings: GridViewIcon,
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filters.",
  showReset,
  icon = 'search',
}) => {
  const router = useRouter();
  const Icon = ICONS[icon];

  return (
    <div className="h-[60vh] flex flex-col gap-2 justify-center items-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-2">
        <Icon size={24} className="text-stone-400 dark:text-stone-500" />
      </div>
      <Heading
        center
        title={title}
        subtitle={subtitle}
      />
      <div className="w-48 mt-4">
        {showReset && (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => router.push('/')}
          >
            Remove all filters
          </Button>
        )}
      </div>
    </div>
   );
}

export default EmptyState;
