// app/api/search/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

type Result = {
  id: string;
  type: "user" | "listing" | "post" | "shop" | "product";
  title: string;          // main line
  subtitle?: string;      // secondary line
  image?: string | null;  // avatar/thumbnail if available
  href: string;           // where to navigate
};

function hrefFor(r: Result): string {
  // Adjust these routes to match your app
  switch (r.type) {
    case "user":
      return `/users/${r.id}`;
    case "listing":
      return `/listings/${r.id}`;
    case "post":
      return `/posts/${r.id}`;
    case "shop":
      return `/shops/${r.id}`;
    case "product":
      return `/products/${r.id}`;
    default:
      return "/";
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Limits per section to keep response snappy
  const LIMIT = 5;

  try {
    // NOTE: Using simple contains filters for Mongo via Prisma.
    // For very large datasets, consider adding MongoDB text indexes
    // and using a custom aggregation route.

    const [users, listings, posts, shops, products] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true, image: true, location: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.listing.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
            { zipCode: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, category: true, location: true, imageSrc: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.findMany({
        where: {
          OR: [
            { content: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { tag: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, content: true, category: true, mediaUrl: true, mediaType: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.shop.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { location: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
            { zipCode: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, category: true, logo: true, location: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            // Mongo string[]: use "hasSome" to check tags overlap
            { tags: { hasSome: [q] } },
          ],
        },
        select: { id: true, name: true, mainImage: true, price: true },
        take: LIMIT,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const results: Result[] = [
      ...users.map((u) => ({
        id: u.id,
        type: "user" as const,
        title: u.name || u.email || "User",
        subtitle: u.location || u.email || "",
        image: u.image || null,
        href: "", // fill later
      })),
      ...listings.map((l) => ({
        id: l.id,
        type: "listing" as const,
        title: l.title,
        subtitle: [l.category, l.location].filter(Boolean).join(" • "),
        image: l.imageSrc,
        href: "",
      })),
      ...posts.map((p) => ({
        id: p.id,
        type: "post" as const,
        title: p.content?.slice(0, 80) || "Post",
        subtitle: [p.category, p.mediaType].filter(Boolean).join(" • "),
        image: p.mediaUrl || null,
        href: "",
      })),
      ...shops.map((s) => ({
        id: s.id,
        type: "shop" as const,
        title: s.name,
        subtitle: [s.category, s.location].filter(Boolean).join(" • "),
        image: s.logo,
        href: "",
      })),
      ...products.map((p) => ({
        id: p.id,
        type: "product" as const,
        title: p.name,
        subtitle: p.price != null ? `$${p.price.toFixed(2)}` : "",
        image: p.mainImage,
        href: "",
      })),
    ].map((r) => ({ ...r, href: hrefFor(r) }));

    return NextResponse.json({ results });
  } catch (e) {
    console.error("[SEARCH_API_ERROR]", e);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
