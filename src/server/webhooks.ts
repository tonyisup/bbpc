import { db } from "@/server/db";
import crypto from "crypto";

export async function triggerWebhooks(event: string, payload: any) {
  const subscriptions = await db.webhookSubscription.findMany();

  const matchingSubscriptions = subscriptions.filter(sub => {
    const events = sub.events.split(",");
    return events.includes(event);
  });

  const promises = matchingSubscriptions.map(async (sub) => {
    try {
      const signature = crypto
        .createHmac("sha256", sub.secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      await fetch(sub.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": event,
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(`Failed to send webhook to ${sub.url}`, error);
    }
  });

  await Promise.all(promises);
}
