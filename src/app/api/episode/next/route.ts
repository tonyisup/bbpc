import { NextResponse } from "next/server";
import { createTRPCContext } from "@/server/api/trpc";

export async function GET() {
  try {
    // Create a tRPC context
    const ctx = await createTRPCContext();
    
    // Call the database query directly (same logic as episode.next)
    const result = await ctx.db.episode.findFirst({
      orderBy: {
        number: 'desc',
      },
      include: {
        assignments: {
          include: {
            Movie: true,
            User: true,
            assignmentReviews: {
              include: {
                Review: {
                  include: {
                    Rating: true,
                  },
                },
              },
            },
          },
        },
        extras: {
          include: {
            Review: {
              include: {
                Movie: true,
                User: true,
              },
            },
          },
        },
        links: true,
      },
    });
    
    // Return the result as JSON
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching next episode:", error);
    return NextResponse.json(
      { error: "Failed to fetch next episode" },
      { status: 500 }
    );
  }
}
