'use client';

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import MovieFind from "@/components/MovieFind";
import { useRouter } from "next/navigation";
import type { Movie } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddExtraPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const reviewer = api.user.me.useQuery();

  const addExtra = api.review.add.useMutation({
    onSuccess: () => {
      router.back();
    }
  });

  const handleAddExtra = (movie: Movie) => {
    if (!movie) return;
    if (!reviewer?.data) return;

    addExtra.mutate({
      userId: reviewer.data.id,
        movieId: movie.id,
      episodeId: episodeId
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-4">
        <Button variant="ghost"
          onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="movie" className="sr-only">Selected Movie</label>
          <MovieFind selectMovie={handleAddExtra} />
        </div>
      </div>
    </div>
  );
} 