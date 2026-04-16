import { NextResponse } from "next/server";
import getPosts from "@/app/actions/getPost";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const params: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  const posts = await getPosts({
    ...params,
    filter: (params.filter as any) || 'for-you',
  });

  return NextResponse.json(posts);
}
