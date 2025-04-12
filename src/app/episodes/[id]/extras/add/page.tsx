'use client';

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import MovieFind from "@/components/MovieFind";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Movie } from "@prisma/client";

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Extra to Episode</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="movie" className="block text-sm font-medium mb-2">Movie</label>
          <MovieFind selectMovie={setMovie} />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/episodes/${episodeId}`)}
            className="rounded-md bg-gray-500 p-4 text-xs transition hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAddExtra}
            disabled={!reviewer?.data || !movie}
            className="rounded-md bg-red-800 p-4 text-xs transition hover:bg-red-400 disabled:bg-gray-600 disabled:text-gray-400"
          >
            Add Extra
          </button>
        </div>
      </div>
    </div>
  );
} 