// app/api/search/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

type Result = {
  id: string;
  type: "user" | "listing" | "post" | "shop" | "product" | "employee" | "service";
  title: string;          // main line
  subtitle?: string;      // secondary line
  image?: string | null;  // avatar/thumbnail if available
  href: string;           // where to navigate
};

function hrefFor(r: Result & { parentId?: string }): string {
  // ✅ Route users to /profile/:id (was /users/:id)
  switch (r.type) {
    case "user":
      return `/profile/${r.id}`;
    case "listing":
      return `/listings/${r.id}`;
    case "post":
      // Posts don't have a dedicated page - route to feed/discover
      return `/feed`;
    case "shop":
      return `/shops/${r.id}`;
    case "product":
      // Products are nested under shops: /shops/[shopId]/products/[productId]
      return r.parentId ? `/shops/${r.parentId}` : `/shops`;
    case "employee":
      // Employees are nested under listings: /listings/[listingId]/employees/[employeeId]
      return r.parentId ? `/listings/${r.parentId}` : `/listings`;
    case "service":
      // Services are nested under listings: /listings/[listingId]/services/[serviceId]
      return r.parentId ? `/listings/${r.parentId}` : `/listings`;
    default:
      return "/";
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQ = (searchParams.get("q") || "").trim();
  // Normalize smart quotes from iOS keyboards
  const q = rawQ
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const LIMIT = 5; // per-entity cap

  try {
    const [
      users,
      listings,
      posts,
      shops,
      products,
      employees,
      services,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, email: true, image: true, imageSrc: true, location: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.listing.findMany({
        where: { title: { contains: q, mode: "insensitive" } },
        select: { id: true, title: true, category: true, location: true, imageSrc: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.findMany({
        where: { content: { contains: q, mode: "insensitive" } },
        select: { id: true, content: true, category: true, mediaUrl: true, mediaType: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.shop.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, category: true, logo: true, location: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, mainImage: true, price: true, shopId: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.employee.findMany({
        where: { fullName: { contains: q, mode: "insensitive" } },
        select: {
          id: true,
          fullName: true,
          jobTitle: true,
          listingId: true,
          listing: { select: { title: true } },
          user: {
            select: {
              imageSrc: true,
              image: true,
              backgroundImage: true,
            }
          },
        },
        take: LIMIT,
      }),
      prisma.service.findMany({
        where: {
          OR: [
            { serviceName: { contains: q, mode: "insensitive" } },
            { listing: { is: { title: { contains: q, mode: "insensitive" } } } },
          ],
        },
        select: {
          id: true,
          serviceName: true,
          price: true,
          category: true,
          listingId: true,
          listing: { select: { title: true, imageSrc: true, location: true } },
        },
        take: LIMIT,
      }),
    ]);

    const results: Result[] = [
      ...users.map((u: typeof users[number]) => ({
        id: u.id,
        type: "user" as const,
        title: u.name || u.email || "User",
        subtitle: u.location || u.email || "",
        image: u.imageSrc || u.image || null,
        href: "",
      })),
      ...listings.map((l: typeof listings[number]) => ({
        id: l.id,
        type: "listing" as const,
        title: l.title,
        subtitle: [l.category, l.location].filter(Boolean).join(" • "),
        image: l.imageSrc,
        href: "",
      })),
      ...posts.map((p: typeof posts[number]) => ({
        id: p.id,
        type: "post" as const,
        title: p.content?.slice(0, 80) || "Post",
        subtitle: [p.category, p.mediaType].filter(Boolean).join(" • "),
        image: p.mediaUrl || null,
        href: "",
      })),
      ...shops.map((s: typeof shops[number]) => ({
        id: s.id,
        type: "shop" as const,
        title: s.name,
        subtitle: [s.category, s.location].filter(Boolean).join(" • "),
        image: s.logo,
        href: "",
      })),
      ...products.map((p: typeof products[number]) => ({
        id: p.id,
        type: "product" as const,
        title: p.name,
        subtitle: p.price != null ? `$${Number(p.price).toFixed(2)}` : "",
        image: p.mainImage,
        href: "",
        parentId: p.shopId,
      })),
      ...employees.map((e: typeof employees[number]) => ({
        id: e.id,
        type: "employee" as const,
        title: e.fullName,
        subtitle: [e.jobTitle, e.listing?.title].filter(Boolean).join(" • "),
        image: e.user?.imageSrc || e.user?.image || null, // Use user's profile image
        href: "",
        parentId: e.listingId,
      })),
      ...services.map((s: typeof services[number]) => ({
        id: s.id,
        type: "service" as const,
        title: s.serviceName,
        subtitle: [s.category, s.listing?.title, s.price != null ? `$${s.price}` : ""]
          .filter(Boolean)
          .join(" • "),
        image: s.listing?.imageSrc || null,
        href: "",
        parentId: s.listingId,
      })),
    ].map((r) => ({ ...r, href: hrefFor(r) }));

    return NextResponse.json({ results });
  } catch (e: any) {
    console.error("[SEARCH_API_ERROR]", e?.message || e);
    // Return 200 with empty results so clients don't break
    return NextResponse.json({ results: [], error: e?.message || "Search failed" });
  }
}