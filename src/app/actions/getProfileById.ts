// Import necessary dependencies
import prisma from "@/app/libs/prismadb"; // Assuming prisma is set up for your database interactions
import { SafeUser } from "@/app/types"; // Assuming you have a SafeUser type for user-related data

// Define the interface for input parameters
interface IProfileParams {
    userId?: string;
  }

// The getProfileById function
const getProfileById = async (params: IProfileParams) => {
  try {
    // Destructure profileId from params
    const { userId } = params; 
    console.log("Fetching profile for userID:", userId);

    // Fetch the profile from the database
    const profile = await prisma.user.findUnique({
      where: {
        id: userId
    },
      include: {
        listings: true, // Include user's listings // Include user's reservations
        posts: true, // Include user's posts
        // Any other related entities you wish to include
      },
      // You can include relations here if needed, similar to how you included user and services in getListingById
    });

    // If no profile is found, return null
    if (!profile) {
      return null;
    }

    // Format and return the profile data
    return {
      ...profile,
      createdAt: profile.createdAt.toISOString(), // Convert dates to string
      updatedAt: profile.updatedAt.toISOString(),
      emailVerified: profile.emailVerified?.toISOString() || null,
      // Add other necessary fields here
    };
} catch (error: any) {
    console.error("Error in getProfileById:", error.message);
    throw new Error("Failed to fetch Profile.");
  }
};

export default getProfileById;
