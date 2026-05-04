import prisma from "@/app/libs/prismadb";

export interface TeamMember {
  id: string;
  fullName: string;
  jobTitle: string | null;
  userId: string;
  listingId: string;
  serviceIds: string[];
  isActive: boolean;
  isIndependent: boolean;
  teamRole: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    imageSrc: string | null;
    email: string | null;
  };
  availability: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    isOff: boolean;
  }[];
  timeOffRequests: {
    id: string;
    startDate: string;
    endDate: string;
    reason: string | null;
    status: string;
  }[];
  upcomingBookings: number;
  monthlyRevenue: number;
  payAgreement: {
    type: string;
    splitPercent: number | null;
    rentalAmount: number | null;
    rentalFrequency: string | null;
    autoApprovePayout: boolean;
  } | null;
  stripeConnectSetup: boolean;
}

export interface TeamBooking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  totalPrice: number;
  status: string;
  note: string | null;
  clientName: string | null;
  clientImage: string | null;
  clientEmail: string | null;
  employeeName: string;
  employeeId: string;
}

export interface TeamData {
  members: TeamMember[];
  listings: { id: string; title: string; category: string; imageSrc: string | null }[];
  ownedListingIds: string[];
  todayBookings: TeamBooking[];
  upcomingBookings: TeamBooking[];
  stats: {
    totalMembers: number;
    activeMembers: number;
    todayBookingCount: number;
    weekRevenue: number;
    monthRevenue: number;
    pendingTimeOff: number;
  };
}

