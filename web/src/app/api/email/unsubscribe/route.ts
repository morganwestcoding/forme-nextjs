// app/api/email/unsubscribe/route.ts
// One-click unsubscribe endpoint. Linked from marketing emails.
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { apiError } from "@/app/utils/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const type = searchParams.get("type"); // "notifications" | "marketing" | "all"

    if (!email) {
      return apiError("Missing email parameter", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists
      return new NextResponse(unsubscribedHtml("You have been unsubscribed."), {
        headers: { "Content-Type": "text/html" },
      });
    }

    const data: Record<string, boolean> = {};
    if (type === "notifications" || type === "all") {
      data.emailNotifications = false;
    }
    if (type === "marketing" || type === "all" || !type) {
      data.emailMarketing = false;
    }

    await prisma.user.update({ where: { id: user.id }, data });

    return new NextResponse(unsubscribedHtml("You have been unsubscribed. You can re-enable emails in your account settings."), {
      headers: { "Content-Type": "text/html" },
    });
  } catch {
    return apiError("Something went wrong", 500);
  }
}

function unsubscribedHtml(message: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafaf9;">
  <div style="text-align: center; max-width: 400px; padding: 40px;">
    <h2 style="color: #1c1917; margin-bottom: 8px;">Email Preferences Updated</h2>
    <p style="color: #78716c;">${message}</p>
  </div>
</body></html>`;
}
