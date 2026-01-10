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

// Structured data types for schema.org
interface StructuredMovie {
  "@type": "Movie";
  name: string;
  url?: string;
  image?: string;
  dateCreated?: string;
  director?: {
    "@type": "Person";
    name: string;
  };
  review?: {
    "@type": "Review";
    reviewRating: {
      "@type": "Rating";
      ratingValue: number;
    };
    author: {
      "@type": "Person";
      name: string;
    };
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    bestRating: number;
    ratingCount: number;
  };
}

interface StructuredData {
  "@context": "https://schema.org";
  "@type": "ItemList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    item: StructuredMovie;
  }>;
}

export async function GET() {
  try {
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
            movie: true,
            user: true,
            assignmentReviews: {
              include: {
                review: {
                  include: {
                    rating: true,
                    user: true,
                  },
                },
              },
            },
          },
        },
        extras: {
          include: {
            review: {
              include: {
                movie: true,
                user: true,
              },
            },
          },
        },
        links: true,
      },
    });

    if (!episode) {
      return NextResponse.json({ error: "No episodes found." }, { status: 404 });
    }

    // Build structured data for movies
    const movieList: StructuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: episode.assignments.map((assignment, index) => {
        const movie = assignment.movie;
        const user = assignment.user;

        // Get the user's review for this movie if it exists
        const userReview = assignment.assignmentReviews[0]?.review;

        // Calculate aggregate rating from all reviews
        const allReviews = assignment.assignmentReviews.map(ar => ar.review);
        const totalRating = allReviews.reduce((sum, review) => sum + (review.rating?.value || 0), 0);
        const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

        const structuredMovie: StructuredMovie = {
          "@type": "Movie",
          name: movie.title,
          url: movie.url,
          image: movie.poster || undefined,
          dateCreated: movie.year ? `${movie.year}-01-01` : undefined,
          director: {
            "@type": "Person",
            name: "Unknown Director" // We don't have director info in the current schema
          },
          review: userReview ? {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: userReview.rating?.value || 0
            },
            author: {
              "@type": "Person",
              name: userReview.user?.name || "Anonymous"
            }
          } : undefined,
          aggregateRating: allReviews.length > 0 ? {
            "@type": "AggregateRating",
            ratingValue: Math.round(averageRating),
            bestRating: 5, // Assuming 5-star rating system based on Rating model
            ratingCount: allReviews.length
          } : undefined
        };

        return {
          "@type": "ListItem",
          position: index + 1,
          item: structuredMovie
        };
      })
    };

    return NextResponse.json(movieList);
  } catch (error) {
    console.error("Error fetching episode data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
            movie: true,
            user: true,
          },
        },
        extras: {
          include: {
            review: {
              include: {
                movie: true,
                user: true,
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
            `Movies assigned: ${episode.assignments.map(a => a.movie.title).join(" and ")}`
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
