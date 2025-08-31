import { NextRequest, NextResponse } from "next/server";
import { createTRPCContext } from "@/server/api/trpc";

// Dialogflow webhook request/response types
interface WebhookRequest {
  queryResult: {
    intent: {
      displayName: string;
    };
    parameters?: Record<string, any>;
  };
}

interface WebhookResponse {
  fulfillmentMessages: Array<{
    text: {
      text: string[];
    };
  }>;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the webhook request
    const webhookRequest: WebhookRequest = await req.json();
    
    // Create a tRPC context
    const ctx = await createTRPCContext();
    
    // Get the next episode data
    const episode = await ctx.db.episode.findFirst({
      orderBy: {
        number: 'desc',
      },
      include: {
        assignments: {
          include: {
            Movie: true,
            User: true,
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

    if (!episode) {
      const response: WebhookResponse = {
        fulfillmentMessages: [{
          text: {
            text: ["No episodes found."]
          }
        }]
      };
      return NextResponse.json(response);
    }
    
    const response: WebhookResponse = {
      fulfillmentMessages: [{
        text: {
          text: [
            `Movies assigned: ${episode.assignments.map(a => a.Movie.title).join(" and ")}`
          ]
        }
      }]
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing webhook:", error);
    const errorResponse: WebhookResponse = {
      fulfillmentMessages: [{
        text: {
          text: ["Sorry, I encountered an error while fetching episode information."]
        }
      }]
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
