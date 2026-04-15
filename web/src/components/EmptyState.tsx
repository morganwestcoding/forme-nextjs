'use client';

import { useRouter } from "next/navigation";

import Button from "./ui/Button";
import Heading from "./Heading";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  showReset?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No exact matches",
  subtitle = "Try changing or removing some of your filters.",
  showReset
}) => {
  const router = useRouter();

  return ( 
    <div 
      className="
        h-[60vh]
        flex 
        flex-col 
        gap-2 
        justify-center 
        items-center 
      "
    >
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