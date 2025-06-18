'use client';

import { type FC, useState } from "react";
import type { Movie, Syllabus, Assignment, Episode } from "@prisma/client";
import { api } from "@/trpc/react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X, ArrowUp, ArrowDown, Edit3, Save, X as XIcon } from "lucide-react";
import MovieFind from "./MovieFind";
import MovieInlinePreview from "./MovieInlinePreview";

interface SyllabusManagerProps {
  initialSyllabus: (Syllabus & {
    Movie: Movie;
    Assignment: (Assignment & {
      Episode: Episode;
    }) | null;
  })[];
  userId: string;
}

const SyllabusManager: FC<SyllabusManagerProps> = ({ initialSyllabus, userId }) => {
  const [syllabus, setSyllabus] = useState(initialSyllabus);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>("");

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

  const { mutate: updateNotes } = api.syllabus.updateNotes.useMutation({
    onSuccess: (updatedSyllabus) => {
      setSyllabus(syllabus.map(item => 
        item.id === updatedSyllabus.id ? updatedSyllabus : item
      ));
      setEditingNotes(null);
      setNotesText("");
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

  const handleStartEditNotes = (syllabusId: string, currentNotes: string | null) => {
    setEditingNotes(syllabusId);
    setNotesText(currentNotes ? currentNotes : "");
  };

  const handleSaveNotes = (syllabusId: string) => {

    updateNotes({
      id: syllabusId,
      notes: notesText?.trim() || undefined
    });
  };

  const handleCancelEditNotes = () => {
    setEditingNotes(null);
    setNotesText("");
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
      <div className="flex flex-col gap-4 w-full">
        {syllabus.filter(item => item.assignmentId === null).map((item, index) => (
          <div
            key={item.id}
            className="flex items-start gap-4 p-4 rounded-lg border"
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
              <div className="flex items-center gap-4 mb-2">
                {item.Movie.poster && (
                  <MovieInlinePreview movie={item.Movie} />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold break-words">{item.Movie.title}</h3>
                  <p className="text-gray-400">{item.Movie.year}</p>
                </div>
              </div>
              
              {/* Notes Section */}
              <div className="mt-3">
                {editingNotes === item.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={notesText ?? ""}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Add your notes here..."
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveNotes(item.id)}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditNotes}
                      >
                        <XIcon className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      {item.notes ? (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.notes}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No notes yet</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEditNotes(item.id, item.notes)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
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
      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-lg font-semibold">Assigned</h2>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {syllabus.filter(item => item.assignmentId !== null).map((item) => (
          <div key={item.id} className="flex-1 p-4 rounded-lg border">
            <div className="flex items-center gap-4 mb-2">
              {item.Movie.poster && (
                <MovieInlinePreview movie={item.Movie} />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold break-words">{item.Movie.title}</h3>
                <p className="text-gray-400">{item.Movie.year}</p>
              </div>
              <p>Reviewed in Episode {item.Assignment?.Episode.number} - {item.Assignment?.Episode.title}</p>
            </div>
            
            {/* Notes Section for Assigned Items */}
            {item.notes && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SyllabusManager; 