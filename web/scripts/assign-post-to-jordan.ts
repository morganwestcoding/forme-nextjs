/**
 * Create Jordan Riley as a real user and reassign the existing post to them.
 *
 * Mirrors the SAMPLE_EMPLOYEES entry in DiscoverClient.tsx (Senior Stylist,
 * worker 1.png). The post's previous owner is left otherwise untouched.
 *
 * Usage:
 *   npx ts-node scripts/assign-post-to-jordan.ts            # dry run
 *   npx ts-node scripts/assign-post-to-jordan.ts --confirm  # actually write
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JORDAN = {
  name: "Jordan Riley",
  email: "jordan.riley@example.com",
  image: "/assets/people/worker 1.png",
  imageSrc: "/assets/people/worker 1.png",
  jobTitle: "Senior Stylist",
  userType: "individual",
  bio: "",
};

function describeTarget(): { host: string; database: string } {
  const url = process.env.DATABASE_URL || "";
  const sanitized = url.replace(/\/\/[^@]*@/, "//");
  const match = sanitized.match(/\/\/([^/?]+)\/([^?]+)/);
  return {
    host: match?.[1] ?? "(unknown)",
    database: match?.[2] ?? "(unknown)",
  };
}

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes("--confirm");
  const { host, database } = describeTarget();

  console.log("\n┌─────────────────────────────────────────────");
  console.log("│ ASSIGN POST → JORDAN RILEY");
  console.log("├─────────────────────────────────────────────");
  console.log(`│ host:     ${host}`);
  console.log(`│ database: ${database}`);
  console.log(`│ mode:     ${confirm ? "WRITE (live)" : "DRY RUN"}`);
  console.log("└─────────────────────────────────────────────\n");

  const posts = await prisma.post.findMany({
    select: {
      id: true,
      content: true,
      category: true,
      userId: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (posts.length === 0) {
    console.log("No posts in the database. Nothing to reassign.\n");
    return;
  }

  if (posts.length > 1) {
    console.log(`Found ${posts.length} posts — expected exactly 1. Aborting so I don't grab the wrong one:`);
    posts.forEach((p) => {
      const owner = p.user?.name || p.user?.email || "(unknown)";
      const preview = (p.content || "").slice(0, 60).replace(/\s+/g, " ");
      console.log(`  • ${p.id}  by ${owner}  [${p.category}]  "${preview}"`);
    });
    console.log("\nIf you want to target a specific post id, tell me which one.\n");
    return;
  }

  const post = posts[0];
  const previousOwner = post.user?.name || post.user?.email || "(unknown)";
  console.log("Target post:");
  console.log(`  id:       ${post.id}`);
  console.log(`  category: ${post.category}`);
  console.log(`  owner:    ${previousOwner} (${post.userId})`);
  console.log(`  content:  ${(post.content || "").slice(0, 100)}\n`);

  const existingJordan = await prisma.user.findUnique({
    where: { email: JORDAN.email },
    select: { id: true, name: true },
  });

  if (existingJordan) {
    console.log(`Found existing Jordan Riley user (id ${existingJordan.id}). Will reuse.\n`);
  } else {
    console.log("No existing Jordan Riley user — will create one.\n");
  }

  if (!confirm) {
    console.log("Dry run complete. Pass --confirm to actually write.\n");
    return;
  }

  const jordan = await prisma.user.upsert({
    where: { email: JORDAN.email },
    update: {
      name: JORDAN.name,
      image: JORDAN.image,
      imageSrc: JORDAN.imageSrc,
      jobTitle: JORDAN.jobTitle,
      userType: JORDAN.userType,
    },
    create: {
      email: JORDAN.email,
      name: JORDAN.name,
      image: JORDAN.image,
      imageSrc: JORDAN.imageSrc,
      jobTitle: JORDAN.jobTitle,
      userType: JORDAN.userType,
      bio: JORDAN.bio,
    },
    select: { id: true, name: true, email: true },
  });

  await prisma.post.update({
    where: { id: post.id },
    data: { userId: jordan.id },
  });

  console.log("─────────────────────────────────────────────");
  console.log("Done.");
  console.log(`  jordan.id:  ${jordan.id}`);
  console.log(`  post.id:    ${post.id}  → reassigned to Jordan Riley`);
  console.log(`  was owned by: ${previousOwner}`);
  console.log("─────────────────────────────────────────────\n");
}

main()
  .catch((err) => {
    console.error("Assign-post-to-jordan failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
