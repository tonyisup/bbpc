import { db } from "@/server/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Episode } from "@/components/Episode";
import EpisodeResults from "@/components/EpisodeResults";

export const revalidate = 3600;

export async function generateStaticParams() {
  const episodes = await db.episode.findMany();
  return episodes.map((episode) => ({ id: episode.id }));
}

export default async function EpisodePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const episode = await db.episode.findUnique({
    where: { id: id },
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
              guesses: {
                include: {
                  user: true,
                  rating: true,
                },
              },
            },
          },
          gamblingPoints: {
            include: {
              user: true,
              gamblingType: true,
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
              show: true,
            },
          },
        },
      },
      links: true,
    },
  });

  if (!episode) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Episode not found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Episodes
          </Link>
        </Button>
      </div>
      {episode && <Episode episode={episode} />}
      {episode && <EpisodeResults assignments={episode.assignments} />}
    </div>
  );
} 