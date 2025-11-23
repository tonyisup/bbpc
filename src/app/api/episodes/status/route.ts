import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { triggerWebhooks } from "@/server/webhooks";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-admin-api-key");
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { episodeId, status } = body;

    if (!episodeId || !status) {
      return NextResponse.json({ error: "Missing episodeId or status" }, { status: 400 });
    }

    // Fetch current episode to check old status
    const currentEpisode = await db.episode.findUnique({
      where: { id: episodeId },
    });

    if (!currentEpisode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    const oldStatus = currentEpisode.status;

    // Update the episode status
    const updatedEpisode = await db.episode.update({
      where: { id: episodeId },
      data: { status },
      include: {
        assignments: {
          include: {
            Movie: true,
          }
        }
      }
    });

    // Determine event
    let event = null;
    if (oldStatus === "pending" && status === "next") {
      event = "episode.scheduled";
    } else if (oldStatus === "next" && status === "published") {
      event = "episode.published";
    }

    if (event) {
      // Trigger webhooks asynchronously
      await triggerWebhooks(event, updatedEpisode);
    }

    return NextResponse.json(updatedEpisode);
  } catch (error) {
    console.error("Error updating episode status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
