'use client';

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import type { Movie } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MovieFind from "@/components/MovieFind";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import ShowFind from "@/components/ShowFind";
import type { Show } from "@prisma/client";

export default function AddExtraPage() {
  const [type, setType] = useState("movie");
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;

  const reviewer = api.user.me.useQuery();

  const addExtraMovie = api.review.addMovie.useMutation({
    onSuccess: () => {
      router.back();
    }
  });

  const addExtraShow = api.review.addShow.useMutation({
    onSuccess: () => {
      router.back();
    }
  });

  const handleAddExtraMovie = (movie: Movie) => {
    if (!movie) return;
    if (!reviewer?.data) return;

    addExtraMovie.mutate({
      userId: reviewer.data.id,
      movieId: movie.id,
      episodeId: episodeId
    });
  };

  const handleAddExtraShow = (show: Show) => {
    if (!show) return;
    if (!reviewer?.data) return;

    addExtraShow.mutate({
      userId: reviewer.data.id,
      showId: show.id,
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
        <RadioGroup
          value={type}
          onValueChange={setType}
          className="flex justify-between items-center gap-2 p-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="movie" id="movie" />
            <label htmlFor="movie">Movie</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="show" id="show" />
            <label htmlFor="show">TV Show</label>
          </div>
        </RadioGroup>
      </div>
      <div>
        {type == "movie" && <MovieFind selectMovie={handleAddExtraMovie} />}
        {type == "show" && <ShowFind selectShow={handleAddExtraShow} />}
      </div>
    </div>
  );
} 