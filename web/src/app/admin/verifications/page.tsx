import { redirect } from "next/navigation";
import Link from "next/link";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import Container from "@/components/Container";
import VerificationQueue from "./VerificationQueue";

export const metadata = {
  title: 'Verifications — Admin',
  description: 'Review pending verification requests',
  robots: { index: false, follow: false },
};

export default async function AdminVerificationsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "master" && currentUser.role !== "admin")) redirect("/");

  const pendingUsers = await prisma.user.findMany({
    where: { verificationStatus: "pending" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      licensingImage: true,
      createdAt: true,
      userType: true,
      location: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const safe = pendingUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <Container>
      <div className="mt-8 mb-12">
        <div className="mb-2">
          <Link href="/admin" className="text-[12px] text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            ← Back to Admin
          </Link>
        </div>
        <div className="mb-8">
          <p className="text-[12px] text-stone-400 dark:text-stone-500 mb-1">Master admin</p>
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Verification Queue</h1>
          <p className="text-[14px] text-stone-400 dark:text-stone-500 mt-1">{safe.length} pending submissions</p>
        </div>

        {safe.length === 0 ? (
          <div className="text-[13px] text-stone-400 dark:text-stone-500 py-12 text-center">
            No pending verifications.
          </div>
        ) : (
          <VerificationQueue users={safe} />
        )}
      </div>
    </Container>
  );
}
