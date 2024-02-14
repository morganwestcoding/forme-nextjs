import {create} from 'zustand';
import { SafeUser } from '@/app/types'; // Adjust import path as necessary

type UserState = {
  user: SafeUser | null;
  setUser: (user: SafeUser) => void;
  updateUserImage: (imageUrl: string) => void;
};

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user: SafeUser) => set({ user }),
  updateUserImage: (imageUrl: string) => set((state) => {
    if (state.user) {
      // Ensure we're updating the user object in a type-safe manner
      // Assuming all necessary properties of SafeUser are handled correctly here
      const updatedUser: SafeUser = {
        ...state.user,
        image: imageUrl, // Update the image URL
        // Ensure no properties are left 'undefined' if they're not supposed to be according to SafeUser type
      };
      return { user: updatedUser };
    }
    return state; // Return the current state unchanged if there's no user
  }),
}));

export default useUserStore;
