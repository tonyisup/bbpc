import { getServerAuthSession } from "@/server/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerAuthSession();

  if (session) {
    return NextResponse.json({
      content:
        "This is protected content. You can access this content because you are signed in.",
    });
  }

  return NextResponse.json(
    {
      error: "You must be signed in to view the protected content on this page.",
    },
    { status: 401 }
  );
} 