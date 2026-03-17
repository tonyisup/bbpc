import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Episode } from "@/components/Episode";
import EpisodeResults from "@/components/EpisodeResults";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { db } from "@/server/db";
import { getEpisodePath } from "@/lib/routes";
import { resolveEpisodeRouteParam } from "@/server/slugs";

export const revalidate = 3600;

export async function generateStaticParams() {
  const episodes = await db.episode.findMany({
    where: { slug: { not: null } },
    select: { slug: true },
  });

  return episodes
    .filter((episode): episode is { slug: string } => !!episode.slug)
    .map((episode) => ({ slug: episode.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { episode } = await resolveEpisodeRouteParam(slug);

  if (!episode) {
    return { title: "Episode Not Found | BBPC" };
  }

  const title = episode.title || `Episode ${episode.number || episode.id}`;
  const description =
    episode.description ||
    `Discussion and analysis for episode ${episode.number || episode.id}.`;

  return {
    title: `${title} | BBPC`,
    description: description,
    alternates: episode.slug
      ? {
          canonical: getEpisodePath(episode.slug),
        }
      : undefined,
    openGraph: {
      title: `${title} | BBPC`,
      description: description,
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { episode, shouldRedirect } = await resolveEpisodeRouteParam(slug);

  if (shouldRedirect && episode?.slug) {
    permanentRedirect(getEpisodePath(episode.slug));
  }

  if (!episode) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Episodes
          </Link>
        </Button>
      </div>
      <Episode episode={episode} />
      <EpisodeResults assignments={episode.assignments} />
    </div>
  );
}
