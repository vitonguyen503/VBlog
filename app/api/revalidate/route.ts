import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as {
    tag?: string;
    path?: string;
  };

  if (body.tag) revalidateTag(body.tag);
  if (body.path) revalidatePath(body.path);

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
