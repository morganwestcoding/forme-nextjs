import { redirect } from "next/navigation";
import Link from "next/link";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import Container from "@/components/Container";
import AdminUserList from "./AdminUserList";


export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; tier?: string; page?: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== "master" && currentUser.role !== "admin")) redirect("/");

  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 50;

  const where: any = {};
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: "insensitive" } },
      { email: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.role) where.role = searchParams.role;
  if (searchParams.tier) where.subscriptionTier = searchParams.tier;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        subscriptionTier: true,
        isSubscribed: true,
        verificationStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  const safeUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <Container>
      <div className="mt-8 mb-12">
        <div className="mb-2">
          <Link href="/admin" className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors">
            ← Back to Admin
          </Link>
        </div>
        <div className="mb-8">
          <p className="text-[12px] text-stone-400 mb-1">Master admin</p>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Users</h1>
          <p className="text-[14px] text-stone-400 mt-1">{total} total users</p>
        </div>

        <AdminUserList
          users={safeUsers}
          total={total}
          page={page}
          pageSize={pageSize}
          query={searchParams.q || ""}
        />
      </div>
    </Container>
  );
}
