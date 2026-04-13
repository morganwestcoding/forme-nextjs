// app/api/search/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

type Result = {
  id: string;
  type: "user" | "listing" | "post" | "shop" | "product" | "employee" | "service";
  title: string;
  subtitle?: string;
  image?: string | null;
  href: string;
};

function hrefFor(r: Result & { parentId?: string }): string {
  switch (r.type) {
    case "user":
      return `/profile/${r.id}`;
    case "listing":
      return `/listings/${r.id}`;
    case "post":
      return `/feed`;
    case "shop":
      return `/shops/${r.id}`;
    case "product":
      return r.parentId ? `/shops/${r.parentId}` : `/shops`;
    case "employee":
      return r.parentId ? `/listings/${r.parentId}` : `/listings`;
    case "service":
      return r.parentId ? `/listings/${r.parentId}` : `/listings`;
    default:
      return "/";
  }
}

// Safe query wrapper — returns empty array on failure
async function safeQuery<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (e) {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQ = (searchParams.get("q") || "").trim();
  const q = rawQ
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const LIMIT = 5;

  const [users, listings, posts, shops, products, employees, services] = await Promise.all([
    safeQuery(() => prisma.user.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, email: true, image: true, imageSrc: true, location: true },
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    })),
    safeQuery(() => prisma.listing.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, category: true, location: true, imageSrc: true },
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    })),
    safeQuery(() => prisma.post.findMany({
      where: { content: { contains: q, mode: "insensitive" } },
      select: { id: true, content: true, category: true, mediaUrl: true, mediaType: true },
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    })),
    safeQuery(() => prisma.shop.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, category: true, logo: true, location: true },
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    })),
    safeQuery(() => prisma.product.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, mainImage: true, price: true, shopId: true },
      take: LIMIT,
      orderBy: { createdAt: "desc" },
    })),
    safeQuery(() => prisma.employee.findMany({
      where: { fullName: { contains: q, mode: "insensitive" } },
      select: { id: true, fullName: true, jobTitle: true, listingId: true,
        user: { select: { imageSrc: true, image: true } },
      },
      take: LIMIT,
    })),
    safeQuery(() => prisma.service.findMany({
      where: { serviceName: { contains: q, mode: "insensitive" } },
      select: { id: true, serviceName: true, price: true, category: true, listingId: true,
        listing: { select: { title: true, imageSrc: true, location: true } },
      },
      take: LIMIT,
    })),
  ]);

  const results: Result[] = [
    ...users.map((u: any) => ({
      id: u.id, type: "user" as const,
      title: u.name || u.email || "User",
      subtitle: u.location || u.email || "",
      image: u.imageSrc || u.image || null,
      href: "",
    })),
    ...listings.map((l: any) => ({
      id: l.id, type: "listing" as const,
      title: l.title,
      subtitle: [l.category, l.location].filter(Boolean).join(" • "),
      image: l.imageSrc,
      href: "",
    })),
    ...posts.map((p: any) => ({
      id: p.id, type: "post" as const,
      title: p.content?.slice(0, 80) || "Post",
      subtitle: [p.category, p.mediaType].filter(Boolean).join(" • "),
      image: p.mediaUrl || null,
      href: "",
    })),
    ...shops.map((s: any) => ({
      id: s.id, type: "shop" as const,
      title: s.name,
      subtitle: [s.category, s.location].filter(Boolean).join(" • "),
      image: s.logo,
      href: "",
    })),
    ...products.map((p: any) => ({
      id: p.id, type: "product" as const,
      title: p.name,
      subtitle: p.price != null ? `$${Number(p.price).toFixed(2)}` : "",
      image: p.mainImage,
      href: "",
      parentId: p.shopId,
    })),
    ...employees.map((e: any) => ({
      id: e.id, type: "employee" as const,
      title: e.fullName,
      subtitle: e.jobTitle || "",
      image: e.user?.imageSrc || e.user?.image || null,
      href: "",
      parentId: e.listingId,
    })),
    ...services.map((s: any) => ({
      id: s.id, type: "service" as const,
      title: s.serviceName,
      subtitle: [s.category, s.listing?.title, s.price != null ? `$${s.price}` : ""].filter(Boolean).join(" • "),
      image: s.listing?.imageSrc || null,
      href: "",
      parentId: s.listingId,
    })),
  ].map((r) => ({ ...r, href: hrefFor(r) }));

  return NextResponse.json({ results });
}
