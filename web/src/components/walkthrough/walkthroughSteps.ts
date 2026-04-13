import { WalkthroughStep } from "@/app/hooks/useWalkthrough";

const walkthroughSteps: WalkthroughStep[] = [
  {
    target: "#wt-search",
    title: "Search ForMe",
    description:
      "Find services, shops, professionals, and posts all from one place.",
    placement: "bottom",
  },
  {
    target: "#wt-create",
    title: "Create Something",
    description:
      "Post content, list a business, open a shop, or add a product.",
    placement: "bottom",
  },
  {
    target: "#wt-notifications",
    title: "Notifications",
    description:
      "Stay updated on bookings, messages, and activity on your content.",
    placement: "bottom",
  },
  {
    target: "#wt-messages",
    title: "Messages",
    description:
      "Chat directly with service providers, clients, and other users.",
    placement: "bottom",
  },
  {
    target: "#wt-profile",
    title: "Your Profile",
    description:
      "Access your profile, account settings, and sign-out options.",
    placement: "left",
  },
  {
    target: "#wt-nav",
    title: "Navigate",
    description:
      "Jump between the discover feed, map view, brand shops, your bookings, and settings.",
    placement: "bottom",
  },
  {
    target: "#wt-banner",
    title: "Featured Content",
    description:
      "Rotating editorial banners highlighting local picks, new brands, and trending services.",
    placement: "bottom",
  },
  {
    target: "#wt-categories",
    title: "Browse Categories",
    description:
      "Filter the entire feed by category \u2014 Wellness, Barber, Salon, Nails, and more.",
    placement: "top",
  },
  {
    target: "#posts-rail",
    title: "Posts",
    description:
      "Community content \u2014 photos, updates, and inspiration from creators and businesses.",
    placement: "bottom",
    overlap: true,
    fullSpotlight: true,
  },
  {
    target: "#listings-rail",
    title: "Local Businesses",
    description:
      "Bookable service providers near you. Tap any card to view details and reserve.",
    placement: "bottom",
    overlap: true,
    fullSpotlight: true,
  },
  {
    target: "#employees-rail",
    title: "Professionals",
    description:
      "Individual workers and stylists \u2014 see their work, ratings, and book directly.",
    placement: "bottom",
    overlap: true,
    fullSpotlight: true,
  },
];

export default walkthroughSteps;