export default async function getTeamData(userId: string): Promise<TeamData> {
  // Find listings the user owns OR is an employee of
  const [ownedListings, employeeRecords] = await Promise.all([
    prisma.listing.findMany({
      where: { userId },
      select: { id: true, title: true, category: true, imageSrc: true },
    }),
    prisma.employee.findMany({
      where: { userId },
      select: { listingId: true },
    }),
  ]);

  // Combine owned + employed listing IDs (deduplicated)
  const employedListingIds = employeeRecords.map((e) => e.listingId);
  const allListingIds = Array.from(new Set([
    ...ownedListings.map((l) => l.id),
    ...employedListingIds,
  ]));

  // Fetch full listing details for any we don't already have
  const missingIds = allListingIds.filter(
    (id) => !ownedListings.some((l) => l.id === id)
  );
  const additionalListings = missingIds.length > 0
    ? await prisma.listing.findMany({
        where: { id: { in: missingIds } },
        select: { id: true, title: true, category: true, imageSrc: true },
      })
    : [];

  const listings = [...ownedListings, ...additionalListings];
  const listingIds = allListingIds;

  if (listingIds.length === 0) {
    return {
      members: [],
      listings: [],
      ownedListingIds: ownedListings.map((l) => l.id),
      todayBookings: [],
      upcomingBookings: [],
      stats: {
        totalMembers: 0,
        activeMembers: 0,
        todayBookingCount: 0,
        weekRevenue: 0,
        monthRevenue: 0,
        pendingTimeOff: 0,
      },
    };
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [employees, todayReservations, upcomingReservations, monthReservations, weekReservations, pendingTimeOff] =
    await Promise.all([
      // Team members
      prisma.employee.findMany({
        where: { listingId: { in: listingIds } },
        include: {
          user: {
            select: {
              id: true, name: true, image: true, imageSrc: true, email: true,
              stripeConnectPayoutsEnabled: true,
            },
          },
          availability: true,
          timeOffRequests: {
            where: { endDate: { gte: new Date() } },
            orderBy: { startDate: "asc" },
          },
          reservations: {
            where: {
              date: { gte: monthStart },
              status: { not: "declined" },
            },
            select: { totalPrice: true },
          },
          payAgreement: true,
        },
      }),

      // Today's bookings
      prisma.reservation.findMany({
        where: {
          listingId: { in: listingIds },
          date: { gte: todayStart, lt: todayEnd },
        },
        include: {
          user: { select: { name: true, image: true, imageSrc: true, email: true } },
          employee: { select: { id: true, fullName: true } },
        },
        orderBy: { time: "asc" },
      }),

      // Upcoming bookings (next 7 days, excluding today)
      prisma.reservation.findMany({
        where: {
          listingId: { in: listingIds },
          date: { gte: todayEnd, lt: new Date(todayStart.getTime() + 8 * 24 * 60 * 60 * 1000) },
        },
        include: {
          user: { select: { name: true, image: true, imageSrc: true, email: true } },
          employee: { select: { id: true, fullName: true } },
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
      }),

      // Month revenue
      prisma.reservation.aggregate({
        where: {
          listingId: { in: listingIds },
          date: { gte: monthStart },
          status: { not: "declined" },
        },
        _sum: { totalPrice: true },
      }),

      // Week revenue
      prisma.reservation.aggregate({
        where: {
          listingId: { in: listingIds },
          date: { gte: weekStart },
          status: { not: "declined" },
        },
        _sum: { totalPrice: true },
      }),

      // Pending time off count
      prisma.timeOffRequest?.count({
        where: {
          employee: { listingId: { in: listingIds } },
          status: "pending",
        },
      }).catch(() => 0) ?? Promise.resolve(0),
    ]);

  const members: TeamMember[] = employees.map((emp) => ({
    id: emp.id,
    fullName: emp.fullName,
    jobTitle: emp.jobTitle,
    userId: emp.userId,
    listingId: emp.listingId,
    serviceIds: emp.serviceIds,
    isActive: emp.isActive,
    isIndependent: emp.isIndependent,
    teamRole: emp.teamRole,
    createdAt: emp.createdAt.toISOString(),
    user: emp.user,
    availability: emp.availability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
      isOff: a.isOff,
    })),
    timeOffRequests: emp.timeOffRequests.map((t) => ({
      id: t.id,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate.toISOString(),
      reason: t.reason,
      status: t.status,
    })),
    upcomingBookings: todayReservations.filter((r) => r.employee?.id === emp.id).length +
      upcomingReservations.filter((r) => r.employee?.id === emp.id).length,
    monthlyRevenue: emp.reservations.reduce((sum, r) => sum + r.totalPrice, 0),
    payAgreement: emp.payAgreement ? {
      type: emp.payAgreement.type,
      splitPercent: emp.payAgreement.splitPercent,
      rentalAmount: emp.payAgreement.rentalAmount,
      rentalFrequency: emp.payAgreement.rentalFrequency,
      autoApprovePayout: emp.payAgreement.autoApprovePayout,
    } : null,
    stripeConnectSetup: emp.user?.stripeConnectPayoutsEnabled ?? false,
  }));

  const mapBooking = (r: typeof todayReservations[number]): TeamBooking => ({
    id: r.id,
    serviceName: r.serviceName,
    date: r.date.toISOString(),
    time: r.time,
    totalPrice: r.totalPrice,
    status: r.status,
    note: r.note,
    // Guest reservations have no linked user — fall back to the guest fields
    // captured at checkout. Image isn't stored for guests.
    clientName: r.user?.name ?? r.guestName ?? null,
    clientImage: r.user?.image || r.user?.imageSrc || null,
    clientEmail: r.user?.email ?? r.guestEmail ?? null,
    employeeName: r.employee?.fullName || "Unassigned",
    employeeId: r.employee?.id || "",
  });

  return {
    members,
    listings,
    ownedListingIds: ownedListings.map((l) => l.id),
    todayBookings: todayReservations.map(mapBooking),
    upcomingBookings: upcomingReservations.map(mapBooking),
    stats: {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.isActive).length,
      todayBookingCount: todayReservations.length,
      weekRevenue: weekReservations._sum.totalPrice || 0,
      monthRevenue: monthReservations._sum.totalPrice || 0,
      pendingTimeOff,
    },
  };
}
