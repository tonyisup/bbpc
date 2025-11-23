import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import crypto from 'crypto';

function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-admin-api-key");
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscriptions = await db.webhookSubscription.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error listing subscriptions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-admin-api-key");
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url, events } = body;

    if (!url || !events) {
      return NextResponse.json({ error: "Missing url or events" }, { status: 400 });
    }

    const eventsString = Array.isArray(events) ? events.join(',') : events;
    const secret = generateSecret();

    const subscription = await db.webhookSubscription.create({
      data: {
        url,
        events: eventsString,
        secret
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const apiKey = req.headers.get("x-admin-api-key");
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await db.webhookSubscription.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
