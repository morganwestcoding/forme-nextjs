import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
      return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { image, imageSrc, bio, location } = body;

  try {
      await prisma.user.update({
          where: { id: currentUser.id },
          data: { image, imageSrc, bio, location },
      });

      // Fetch the updated user data
      const updatedUser = await prisma.user.findUnique({
          where: { id: currentUser.id },
      });

      if (!updatedUser) {
          return new Response("User update failed", { status: 404 });
      }

      return new Response(JSON.stringify(updatedUser), {
          status: 200,
          headers: { "Content-Type": "application/json" },
      });
  } catch (error) {
      console.error("Error updating user:", error);
      return new Response("Internal Server Error", { status: 500 });
  }
}
