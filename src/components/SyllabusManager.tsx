'use client';

import { type FC, useState } from "react";
import type { Movie, Syllabus } from "@prisma/client";
import { api } from "@/trpc/react";
import { Button } from "./ui/button";
import { X, ArrowUp, ArrowDown, Plus } from "lucide-react";
import MovieFind from "./MovieFind";
import MovieInlinePreview from "./MovieInlinePreview";

interface SyllabusManagerProps {
  initialSyllabus: (Syllabus & {
    Movie: Movie;
  })[];
  userId: string;
}

const SyllabusManager: FC<SyllabusManagerProps> = ({ initialSyllabus, userId }) => {
  const [syllabus, setSyllabus] = useState(initialSyllabus);
  const [showMovieSearch, setShowMovieSearch] = useState(false);

  const { mutate: addToSyllabus } = api.syllabus.add.useMutation({
    onSuccess: (newSyllabus) => {
      setSyllabus([newSyllabus, ...syllabus]);
      setShowMovieSearch(false);
    }
  });

  const { mutate: removeFromSyllabus } = api.syllabus.remove.useMutation({
    onSuccess: (removedId) => {
      setSyllabus(syllabus.filter(item => item.id !== removedId));
    }
  });

  const { mutate: reorderSyllabus } = api.syllabus.reorder.useMutation({
    onSuccess: (updatedSyllabus) => {
      setSyllabus(updatedSyllabus);
    }
  });

  const handleAddMovie = (movie: Movie) => {
    addToSyllabus({
      userId,
      movieId: movie.id,
      order: syllabus.length
    });
  };

  const handleRemoveMovie = (syllabusId: string) => {
    removeFromSyllabus({ id: syllabusId });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSyllabus = [...syllabus];
    const current = newSyllabus[index];
    const previous = newSyllabus[index - 1];
    if (current && previous) {
      newSyllabus[index] = previous;
      newSyllabus[index - 1] = current;
      reorderSyllabus({
        userId,
        syllabus: newSyllabus.map((item, i) => ({
          id: item.id,
          order: i
        }))
      });
    }
  };

  const handleMoveDown = (index: number) => {
    if (index === syllabus.length - 1) return;
    const newSyllabus = [...syllabus];
    const current = newSyllabus[index];
    const next = newSyllabus[index + 1];
    if (current && next) {
      newSyllabus[index] = next;
      newSyllabus[index + 1] = current;
      reorderSyllabus({
        userId,
        syllabus: newSyllabus.map((item, i) => ({
          id: item.id,
          order: i
        }))
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl">
      <div className="flex justify-center items-center">
        {!showMovieSearch && <Button
          variant="outline"
          onClick={() => setShowMovieSearch(true)}
        >
          Add Movie
        </Button>}
        {showMovieSearch && <Button
          variant="outline"
          onClick={() => setShowMovieSearch(false)}
        >
          Cancel
        </Button>}
      </div>


      {showMovieSearch && (
        <MovieFind selectMovie={handleAddMovie} />
      )}
      <div className="flex flex-col gap-4 w-[480px]">
        {syllabus.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 rounded-lg"
          >
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMoveDown(index)}
                disabled={index === syllabus.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                {item.Movie.poster && (
                  <MovieInlinePreview movie={item.Movie} />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold break-words">{item.Movie.title}</h3>
                  <p className="text-gray-400">{item.Movie.year}</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMovie(item.id)}
            >
              <X className="text-red-500 h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusManager; 