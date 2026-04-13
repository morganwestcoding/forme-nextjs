import { create } from "zustand";

export interface WalkthroughStep {
  target: string;       // CSS selector (e.g. "#wt-search")
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right";
  overlap?: boolean;    // Allow tooltip to overlap the spotlight
  fullSpotlight?: boolean; // Don't cap spotlight height
}

interface WalkthroughStore {
  isActive: boolean;
  currentStep: number;
  steps: WalkthroughStep[];
  start: (steps: WalkthroughStep[]) => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  complete: () => void;
}

const useWalkthrough = create<WalkthroughStore>((set, get) => ({
  isActive: false,
  currentStep: 0,
  steps: [],

  start: (steps) => set({ isActive: true, currentStep: 0, steps }),

  next: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      get().complete();
    }
  },

  prev: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  skip: () => {
    set({ isActive: false, currentStep: 0, steps: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  complete: () => {
    set({ isActive: false, currentStep: 0, steps: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));

export default useWalkthrough;
