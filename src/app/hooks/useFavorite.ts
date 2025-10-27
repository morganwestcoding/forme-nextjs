import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { SafeUser } from "@/app/types";

import useLoginModal from "./useLoginModal";

interface IUseFavorite {
  listingId: string;
  currentUser?: SafeUser | null
}

const useFavorite = ({ listingId, currentUser }: IUseFavorite) => {
  const router = useRouter();
  const loginModal = useLoginModal();

  // Local state for optimistic updates
  const [optimisticFavorited, setOptimisticFavorited] = useState<boolean | null>(null);

  const hasFavorited = useMemo(() => {
    // Use optimistic state if available, otherwise use actual data
    if (optimisticFavorited !== null) {
      return optimisticFavorited;
    }
    
    const list = currentUser?.favoriteIds || [];
    return list.includes(listingId);
  }, [currentUser, listingId, optimisticFavorited]);

  const toggleFavorite = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      return loginModal.onOpen();
    }

    // Calculate the new state
    const currentlyFavorited = optimisticFavorited !== null ? optimisticFavorited : (currentUser?.favoriteIds || []).includes(listingId);
    const newFavoriteState = !currentlyFavorited;

    try {
      // Optimistic update - immediately show the new state
      setOptimisticFavorited(newFavoriteState);

      let request;
      if (currentlyFavorited) {
        request = () => axios.delete(`/api/favorites/${listingId}`);
      } else {
        request = () => axios.post(`/api/favorites/${listingId}`);
      }

      await request();
      
      toast.success(newFavoriteState ? 'Added to favorites' : 'Removed from favorites');

    } catch (error) {
      // Revert optimistic update on error
      setOptimisticFavorited(currentlyFavorited);
      toast.error('Something went wrong.');
    }
  }, 
  [
    currentUser, 
    listingId, 
    loginModal,
    router,
    optimisticFavorited
  ]);

  return {
    hasFavorited,
    toggleFavorite,
  }
}

export default useFavorite;