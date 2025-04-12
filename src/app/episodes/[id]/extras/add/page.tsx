'use client';

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import MovieFind from "@/components/MovieFind";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Movie } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddExtraPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const reviewer = api.user.me.useQuery();
  const [movie, setMovie] = useState<Movie | null>(null);

  const addExtra = api.review.add.useMutation({
    onSuccess: () => {
      router.push(`/episodes/${episodeId}`);
    }
  });

  const handleAddExtra = () => {
    if (reviewer?.data && movie) {
      addExtra.mutate({
        userId: reviewer.data.id,
        movieId: movie.id,
        episodeId: episodeId
      });
    }
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
      <h1 className="text-2xl font-bold mb-4">Add Extra to Episode</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="movie" className="block text-sm font-medium mb-2">Movie</label>
          <MovieFind selectMovie={setMovie} />
        </div>
      </div>
    </div>
  );
} 